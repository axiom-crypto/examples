source .env
forge script script/AddressChecker.s.sol:AddressCheckerScript --private-key $PRIVATE_KEY --broadcast --rpc-url $PROVIDER_URI_GOERLI -vvvv && cp out/AddressChecker.sol/AddressChecker.json ../scripts/src/abi/AddressChecker.json
