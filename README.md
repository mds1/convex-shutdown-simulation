# Convex System Shutdown Benchmarks

This repository benchmarks performance of various Ethereum development
frameworks by simulating a call to Convex's `systemShutdown` method. This method
uses about 16M gas and performs a number of token transfers

## Usage

1. Run `cp .env.example .env`, and in the resulting `.env` file enter a URL to an Ethereum archive node in the `ETH_RPC_URL` environment variable. ([Alchemy](https://www.alchemy.com/) provides free archive node data). Also fill out the `TENDERLY_*` variables to benchmark the Tenderly API

2. Run `yarn` to install dependencies for Ganache and Hardhat 

3. Install Foundry's forge and Dapptools using the installation instructions[here](https://github.com/gakonst/foundry/) and [here](https://github.com/dapphub/dapptools/) respectively

4. Run `dapp update` to install dependencies for Dapptools and Foundry

5. Run any command in the `Makefile` to benchmark that tool. For example, use `make benchmark-hardhat` to run the simulation against Hardhat. Alternatively, run `make benchmark-all` to run all tools

## Tips

- Set `export CLEAR_CACHE=1` in your `.env` file to clear the Ganache and Hardhat caches
- Consider running the benchmarks via Docker. See the comment header in [the Dockerfile](./Dockerfile) for details.

## Benchmarks

Notes:
- "Local, No Cache" refers to tools run on a local machine with a local node, where all data needed from the node is fetched on-demand
- "Local, With Cache" refers to tools run on a local machine with a local node, where all data needed from the node was cached to disk on a previous run
- "Cloud Based" refers to services that provide an API and run the simulation on their servers
- Foundry does not cache RPC results to disk between runs, so the "Local, With Cache" column has been left as N/A
- Ganache results are currently not shown due to a bug reported in [PR #4](https://github.com/mds1/convex-shutdown-simulation/pull/4)
- Local benchmarks were run against a local Erigon node on macOS 11.6.2 with a 2.3 GHz 8-Core Intel Core i9 and 32 GB 2667 MHz DDR4
- We are aiming to benchmark tool performance, which is why a local node is used. If benchmarking against a remote node such as Infura or Alchemy, network calls become the driver of execution time

| Framework | Local, No Cache | Local, With Cache | Cloud Based |
| --------- | --------------- | ----------------- | ----------- |
| Dapptools | 5m7.537s        | TODO              | N/A         |
| Ganache   | TBD             | TBD               | N/A         |
| Hardhat   | 1m29.580s       | 0m34.460s         | N/A         |
| Foundry   | 0m11.249s       | N/A               | N/A         |
| Tenderly  | N/A             | N/A               | TODO        |
