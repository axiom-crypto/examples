# Get Query from circuit.ts

Outputs ComputeQuery and DataQuery Query parameters from a circuit.ts file.

Steps:
1. Run `pnpm install`
2. Edit the `test` input in `axiomMain()` of `src/index.ts`.
3. Run `pnpm start` to create a ZK proof of `src/circuit/circuit.ts` based on the test input and send the associated `AxiomV2Query` on-chain.
4. Values shown in console.
