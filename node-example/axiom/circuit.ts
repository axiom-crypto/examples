import {
  addToCallback,
  getStorage,
  CircuitValue,
  CircuitValue256,
} from "@axiom-crypto/client";

/// These should be the _variable_ inputs to your circuit. Constants can be hard-coded into the circuit itself (see below).
export interface MyCircuitInputs {
  blockNumber: CircuitValue;
  rawSlot: CircuitValue256;
}

export const myCircuitCode = async (myInputs: MyCircuitInputs) => {
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
  const slotVal = await storage.slot(rawSlot);
  // I got what I wanted (the slot value), adding it to callback:
  addToCallback(slotVal);

  // If I wanted to do additional computations on the results I got above, I'd do it here.

  // This is the end of the circuit!
};
