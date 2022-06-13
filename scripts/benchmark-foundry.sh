. ./.env

cacheflag=""
if [ $CLEAR_CACHE = 1 ]; then
  rm -rf out
  cacheflag="--no-storage-caching"
fi

time forge test -vv --fork-url $ETH_RPC_URL --fork-block-number $FORK_BLOCK --gas-limit $GAS_LIMIT $cacheflag
