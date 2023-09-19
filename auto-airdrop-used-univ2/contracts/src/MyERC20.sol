// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import { ERC20 } from "@openzeppelin-contracts/token/ERC20/ERC20.sol";

contract MyERC20 is ERC20 {
    constructor(address airdropContract) ERC20("MyERC20", "ME20") {
        _mint(airdropContract, 100000000000);
    }
}