import {
  Halo2Lib,
  AxiomData,
  CircuitValue,
  CircuitValue256,
} from "@axiom-crypto/core/halo2-js";

/// These should be the _variable_ inputs to your circuit. Constants can be hard-coded into the circuit itself (see below).
/// They will be auto-parsed into `MyCircuitInputs` type.
export interface MyInputs {
  blockNumber: number;
  keystoreContractAddress: string; // address
  verificationKey: string; // address
}

/// These should be the _variable_ inputs to your circuit. Constants can be hard-coded into the circuit itself (see below).
export interface MyCircuitInputs {
  verificationKey: CircuitValue;
  keystoreContractAddress: CircuitValue;
  blockNumber: CircuitValue;
}

export type MyCircuitCode = (
  halo2Lib: Halo2Lib,
  axiomData: AxiomData,
  myInputs: MyCircuitInputs,
) => Promise<void>;

export const myCircuitFn: MyCircuitCode = async (
  halo2Lib: Halo2Lib,
  axiomData: AxiomData,
  myInputs: MyCircuitInputs,
) => {
  // ==== Imports to make circuit code work. DO NOT REMOVE. ====
  // These are a list of available standard functions. Once you're finished with your circuit, you can remove the ones the linter says you don't use.
  const {
    constant,
    add,
    sub,
    and,
    or,
    not,
    select,
    checkEqual,
    checkLessThan,
    value,
    log,
  } = halo2Lib;
  // These are a list of available functions for getting Ethereum data. Once you're finished with your circuit, you can remove the ones the linter says you don't use.
  const {
    getAccount,
    getReceipt,
    getStorage,
    getTx,
    getHeader,
    getSolidityMapping,
    addToCallback,
  } = axiomData;
  // ==== End of imports ====

  // Below is the actual circuit code.
  // Currently doc-hints are not supported in the IDE (coming soon!); for dochints you can write this code in repl.axiom.xyz first and then paste it here.
  // For more detailed docs and a list of all data and compute functions, see our docs at:
  //
  // docs.axiom.xyz/axiom-repl/axiom-repl
  //
  const { verificationKey, keystoreContractAddress, blockNumber } = myInputs;

  // fetch the verification key storage data
  const storage = getStorage(blockNumber, keystoreContractAddress);
  // fetch the verification key storage value
  const slotValue = storage.slot(3);
  const vfKeyCv = slotValue.toCircuitValue();

  // assert that the value of verification key on-chain is the same
  checkEqual(vfKeyCv, verificationKey);

  // add the verificationKey and blockNumber to the callback, for it to be passed
  // as a result to the callback client contract
  addToCallback(verificationKey);
  addToCallback(blockNumber);
  // If I wanted to do additional computations on the results I got above, I'd do it here.

  // This is the end of the circuit!
};
