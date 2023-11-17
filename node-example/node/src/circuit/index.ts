import {
  AxiomCircuitRunner,
  DEFAULT_CIRCUIT_CONFIG,
  autoConfigCircuit,
} from "@axiom-crypto/core/halo2-js";
import {
  getHalo2Wasm,
  getHalo2LibWasm,
  Halo2LibWasm,
  CircuitScaffold,
  CircuitConfig,
} from "@axiom-crypto/core/halo2-js/js";
import {
  Axiom,
  AxiomV2Callback,
  AxiomV2ComputeQuery,
  AxiomV2DataQuery,
  BuiltQueryV2,
  DataSubquery,
  QueryBuilderV2,
  QueryV2,
} from "@axiom-crypto/core";
import { ethers, keccak256, solidityPacked } from "ethers";
import { convertToBytes, convertToBytes32 } from "../utils";
import { MyCircuitCode, MyInputs } from "./circuit";

export class MyAxiomCircuit extends CircuitScaffold {
  private provider: ethers.JsonRpcProvider;
  private halo2Lib!: Halo2LibWasm;
  private myCircuitCode: MyCircuitCode;

  private vkey?: Uint8Array;
  private pkey?: Uint8Array;
  private resultLen?: number;
  private subqueries?: DataSubquery[];

  /// Construct your circuit by providing a JSON-RPC provider URL along with your circuit code.
  constructor(provider: string, myCircuitCode: MyCircuitCode) {
    super({ shouldTime: false });
    this.provider = new ethers.JsonRpcProvider(provider);
    this.config = DEFAULT_CIRCUIT_CONFIG;
    this.config.numVirtualInstance = 2;
    this.myCircuitCode = myCircuitCode;
  }

  /// Constructors cannot be async, so the rest of the setup is here.
  async setup() {
    this.halo2wasm = await getHalo2Wasm(0);
    super.newCircuitFromConfig(this.config);
    if (this.halo2Lib) this.halo2Lib.free();
    this.halo2Lib = getHalo2LibWasm(this.halo2wasm);
  }

  /// Finds optimal configuration for your circuit to give best proving times.
  async tune() {
    autoConfigCircuit(this.halo2wasm, this.config);
  }

  loadPrebuilt(config: CircuitConfig, pkey: Uint8Array, vkey: Uint8Array) {
    this.config = config;
    this.pkey = pkey;
    this.vkey = vkey;
    super.loadParams();
    this.halo2wasm.loadPk(pkey);
    this.halo2wasm.loadVk(vkey);
  }

  /// The circuit needs a default input to be able to run once and precompute
  /// some information (this is called the proving key).
  async build(defaultInputs: MyInputs) {
    const { results } = await AxiomCircuitRunner(
      this.halo2wasm,
      this.halo2Lib,
      this.config,
      this.provider,
    ).build(this.myCircuitCode, defaultInputs as any);
    this.tune();
    // configuration may have changed after tuning, so rebuild
    this.newCircuitFromConfig(this.config);
    const { numUserInstances } = await AxiomCircuitRunner(
      this.halo2wasm,
      this.halo2Lib,
      this.config,
      this.provider,
    ).run(this.myCircuitCode, defaultInputs as any, results);
    await this.keygen();

    this.resultLen = numUserInstances / 2;
    this.vkey = this.halo2wasm.getVk();
    this.pkey = this.halo2wasm.getPk();
  }

  async run(inputs: MyInputs) {
    const runner = AxiomCircuitRunner(
      this.halo2wasm,
      this.halo2Lib,
      this.config,
      this.provider,
    );
    // Runs my code once and uses SDK to get JSON-RPC data to populate the circuit
    const { orderedDataQuery, results } = await runner.build(
      this.myCircuitCode,
      inputs as any,
    );
    const { numUserInstances } = await runner.run(
      this.myCircuitCode,
      inputs as any,
      results,
    );

    this.prove();

    this.resultLen = numUserInstances / 2;
    this.subqueries = orderedDataQuery;
  }

  getProvingKey(): Uint8Array {
    if (!this.pkey) throw new Error("You need to build your circuit first!");
    return this.pkey;
  }

  getVerifyingKey(): Uint8Array {
    if (!this.vkey) throw new Error("You need to build your circuit first!");
    return this.vkey;
  }

  private getPartialVkey(): string[] {
    if (!this.vkey) throw new Error("You need to build your circuit first!");
    const vkey = this.halo2wasm.getPartialVk();
    return convertToBytes32(vkey);
  }

  getQuerySchema(): string {
    if (!this.vkey) throw new Error("You need to build your circuit first!");
    const partialVk = this.halo2wasm.getPartialVk();
    const vk = convertToBytes32(partialVk);
    const packed = solidityPacked(
      ["uint8", "uint16", "uint8", "bytes32[]"],
      [this.config.k, this.resultLen, vk.length, vk],
    );
    return keccak256(packed);
  }

  private getComputeProof() {
    if (!this.proof || !this.resultLen) throw new Error("No proof generated");
    let proofString = "";
    const instances = this.getInstances();
    for (let i = 0; i < this.resultLen; i++) {
      const instanceHi = BigInt(instances[2 * i]);
      const instanceLo = BigInt(instances[2 * i + 1]);
      const instance = instanceHi * BigInt(2 ** 128) + instanceLo;
      const instanceString = instance.toString(16).padStart(64, "0");
      proofString += instanceString;
    }
    proofString += convertToBytes(this.proof);
    return "0x" + proofString;
  }

  getComputeQuery(): AxiomV2ComputeQuery {
    const vkey = this.getPartialVkey();
    const computeProof = this.getComputeProof();
    return {
      k: this.config.k,
      resultLen: this.resultLen as number,
      vkey,
      computeProof,
    };
  }

  async getDataQuery(): Promise<AxiomV2DataQuery> {
    if (!this.subqueries) {
      throw new Error("You must run your circuit first!");
    }
    const network = await this.provider.getNetwork();
    const sourceChainId = network.chainId.toString();
    return {
      sourceChainId,
      subqueries: this.subqueries,
    };
  }

  async generateQuery(
    axiom: Axiom,
    callback: AxiomV2Callback,
  ): Promise<{
    query: QueryBuilderV2;
    builtQuery: BuiltQueryV2;
    payment: string;
  }> {
    const dataQuery = await this.getDataQuery();
    const computeQuery = this.getComputeQuery();
    const query = (axiom.query as QueryV2).new();
    query.setBuiltDataQuery(dataQuery);
    query.setComputeQuery(computeQuery);
    query.setCallback(callback);

    const built = await query.build();
    // Calculates the fee (in wei) required to send the query
    const payment = await query.calculateFee();

    return {
      query,
      builtQuery: built,
      payment,
    };
  }
}
