. ./.env

if [ $CLEAR_CACHE = 1 ]; then
  yarn hardhat clean
fi

# When running Hardhat scripts without the CLI, you need to use ts-node's 
# --files flag. This can also be enabled with TS_NODE_FILES=true.
# https://hardhat.org/guides/typescript.html#running-your-tests-and-scripts-directly-with-ts-node
time TS_NODE_FILES=true yarn ts-node ./scripts/convex.hardhat.ts
