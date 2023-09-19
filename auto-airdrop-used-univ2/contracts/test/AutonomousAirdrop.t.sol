// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import { Test, console } from 'forge-std/Test.sol';
import { AutonomousAirdrop } from '../src/AutonomousAirdrop.sol';
import { MyERC20 } from '../src/MyERC20.sol';

contract AutonomousAirdropTest is Test {
    address public constant AXIOM_V2_QUERY_GOERLI_ADDR = 0x8DdE5D4a8384F403F888E1419672D94C570440c9;
    bytes32 public constant CALLBACK_QUERY_SCHEMA = bytes32(0);
    bytes public constant TEST_DATAQUERY = hex"00000000000000050003000548ec8cb5f934664d26c0cf435e2f7c924ef757ab4c84b20e7320e21f468551b70000006700000000c42079f94a6350d7e6235f29174924f928cc2ac818eb64fed8004e115fbcca67000548ec8cb5f934664d26c0cf435e2f7c924ef757ab4c84b20e7320e21f468551b70000006700000002c42079f94a6350d7e6235f29174924f928cc2ac818eb64fed8004e115fbcca67000548ec8cb5f934664d26c0cf435e2f7c924ef757ab4c84b20e7320e21f468551b700000034000000000000000000000000000000000000000000000000000000000000000000000000";

    AutonomousAirdrop aa;
    MyERC20 me20;

    function setUp() public {
        aa = new AutonomousAirdrop(AXIOM_V2_QUERY_GOERLI_ADDR, 5, CALLBACK_QUERY_SCHEMA);
        me20 = new MyERC20(address(aa));
    }

    function debugDataQuery(bytes calldata dataQuery, uint256 a, uint256 b) public pure returns (bytes32) {
        return bytes32(dataQuery[a:b]);
    }

    function testDebugValidateDataQuery() public {
        bytes32 txHash0 = this.debugDataQuery(TEST_DATAQUERY, 12, 44);
        bytes32 txHash1 = this.debugDataQuery(TEST_DATAQUERY, 86, 118);
        bytes32 txHash2 = this.debugDataQuery(TEST_DATAQUERY, 160, 192);
    }
    
}