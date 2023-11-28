# Using Axiom Client SDK with Node.js

This is an example of how to use the [Axiom Client SDK](https://www.npmjs.com/package/@axiom-crypto/client) to write an Axiom client circuit and run it in a Node.js script. The example also includes how to generate an Axiom V2 Query in the script and send it on-chain.

The `axiom` directory contains the client circuit in [`circuit.ts`](./axiom/circuit.ts). The [`index.ts`](./axiom/index.ts) has the `axiomMain()` function that first compiles the circuit and then runs the circuit on a given test input. This is done by constructing an `AxiomCircuit` class from the circuit code. The script then creates an Axiom query with a given target callback address and sends the query on-chain (if you provide a `PRIVATE_KEY_GOERLI` environmental variable).

For instructions on running the Node script, see [Running the Node script](#running-the-node-script).

The node script sends a query with a callback to an example contract deployed on Goerli. The contract is in the `contracts` directory in [`ExampleMappingOffset.sol`](./contract/ExampleMappingOffset.sol).

In this example, the circuit is just a wrapper for a request to Axiom to prove the validity of the storage value at a particular slot in a fixed contract. This storage slot corresponds to the slot of a particular Solidity mapping key _at an offset_. The subtlety is that the mapping key and offset are not part of the circuit inputs. The storage slot, which is a circuit input, is first calculated in the typescript script following [Solidity storage layout rules](https://docs.soliditylang.org/en/v0.8.23/internals/layout_in_storage.html#mappings-and-dynamic-arrays) from the mapping key and offset. **However** the typescript computation is not verified and cannot be trusted. To remediate this, the mapping key and offset are provided as `extraData` to the callback function, and the `ExampleMappingOffset` contract parses the `extraData` and does the exact same computation in Solidity to verify the raw storage slot is computed correctly. By doing so, the contract has now trustlessly verified that the result of the Axiom query is the storage value for this particular mapping key and offset.

## Running the Node script

Steps:

1. Run `pnpm install`
2. Edit the `test` input in `axiomMain()` of `axiom/index.ts`.
3. Run `pnpm start` to run the client circuit written in `axiom/circuit.ts` based on the test input and send the associated `AxiomV2Query` on-chain.
4. Values shown in console.
