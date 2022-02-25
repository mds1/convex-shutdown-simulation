import fetchUrl, { FETCH_OPT } from 'micro-ftch'
import { Contract } from '@ethersproject/contracts'
import { JsonRpcProvider } from '@ethersproject/providers'

// Add your keys via .env
const credentials = process.env.BN_API_KEY + ':' + process.env.BN_SECRET_KEY
const bnEndPoint = 'https://api.blocknative.com/simulate'

async function main(): Promise<void> {
  // Get owner address - gracefully copied homework from the Tenderly benchmark script :^)
  const convexAddr = '0xF403C135812408BFbE8713b5A23a04b3D48AAE31'
  const provider = new JsonRpcProvider(process.env.ETH_RPC_URL)
  const abi = ['function owner() view external returns (address)']
  const convex = new Contract(convexAddr, abi, provider)

  // We use current blocknumber owner as Blocknative simulates on tip block number as of now
  const ownerAddr = await convex.owner()

  // Double check the keys were given above!
  if (credentials === ':') {
    throw new Error('No credentials for simulation endpoint given!')
  }

  // Information to how tx-preview works is here:
  // https://docs.blocknative.com/simulation-platform/transaction-preview-api
  const fetchOptions = <Partial<FETCH_OPT>>{
    method: 'POST',
    type: 'json',
    full: true,
    expectStatusCode: false,
    headers: {
      'Content-Type': 'application/json',
      'credentials': credentials
    },
    data: {
      system: "ethereum",
      network: "main",
      transaction: {
        to: convexAddr,
        from: ownerAddr,
        gas: Number(process.env.GAS_LIMIT),
        gasPrice: 0,
        input: "0x354af919",
        value: 0
      }
    }
  }

  console.time('Simulate-shutdown')

  // Fetch simulation via Blocknative RESTful endpoint
  const response = await fetchUrl(bnEndPoint, fetchOptions)

  if (response.status !== 200) {
    console.log(`Simulation error code: ${response.status} - ${JSON.stringify(response.body)}`)
    process.exit(1)
  }

  console.timeEnd('Simulate-shutdown')

  // Print the response with decoded internal transactions, address 
  // balance changes of ETH and tokens, and any errors in EVm execution
  // console.log(JSON.stringify(response.body, null, 2))

  // Print gasUsed for execution during certain block
  console.log(`Simulation generated on blocknumber: ${response.body.simulatedBlockNumber}`)
  console.log(`Gas used: ${response.body.gasUsed}`)

  // Blocknative's E2E latency
  console.log(`Blocknative's end to end latency: ${response.body.simDetails.e2eMs}ms`)
}

main()
  .then(() => process.exit(0))
  .catch((error: Error) => {
    console.error(error)
    process.exit(1)
  });
