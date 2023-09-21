// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

interface IAxiomV2HeaderVerifier {
    /// @notice Stores witness data for checking MMRs
    /// @param  prevHash The `prevHash` as in `IAxiomV1State`.
    /// @param  root The `root` as in `IAxiomV1State`.
    /// @param  numFinal The `numFinal` as in `IAxiomV1State`.  
    /// @param  startBlockNumber The `startBlockNumber` as in `IAxiomV1State`.
    /// @param  recentMMRPeaks Peaks of the MMR committed to in the public input `recentMMRKeccak` of the ZK proof.
    /// @param  mmrComplementOrPeaks If `len(recentMMRPeaks) <= numFinal`, then this is a complementary MMR containing  
    ///         the complement of `recentMMRPeaks` which together with `recentMMRPeaks` forms `root`.  
    ///         If `len(recentMMRPeaks) > numFinal`, then this is the MMR peaks of the `numFinal` blockhashes commited
    ///         to in `root`.
    struct RecentMMRWitness {
        bytes32 prevHash;
        bytes32 root;
        uint32 numFinal;
        uint32 startBlockNumber;        
        bytes32[10] recentMMRPeaks;
        bytes32[10] mmrComplementOrPeaks;

        uint32 mmrIdx;
    }    

    function verifyQueryHeaders(
        bytes32 historicalMMRKeccak,
        bytes32 recentMMRKeccak,
        RecentMMRWitness calldata mmrWitness
    ) external;

    function getSourceChainId() external view returns (uint64);
}