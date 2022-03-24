# Convex System Shutdown Benchmarks

This repository benchmarks performance of various Ethereum development
frameworks by simulating a call to Convex's `systemShutdown` method. This method
uses about 16M gas and performs a number of token transfers

## Benchmarks

Benchmarks were run at mainnet block 14,445,961. Blocknative only simulates against the latest block (support for simulation at historical blocks is planned), so the Blocknative simulation was run first and other benchmarks were run against the same block.

Notes on benchmarks:
- "Remote RPC" benchmarks used Alchemy as the RPC provider.
- "Local RPC" benchmarks used a local Erigon node.
- "Cached" benchmarks use RPC responses that the framework caches locally instead of making HTTP requests. We assume that since Blocknative and Tenderly are infrastructure providers, they aggressively cache and load hot data in-memory to improve performance, which is why their results are also in the "Cached" column.
- Benchmarks were performed on macOS 11.6.2 with a 2.3 GHz 8-Core Intel Core i9 and 32 GB 2667 MHz DDR4.

Notes on gas usage:
- Ganache, Hardhat, and Tenderly all agree on gas usage after refunds and are therefore likely the truth value.
- Blocknative's gas usage does not account for refunds as this is not yet supported by their platform.
- Foundry and Dapptools exclude the 21,064 intrinsic gas from the reported gas used.

| Framework   | Remote RPC | Local RPC  | Cached    |
| ----------- | ---------- | ---------- | --------- |
| Blocknative | N/A        | N/A        | 0m3.529s  |
| Dapptools   | 52m17.447s | 17m34.869s | 3m25.896s |
| Ganache     | 10m4.859s  | 0m57.387s  | 0m22.385s |
| Hardhat     | 17m9.434s  | 1m20.667s  | 0m6.624s  |
| Foundry     | 7m14.991s  | 0m20.031s  | 0m0.823s  |
| Tenderly    | N/A        | N/A        | 0m17.805s |

| Framework   | Gas Used   |
| ----------- | ---------- |
| Blocknative | 26,668,845 |
| Dapptools   | 24,066,128 |
| Ganache     | 22,580,009 |
| Hardhat     | 22,580,009 |
| Foundry     | 22,561,940 |
| Tenderly    | 22,580,009 |

## Usage

1. Run `cp .env.example .env`, and in the resulting `.env` file enter a URL to an Ethereum archive node in the `ETH_RPC_URL` environment variable. ([Alchemy](https://www.alchemy.com/) provides free archive node data). Also fill out the `TENDERLY_*` variables to benchmark the Tenderly API

2. Run `yarn` to install dependencies for Ganache and Hardhat 

3. Install Foundry's forge and Dapptools using the installation instructions[here](https://github.com/gakonst/foundry/) and [here](https://github.com/dapphub/dapptools/) respectively

4. Run `dapp update` to install dependencies for Dapptools and Foundry

5. Run any command in the `Makefile` to benchmark that tool. For example, use `make benchmark-hardhat` to run the simulation against Hardhat. Alternatively, run `make benchmark-all` to run all tools

## Tips

- Set `export CLEAR_CACHE=1` in your `.env` file to clear the Ganache and Hardhat caches
- Consider running the benchmarks via Docker. See the comment header in [the Dockerfile](./Dockerfile) for details.