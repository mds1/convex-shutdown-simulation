all    :; dapp build
clean  :; dapp clean
test   :; dapp test --rpc-url ${ETH_RPC_URL}
deploy :; dapp create Convex
