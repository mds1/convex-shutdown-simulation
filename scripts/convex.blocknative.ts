import fetch from 'node-fetch'

// Add your keys via .env
const credentials = process.env.BN_API_KEY + ':' + process.env.BN_SECRET_KEY
const bnEndPoint = 'https://api.blocknative.com/simulate'

const gasSupplied = 300000000 // Example high gas to succeed EVM execution, **currently no estimation**

async function main(): Promise<void> {

  // Double check the keys were given above!
  if (credentials === ':') {
    throw new Error('No credentials for simulation endpoint given!')
  }

  // Information to how tx-preview works is here:
  // https://docs.blocknative.com/simulation-platform/transaction-preview-api
  const body = {
    system: "ethereum",
    network: "main",
    transaction: {
      to: "0xF403C135812408BFbE8713b5A23a04b3D48AAE31",
      from: "0xa3C5A1e09150B75ff251c1a7815A07182c3de2FB",
      gas: gasSupplied,
      gasPrice: 0,
      input: "0x354af919",
      value: 0
    }
  }

  console.time('Simulate-shutdown')

  // cURL the simulated call to Convex's 'systemShutdown' method
  const response = await fetch(bnEndPoint, {
    method: 'post',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
      'credentials': credentials
    }
  })
  console.timeEnd('Simulate-shutdown')
  const data = await response.json()

  // Check for errors
  if (response.status !== 200) {
    console.log(`Simulation error: ${response.statusText}`)
    process.exit(1)
  }

  // Print the response with decoded internal transactions, address 
  // balance changes of ETH and tokens, and any errors in EVm execution
  // console.log(JSON.stringify(data, 0, 2))

  // Blocknative's E2E latency
  console.log(`End to end latency: ${data.simDetails.e2eMs}ms`)
}

main()
  .then(() => process.exit(0))
  .catch((error: Error) => {
    console.error(error)
    process.exit(1)
  });
