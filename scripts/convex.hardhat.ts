import { ethers, network } from 'hardhat';
import '@nomiclabs/hardhat-ethers';

async function main(): Promise<void> {
  // Impersonate owner
  const abi = ['function shutdownSystem() external', 'function owner() external view returns (address)'];
  const convex = new ethers.Contract('0xF403C135812408BFbE8713b5A23a04b3D48AAE31', abi, ethers.provider);
  const ownerAddr = await convex.owner();
  await network.provider.request({ method: 'hardhat_impersonateAccount', params: [ownerAddr] });
  const owner = await ethers.getSigner(ownerAddr);
  
  // Fund owner (it's a contract)
  await network.provider.send('hardhat_setBalance', [owner.address, '0xffffffffffffffffffff']);

  // Execute transaction
  const tx = await convex.connect(owner).shutdownSystem();
  const receipt = await ethers.provider.getTransactionReceipt(tx.hash);
}

main()
  .then(() => process.exit(0))
  .catch((error: Error) => {
    console.error(error);
    process.exit(1);
  });
