// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import { Test, console } from 'forge-std/Test.sol';
import { AutonomousAirdrop } from '../src/AutonomousAirdrop.sol';
import { UselessToken } from '../src/UselessToken.sol';

contract AutonomousAirdropTest is Test {
    address public constant AXIOM_V2_QUERY_GOERLI_ADDR = 0x8DdE5D4a8384F403F888E1419672D94C570440c9;
    bytes32 public constant CALLBACK_QUERY_SCHEMA = bytes32(0x4627dbe6b61260f743b8c711823e81d7fcceda009cb16658e1cf79386a3e3228);
    bytes public constant TEST_DATAQUERY = hex"00000000000000050003000548ec8cb5f934664d26c0cf435e2f7c924ef757ab4c84b20e7320e21f468551b70000006700000000c42079f94a6350d7e6235f29174924f928cc2ac818eb64fed8004e115fbcca67000548ec8cb5f934664d26c0cf435e2f7c924ef757ab4c84b20e7320e21f468551b70000006700000002c42079f94a6350d7e6235f29174924f928cc2ac818eb64fed8004e115fbcca67000548ec8cb5f934664d26c0cf435e2f7c924ef757ab4c84b20e7320e21f468551b700000034000000000000000000000000000000000000000000000000000000000000000000000000";
    bytes public constant TEST_CALLBACK = hex"51b17b290000000000000000000000000000000000000000000000000000000000000005000000000000000000000000d780ba6903fecebede0d7dfcc0a558227f9eadc200000000000000000000000000000000000000000000000000000000000000002f3a19a5c1a80ef8c5f6ca793dacff43891949ff694eafa80f5ab88f74adf97e00000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000001400000000000000000000000000000000000000000000000000000000000000003c42079f94a6350d7e6235f29174924f928cc2ac818eb64fed8004e115fbcca67000000000000000000000000b392448932f6ef430555631f765df0dfae34eff3000000000000000000000000000000000000000000000000000000000092b34a0000000000000000000000000000000000000000000000000000000000000014b392448932f6ef430555631f765df0dfae34eff3000000000000000000000000";
    
    bytes32[] public callbackData;
    AutonomousAirdrop autonomousAirdrop;
    UselessToken uselessToken;

    function setUp() public {
        autonomousAirdrop = new AutonomousAirdrop(AXIOM_V2_QUERY_GOERLI_ADDR, 5, CALLBACK_QUERY_SCHEMA);
        uselessToken = new UselessToken(address(autonomousAirdrop));
        autonomousAirdrop.updateAirdropToken(address(uselessToken));
    }

    function debugDataQuery(bytes calldata dataQuery, uint256 a, uint256 b) public pure returns (bytes32) {
        return bytes32(dataQuery[a:b]);
    }

    // function testDebugValidateDataQuery() public {
    //     bytes32 txHash0 = this.debugDataQuery(TEST_DATAQUERY, 12, 44);
    //     bytes32 txHash1 = this.debugDataQuery(TEST_DATAQUERY, 86, 118);
    //     bytes32 txHash2 = this.debugDataQuery(TEST_DATAQUERY, 160, 192);
    // }

    // function testDebugCallback() public {
    //     callbackData = [
    //         bytes32(0xC42079F94A6350D7E6235F29174924F928CC2AC818EB64FED8004E115FBCCA67),
    //         bytes32(0x000000000000000000000000B392448932F6EF430555631F765DF0DFAE34EFF3),
    //         bytes32(0x000000000000000000000000000000000000000000000000000000000092B34A)
    //     ];
    //     autonomousAirdrop.debugCallback(
    //         5, 
    //         address(this), 
    //         CALLBACK_QUERY_SCHEMA, 
    //         0x2f3a19a5c1a80ef8c5f6ca793dacff43891949ff694eafa80f5ab88f74adf97e,
    //         callbackData,
    //         abi.encode(0xB392448932F6ef430555631f765Df0dfaE34efF3)
    //     );
    // }
}