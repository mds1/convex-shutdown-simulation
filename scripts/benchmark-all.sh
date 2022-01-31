echo -e "\n--- BENCHMARKING DAPPTOOLS ---"
bash scripts/benchmark-dapptools.sh

echo -e "\n--- BENCHMARKING FOUNDRY ---"
bash scripts/benchmark-foundry.sh

echo -e "\n--- BENCHMARKING GANACHE ---"
bash scripts/benchmark-ganache.sh

echo -e "\n--- BENCHMARKING HARDHAT ---"
bash scripts/benchmark-hardhat.sh

echo -e "\n--- BENCHMARKING BLOCKNATIVE ---"
bash scripts/benchmark-blocknative.sh
