cd $(git rev-parse --show-toplevel)
source ./auto-airdrop-used-univ2/contracts/.env

forge test --fork-url $PROVIDER_URI_GOERLI --match-contract AutonomousAirdrop -vvvv