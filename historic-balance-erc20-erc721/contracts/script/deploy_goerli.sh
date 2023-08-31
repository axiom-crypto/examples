source .env
forge script script/Counter.s.sol:CounterScript --private-key $PRIVATE_KEY --broadcast --rpc-url $PROVIDER_URI_GOERLI -vvvv && cp out/Counter.sol/Counter.json ../scripts/src/abi/Counter.json
