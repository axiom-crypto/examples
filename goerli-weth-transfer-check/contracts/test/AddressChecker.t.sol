// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test, console2} from "forge-std/Test.sol";
import {AddressChecker} from "../src/AddressChecker.sol";

contract AddressCheckerTest is Test {
    address public constant OWNER = 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266;

    AddressChecker public checker;
    address[] public addrs;

    function setUp() public {
        vm.startPrank(OWNER);
        checker = new AddressChecker();
        vm.stopPrank();
    }

    // function validate() public {
    //     addrs.push(OWNER);
    //     checker.validate(
    //         0x0519916a95dc874dca3a24fe05e3ebfd12a83aa59dd3507cf9b39c01c379f4bd, 
    //         addrs,
    //         hex"00"
    //     );
    // }
}
