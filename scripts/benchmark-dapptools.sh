. ./.env

if [ $CLEAR_CACHE = 1 ]; then
  rm -rf cache-dapptools
fi

# create cache folder if it does not exist
if [ ! -d cache-dapptools ]; then
  dapp --make-cache cache-dapptools
fi


# dapptools has no option to set gas limit, but it's hardcoded by default
# anyway so shouldn't be make a difference
time dapp test --verbosity 2 --rpc-url $ETH_RPC_URL --rpc-block $FORK_BLOCK --cache cache-dapptools
