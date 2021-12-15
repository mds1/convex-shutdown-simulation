. ./.env

if [ $CLEAR_CACHE = 1 ]; then
  yarn hardhat clean
fi

time TS_NODE_FILES=true yarn ts-node ./scripts/convex.hardhat.ts
