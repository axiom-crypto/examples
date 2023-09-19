// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.19;

import {Script, console2} from "forge-std/Script.sol";
import { AutonomousAirdrop } from '../src/AutonomousAirdrop.sol';
import { MyERC20 } from '../src/MyERC20.sol';

contract AutonomousAirdropScript is Script {
    address public constant AXIOM_V2_QUERY_GOERLI_ADDR = 0x8DdE5D4a8384F403F888E1419672D94C570440c9;
    bytes32 public constant CALLBACK_QUERY_SCHEMA = bytes32(0);

    function setUp() public {}

    function run() public {
        vm.startBroadcast();
        
        AutonomousAirdrop aa = new AutonomousAirdrop(AXIOM_V2_QUERY_GOERLI_ADDR, 5, CALLBACK_QUERY_SCHEMA);
        MyERC20 me20 = new MyERC20(address(aa));
        aa.updateAirdropToken(address(me20));

        vm.stopBroadcast();
    }
}
