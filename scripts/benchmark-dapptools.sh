. ./.env

# dapptools has no option to set gas limit, but it's hardcoded by default
# anyway so shouldn't be make a difference
time dapp test --verbosity 2 --rpc-url $ETH_RPC_URL --rpc-block $FORK_BLOCK
