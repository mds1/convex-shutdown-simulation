import * as assert from 'assert';
import { Contract } from '@ethersproject/contracts';
import { JsonRpcProvider } from '@ethersproject/providers';
import fetchUrl, { FETCH_OPT } from 'micro-ftch';

async function main(): Promise<void> {
  const convexAddr = '0xF403C135812408BFbE8713b5A23a04b3D48AAE31';
  const provider = new JsonRpcProvider(process.env.ETH_RPC_URL);
  const abi = ['function owner() view external returns (address)'];
  const convex = new Contract(convexAddr, abi, provider);
  const ownerAddr = await convex.owner({ blockTag: Number(process.env.FORK_BLOCK) });

  // Configure tenderly request
  const baseUrl = 'https://api.tenderly.co/api/v1';
  const simUrl = `${baseUrl}/account/me/project/${process.env.TENDERLY_PROJECT_SLUG}/simulate`;

  const fetchOptions = <Partial<FETCH_OPT>>{
    method: 'POST',
    type: 'json',
    headers: { 'X-Access-Key': process.env.TENDERLY_ACCESS_TOKEN },
    data: {
      network_id: '1',
      block_number: Number(process.env.FORK_BLOCK),
      from: ownerAddr,
      to: convexAddr,
      input: '0x354af919', // bytes4(keccak256("shutdownSystem()"))
      gas: Number(process.env.GAS_LIMIT),
      gas_price: '0',
      value: '0',
      save: false,
      simulation_type: 'quick', // 'full' uses contract source code for a more detailed trace and is slower
    },
  };
  const sim = await fetchUrl(simUrl, fetchOptions);
  assert.ok(sim.transaction.status, `transaction failed. response: ${JSON.stringify(sim)}`);
  console.log('Gas used:', sim.transaction.gas_used);
}

main()
  .then(() => process.exit(0))
  .catch((error: Error) => {
    console.error(error);
    process.exit(1);
  });
