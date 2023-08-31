// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test, console2} from "forge-std/Test.sol";
import {AddressChecker} from "../src/AddressChecker.sol";

contract AddressCheckerTest is Test {
    address public constant OWNER = 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266;

    AddressChecker public checker;

    function setUp() public {
        vm.startPrank(OWNER);
        checker = new AddressChecker();
        vm.stopPrank();
    }

    function validate() public {
        checker.validate(OWNER);
    }
}
