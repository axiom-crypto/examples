# Custom Compute Circuit using NodeJS

This is an example of how to write a custom compute circuit and generate proofs for it using NodeJS. The example also includes how to generate an Axiom V2 Query from the compute proof and send it on-chain.

The `node` directory contains the custom compute circuit in [`circuit.ts`](./node/src/circuit/circuit.ts). There is a `MyCircuit` class in [`circuit/index.ts`](./node/src/circuit/index.ts) that provides helper functions for building the circuit from the circuit code and creating proofs for variable inputs. The [`index.ts`](./node/src/index.ts) has the `axiomMain()` function that first builds the circuit (creates proving key and verifying key) and then creates a proof for a given test input. The script then bundles the proof with the associated Data Query and sends the query on-chain (if you provide a `PRIVATE_KEY_GOERLI` environmental variable).

For instructions on running the Node script, see the [README](./node/readme.md) in the `node` directory.

The node script sends a query with a callback to an example contract deployed on Goerli. The contract is in the `contracts` directory in [`ExampleMappingOffset.sol`](./contract/src/ExampleMappingOffset.sol).

In this example, the circuit is just a wrapper for a request to Axiom to prove the validity of the storage value at a particular slot in a fixed contract. This storage slot corresponds to the slot of a particular Solidity mapping key _at an offset_. The subtlety is that the mapping key and offset are not part of the circuit inputs. The storage slot, which is a circuit input, is first calculated in the typescript script following [Solidity storage layout rules](https://docs.soliditylang.org/en/v0.8.23/internals/layout_in_storage.html#mappings-and-dynamic-arrays) from the mapping key and offset. **However** the typescript computation is not verified and cannot be trusted. To remediate this, the mapping key and offset are provided as `extraData` to the callback function, and the `ExampleMappingOffset` contract parses the `extraData` and does the exact same computation in Solidity to verify the raw storage slot is computed correctly. By doing so, the contract has now trustlessly verified that the result of the Axiom query is the storage value for this particular mapping key and offset.

# Get Query from circuit.ts

Outputs ComputeQuery and DataQuery Query parameters from a circuit.ts file.

Steps:

1. Run `pnpm install`
2. Edit the `test` input in `axiomMain()` of `src/index.ts`.
3. Run `pnpm start` to create a ZK proof of `src/circuit/circuit.ts` based on the test input and send the associated `AxiomV2Query` on-chain.
4. Values shown in console.
