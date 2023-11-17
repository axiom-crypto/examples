// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { AxiomV2Client } from "./AxiomV2Client.sol";

/// @title  Example AxiomV2Client Contract
/// @notice Example AxiomV2Client contract which emits events upon callback.
contract ExampleMappingOffset is AxiomV2Client {
    /// @dev Error returned if the `sourceChainId` does not match.
    error SourceChainIdDoesNotMatch();

    /// @notice Emitted after validation of a callback.
    /// @param  caller The address of the account that initiated the query.
    /// @param  querySchema The schema of the query, defined as `keccak(k . resultLen . vkeyLen . vkey)`
    event ExampleClientAddrAndSchema(address indexed caller, bytes32 indexed querySchema);

    /// @notice Emitted after callback is made.
    event GotMappingValueWithOffset(uint256 indexed queryId, bytes32 mappingSlot, bytes32 key, uint256 offset, bytes32 value);

    /// @dev The chain ID of the chain whose data the callback is expected to be called from.
    uint64 public callbackSourceChainId;

    /// @notice Construct a new ExampleV2Client contract.
    /// @param  _axiomV2QueryAddress The address of the AxiomV2Query contract.
    /// @param  _callbackSourceChainId The ID of the chain the query reads from.
    constructor(address _axiomV2QueryAddress, uint64 _callbackSourceChainId) AxiomV2Client(_axiomV2QueryAddress) {
        callbackSourceChainId = _callbackSourceChainId;
    }

    /// @inheritdoc AxiomV2Client
    function _validateAxiomV2Call(
        AxiomCallbackType callbackType,
        uint64 sourceChainId,
        address caller,
        bytes32 querySchema,
        uint256 queryId,
        bytes calldata extraData
    ) internal override {
        if (sourceChainId != callbackSourceChainId) {
            revert SourceChainIdDoesNotMatch();
        }
        require(querySchema == 0x5ccccce92bd3d53df098f4f4a8eb5e85eac898db787c6eaadc2937bf843a9c87, "Invalid query schema");

        emit ExampleClientAddrAndSchema(caller, querySchema);
    }

    /// @inheritdoc AxiomV2Client
    function _axiomV2Callback(
        uint64 sourceChainId,
        address caller,
        bytes32 querySchema,
        uint256 queryId,
        bytes32[] calldata axiomResults,
        bytes calldata extraData
    ) internal override {
        uint256 blockNumber = uint256(axiomResults[0]);
        bytes32 rawSlot = axiomResults[1];

        // Validate calculation of rawSlot:
        // This exactly matches `getRawSlotForMapping` in the node script.
        bytes32 mappingSlot = bytes32(extraData[0:32]);
        bytes32 key = bytes32(extraData[32:64]);
        uint256 offset = uint256(bytes32(extraData[64:96]));
        uint256 _slot = uint256(keccak256(abi.encodePacked(key, mappingSlot)));
        require(uint256(rawSlot) == _slot + offset, "Invalid raw slot");

        bytes32 value = axiomResults[2];

        emit GotMappingValueWithOffset(queryId, mappingSlot, key, offset, value);
    }
}
