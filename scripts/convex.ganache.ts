import * as assert from 'assert';

const chalk: any = require('chalk');
import * as ethers from 'ethers';
import Ganache, {ProviderOptions} from 'ganache';

const url = process.env.ETH_RPC_URL || 'mainnet';
const deleteCache = process.env.CLEAR_CACHE && Number(process.env.CLEAR_CACHE) === 1 || false;
const blockGasLimit = ethers.BigNumber.from(process.env.GAS_LIMIT).toHexString();
const blockNumber = Number(process.env.FORK_BLOCK);
// ganache expects the default balance in ETH as a number
const defaultBalance = 0x12725DD1;
const targetBalance = '0xffffffffffffffffffff';
const convexAddress = '0xF403C135812408BFbE8713b5A23a04b3D48AAE31';
const convexAbi = ['function shutdownSystem() external', 'function owner() external view returns (address)'];

async function main(): Promise<void> {
  /*
   * setup
   */

  console.log(chalk.bold('Setting up Ganache...'));
  console.time('setup-ganache');
  console.group();

  const { ganache, provider } = await prepareGanache({
    url,
    blockNumber,
    blockGasLimit,
    defaultBalance,
    deleteCache,
  });

  const convex = new ethers.Contract(convexAddress, convexAbi, provider);
  const ownerAddress = await convex.owner({ blockTag: Number(process.env.FORK_BLOCK), gasLimit: blockGasLimit });

  await fundAccounts({ provider, accounts: [convexAddress, ownerAddress], amount: targetBalance });

  const owner = await unlockAddress({ provider, address: ownerAddress });

  console.groupEnd();
  console.timeEnd('setup-ganache');
  console.log('');

  /*
   * simulation
   */

  console.log(chalk.bold('Simulating shutdown...'));
  console.time('simulate-shutdown');
  console.group();
  
  const tx = await convex.connect(owner).shutdownSystem({ gasLimit: blockGasLimit });

  const receipt = await provider.waitForTransaction(tx.hash);
  assert.ok(receipt.status, `transaction failed. receipt: ${JSON.stringify(receipt)}`);
  console.groupEnd();
  console.timeEnd('simulate-shutdown');
  console.log('');

  // @ts-ignore looks like ganache has a bad typing
  await ganache.disconnect();
}

interface PrepareGanacheOptions {
  url: string;
  blockNumber: 'latest' | number;
  blockGasLimit: string;
  defaultBalance: number;
  deleteCache: boolean;
}

async function prepareGanache({
  url,
  blockNumber,
  blockGasLimit,
  defaultBalance,
  deleteCache,
}: PrepareGanacheOptions): Promise<{
  ganache: ReturnType<typeof Ganache.provider>;
  provider: ethers.providers.JsonRpcProvider;
}> {
  const options: ProviderOptions = {
    fork: {
      url,
      blockNumber,
      deleteCache,
    },
    miner: { 
      blockGasLimit, 
      instamine: "eager",
      // this option, introduced in v7.3.0 of Ganache, fixes a potential fail case in this test
      // this option causes the block's timestamp after forking to be forkBlockTimestamp + 1 second
      // previously, Ganache would use the user's computer time, which would cause large gas usage
      // when calling the contract
      timestampIncrement: 1 
    },
    wallet: {
      defaultBalance
    },
    logging: {
      quiet: false,
    }
  };

  const ganache = Ganache.provider(options);

  // @ts-ignore currently ethers doesn't like ganache's provider type
  const provider = new ethers.providers.Web3Provider(ganache);

  return { ganache, provider };
}

interface FundAccountsOptions {
  provider: ethers.providers.JsonRpcProvider;
  accounts: string[];
  amount: string;
}

async function fundAccounts({ provider, accounts, amount }: FundAccountsOptions): Promise<void> {
  const [from] = await provider.listAccounts();

  for (const address of accounts) {
    // simple contract that just selfdestructs funds to address constructor arg
    const sendBytecode = '0x60806040526040516100c13803806100c18339818101604052810190602391906098565b8073ffffffffffffffffffffffffffffffffffffffff16ff5b600080fd5b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b6000606a826041565b9050919050565b6078816061565b8114608257600080fd5b50565b6000815190506092816071565b92915050565b60006020828403121560ab5760aa603c565b5b600060b7848285016085565b9150509291505056fe'; // prettier-ignore

    const txHash = await provider.send('eth_sendTransaction', [
      {
        from,
        input: `${sendBytecode}000000000000000000000000${address.slice(2)}`,
        value: amount,
      },
    ]);

    const receipt = await provider.waitForTransaction(txHash);
    assert.ok(receipt.status);
  }
}

interface UnlockAddressOptions {
  provider: ethers.providers.JsonRpcProvider;
  address: string;
}

async function unlockAddress({ provider, address }: UnlockAddressOptions): Promise<ethers.providers.JsonRpcSigner> {
  await provider.send('evm_addAccount', [address, '']);
  const signer = await provider.getUncheckedSigner(address);
  await signer.unlock('');
  return signer;
}

main()
  .then(() => process.exit(0))
  .catch((error: Error) => {
    console.error(error);
    process.exit(1);
  });
