const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('Convex Shutdown', function () {
  it('shutdown benchmark', async () => {
    const abi = ['function shutdownSystem() external', 'function owner() external view returns (address)'];
    const convex = new ethers.Contract('0xF403C135812408BFbE8713b5A23a04b3D48AAE31', abi, ethers.provider);
    const ownerAddr = await convex.owner();
    await network.provider.request({ method: 'hardhat_impersonateAccount', params: [ownerAddr] });
    const owner = await ethers.getSigner(ownerAddr);
    await network.provider.send('hardhat_setBalance', [owner.address, '0xffffffffffffffffffff']);

    const tx = await convex.connect(owner).shutdownSystem();
    const receipt = await ethers.provider.getTransactionReceipt(tx.hash);
    console.log('gasUsed: ', receipt.gasUsed.toString());
  });
});
