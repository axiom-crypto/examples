// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "./IAxiomV2HeaderVerifier.sol";

uint256 constant PROOF_GAS = 500_000;
uint256 constant AXIOM_QUERY_FEE = 0.005 ether;

interface IAxiomV2Query {
    /// @notice States of an on-chain query
    /// @param  Inactive The query has not been made or was refunded.
    /// @param  Active The query has been requested, but not fulfilled.
    /// @param  Fulfilled The query was successfully fulfilled.
    enum AxiomQueryState {
        Inactive,
        Active,
        Fulfilled
    }

    /// @notice Stores metadata about a query
    /// @param  state The state of the query.
    /// @param  deadlineBlockNumber The deadline (in block number) after which a refund may be granted.
    /// @param  refundee The address funds should be returned to if the query is not fulfilled.
    struct AxiomQueryMetadata {
        AxiomQueryState state;
        uint32 deadlineBlockNumber;
        bytes32 querySchema;
        uint8 resultLen;
        address callerAddr;
        address callbackAddr;
        bytes4 callbackFunctionSelector;
        bytes32 callbackExtraDataHash;
    }

    struct AxiomProofData {
        uint64 sourceChainId;
        bytes32 dataResultsRoot;
        bytes32 dataResultsPoseidonRoot;
        bytes32 computeResultsHash;
        bytes32 queryHash;
        bytes32 querySchema;
        bytes32 historicalMMRKeccak;
        bytes32 recentMMRKeccak;
        bytes32 aggregateVkeyHash;
        address payee;
    }

    struct AxiomProofCallbackData {
        uint64 sourceChainId;
        address payee;
        bytes32 queryHash;
        bytes32 querySchema;
        bytes32 computeResultsHash;
    }

    struct AxiomV2ComputeQuery {
        uint8 k;
        bytes32[] vkey;
        bytes computeProof;
    }

    struct AxiomV2Callback {
        address callbackAddr;
        bytes4 callbackFunctionSelector;
        uint8 resultLen;
        bytes callbackExtraData;
    }

    /// @notice Emitted when the `IAxiomV2HeaderVerifier` address is updated.
    /// @param  newAddress The updated address.
    event UpdateAxiomHeaderVerifierAddress(address newAddress);

    /// @notice Emitted when the query verifier address is updated.
    /// @param  newAddress The updated address.
    event UpdateVerifierAddress(address newAddress);

    /// @notice Emitted when the prover address is updated.
    /// @param  newAddress The updated address.
    event UpdateAxiomProverAddress(address newAddress);

    /// @notice Emitted when the Axiom result store address is updated.
    /// @param  newAddress The updated address.
    event UpdateAxiomResultStoreAddress(address newAddress);

    event UpdateAxiomFeeStoreAddress(address newAddress);

    event UpdateAggregateVkeyHash(bytes32 aggregateVkeyHash);

    event UpdateQueryDeadlineInterval(uint32 newQueryDeadlineInterval);

    event QueryInitiatedOnchain(
        bytes32 indexed queryHash, uint32 deadlineBlockNumber, uint64 maxFeePerGas, uint32 callbackGasLimit
    );
    event QueryInitiatedOffchain(
        bytes32 indexed queryHash,
        uint32 deadlineBlockNumber,
        bytes32 ipfsHash,
        uint64 maxFeePerGas,
        uint32 callbackGasLimit
    );
    event QueryFulfilled(bytes32 indexed queryHash, address payee);
    event OffchainQueryFulfilled(bytes32 indexed queryHash);
    event QueryRefunded(bytes32 indexed queryHash);

    /// @notice Verify a query result on-chain.
    /// @param  mmrWitness Witness data to reconcile `recentMMR` against `historicalRoots`.
    /// @param  proof The ZK proof data.
    function verifyAndWriteResult(IAxiomV2HeaderVerifier.RecentMMRWitness calldata mmrWitness, bytes calldata proof)
        external;

    function sendQuery(
        uint64 sourceChainId,
        bytes32 dataQueryHash,
        AxiomV2ComputeQuery calldata computeQuery,
        AxiomV2Callback calldata callback,
        uint64 maxFeePerGas,
        uint32 callbackGasLimit,
        bytes calldata dataQuery
    ) external payable returns(bytes32);

    function sendQueryWithIpfsData(
        bytes32 queryHash,
        bytes32 querySchema,
        bytes32 ipfsHash,
        AxiomV2Callback calldata callback,
        uint64 maxFeePerGas,
        uint32 callbackGasLimit
    ) external payable;

    function fulfillQuery(
        IAxiomV2HeaderVerifier.RecentMMRWitness calldata mmrWitness,
        bytes32[] calldata computeResults,
        bytes calldata proof,
        bytes calldata callbackExtraData
    ) external;

    function fulfillOffchainQuery(
        IAxiomV2HeaderVerifier.RecentMMRWitness calldata mmrWitness,
        bytes32[] calldata computeResults,
        bytes calldata proof,
        AxiomV2Callback calldata callback
    ) external;

    function refundQuery(bytes32 queryHash) external;
}
