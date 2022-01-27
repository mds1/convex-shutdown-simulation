import * as assert from 'assert';

const chalk: any = require('chalk');
import { ethers, network } from 'hardhat';
import '@nomiclabs/hardhat-ethers';

async function main(): Promise<void> {
  console.log(chalk.bold('Setting up Hardhat...'));
  console.time('setup-hardhat');
  console.group();

  // Impersonate owner
  const abi = ['function shutdownSystem() external', 'function owner() external view returns (address)'];
  const convex = new ethers.Contract('0xF403C135812408BFbE8713b5A23a04b3D48AAE31', abi, ethers.provider);
  const ownerAddr = await convex.owner();
  await network.provider.request({ method: 'hardhat_impersonateAccount', params: [ownerAddr] });
  const owner = await ethers.getSigner(ownerAddr);
  
  // Fund owner (it's a contract)
  await network.provider.send('hardhat_setBalance', [owner.address, '0xffffffffffffffffffff']);

  console.groupEnd();
  console.timeEnd('setup-hardhat');
  console.log('');

  // Execute transaction
  console.log(chalk.bold('Simulating shutdown...'));
  console.time('simulate-shutdown');
  console.group();
  const tx = await convex.connect(owner).shutdownSystem(
    { gasLimit: process.env.GAS_LIMIT }
  );
  const receipt = await ethers.provider.getTransactionReceipt(tx.hash);
  assert.ok(receipt.status, `transaction failed. receipt: ${JSON.stringify(receipt)}`);
  console.groupEnd();
  console.timeEnd('simulate-shutdown');
  console.log('');
}

main()
  .then(() => process.exit(0))
  .catch((error: Error) => {
    console.error(error);
    process.exit(1);
  });
