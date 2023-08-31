// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import { Ownable } from "@openzeppelin-contracts/access/Ownable.sol";

contract AddressChecker is Ownable {
    event AddressMatch(address indexed _addr);

    address public constant AXIOM_V2_QUERY_GOERLI_ADDR = 0x18D8a359C23Bebc4B5A0D116f792172a114A1fB7;

    constructor() {}

    function validate(address _addr) external {
        require(msg.sender == AXIOM_V2_QUERY_GOERLI_ADDR, "AddressChecker: sender is not AxiomV2Query");
        require(_addr == owner(), "AddressChecker: address does not match");
        emit AddressMatch(_addr);
    }
}
