source .env
forge create src/ExampleMappingOffset.sol:ExampleMappingOffset --private-key $GOERLI_PRIVATE_KEY --rpc-url $PROVIDER_URI_GOERLI --verify --etherscan-api-key $ETHERSCAN_API_KEY --constructor-args "0xf15cc7B983749686Cd1eCca656C3D3E46407DC1f" "5"
