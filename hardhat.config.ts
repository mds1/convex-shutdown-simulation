import '@nomiclabs/hardhat-waffle';
import { HardhatUserConfig } from 'hardhat/config';

const config: HardhatUserConfig = {
  solidity: '0.8.10',
  defaultNetwork: 'hardhat',
  networks: {
    hardhat: {
      accounts: { mnemonic: 'test test test test test test test test test test test junk' },
      chainId: 31337,
      gas: Number(process.env.GAS_LIMIT), // set to block gas limit, which avoids calls to eth_estimateGas (results in same behavior as dapptools/foundry)
      forking: {
        url: String(process.env.ETH_RPC_URL),
        blockNumber: Number(process.env.FORK_BLOCK),
      },
      loggingEnabled: true,
    },
  },
  mocha: {
    timeout: 0,
  },
};

export default config;
