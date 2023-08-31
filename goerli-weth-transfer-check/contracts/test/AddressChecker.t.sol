// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test, console2} from "forge-std/Test.sol";
import {AddressChecker} from "../src/AddressChecker.sol";

contract AddressCheckerTest is Test {
    address public constant OWNER = 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266;

    AddressChecker public checker;
    address[] public addrs;

    function setUp() public {
        checker = new AddressChecker();
    }

    function validate() public {
        address[] memory addr = new address[](1);
        addr[0] = OWNER;
        checker.validate(bytes32(0), addr);
    }
}
