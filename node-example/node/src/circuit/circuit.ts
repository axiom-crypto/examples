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
  rawSlot: string; // should be bytes32
}

/// These should be the _variable_ inputs to your circuit. Constants can be hard-coded into the circuit itself (see below).
export interface MyCircuitInputs {
  blockNumber: CircuitValue;
  rawSlot: CircuitValue256;
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
  const { blockNumber, rawSlot } = myInputs;

  // I only want to look at a single address in my circuit, so I hardcode it here:
  const address = "0xBd5307B0Bf573E3F2864Af960167b24Aa346952b"; // AxiomV2Query

  // Since the blockNumber is a variable input, let's add it to the results that will be sent to my callback function:
  addToCallback(blockNumber);
  // We are going to need to validate this rawSlot in the smart contract
  addToCallback(rawSlot);

  // Make a data subquery request to get the storage data:
  // Note: this function will know that `address` is fixed because it's a string and not a CircuitValue
  const storage = getStorage(blockNumber, address);
  // access the value at storage slot `slot`
  const slotVal = storage.slot(rawSlot);
  // I got what I wanted (the slot value), adding it to callback:
  addToCallback(slotVal);

  // If I wanted to do additional computations on the results I got above, I'd do it here.

  // This is the end of the circuit!
};
