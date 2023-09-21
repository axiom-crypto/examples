# Autonomous Airdrop

This example allows users to autonomously claim an airdrop of an example ERC20 token. Users utilize a data-fetching layer on top of Axiom to autonomously prove that their account matches some parameters before submitting a Query. In this case, it is that they've used Uniswap on Goerli testnet after block 9000000.

## Contracts

`/contracts` contains all of the Solidity contract code.

## Scripts

`/scripts` contains the code that does the data fetching, Query building, and submitting to the blockchain.

## Webapp

`/webapp` does what the scripts folder does, but in a full next.js web app.