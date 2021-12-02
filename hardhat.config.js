require('@nomiclabs/hardhat-waffle');

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: '0.8.10',
  defaultNetwork: 'hardhat',
  networks: {
    hardhat: {
      accounts: { mnemonic: 'test test test test test test test test test test test junk' },
      chainId: 31337,
      forking: { url: process.env.ETH_RPC_URL, blockNumber: 13724056 },
    },
  },
  mocha: {
    timeout: 0,
  },
};
