import * as assert from 'assert';
import fetchUrl, { FETCH_OPT } from 'micro-ftch';

async function main(): Promise<void> {
  // TODO query this from tenderly API?
  const ownerAddr = '0xa3C5A1e09150B75ff251c1a7815A07182c3de2FB';
  console.log('ownerAddr: ', ownerAddr);

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
      to: '0xF403C135812408BFbE8713b5A23a04b3D48AAE31', // convex contract
      input: '0x354af919', // bytes4(keccak256("shutdownSystem()"))
      gas: Number(process.env.GAS_LIMIT),
      gas_price: '0',
      value: '0',
      save: false,
    },
  };
  const sim = await fetchUrl(simUrl, fetchOptions);
  assert.ok(sim.transaction.status, `transaction failed. response: ${JSON.stringify(sim)}`);
}

main()
  .then(() => process.exit(0))
  .catch((error: Error) => {
    console.error(error);
    process.exit(1);
  });
