# LiquorChain on Aptos

A full-stack example for managing liquor NFTs on Aptos:
- Move contracts under `move-contracts/`
- React + Vite frontend under `frontend/`
- Petra wallet integration for signing and submitting transactions

## Tech Stack
- Aptos CLI `>= 7.11.1`
- Move Framework (git deps from `aptos-core`)
- React 18, Vite 5
- `aptos` TypeScript SDK

## Prerequisites
- Node.js `>= 18`
- Aptos CLI installed (`brew install aptos` on macOS)
- Petra wallet browser extension

## Setup
1. Install frontend deps:
   ```bash
   cd frontend
   npm install
   ```
2. Initialize Aptos CLI profile (Testnet):
   ```bash
   cd ..
   aptos init --network testnet
   # or provide an existing private key
   # aptos init --network testnet --private-key 0x<your_ed25519_private_key>
   ```
3. Fund your Testnet account:
   - Open: `https://aptos.dev/network/faucet?address=<your_account_address>`

## Move Contracts
- Named address configuration: `move-contracts/Move.toml`
  - Set `liquorchain = "0x<your_account_address>"`
- Compile locally:
  ```bash
  aptos move compile --package-dir move-contracts --skip-fetch-latest-git-deps
  ```
- Publish to Testnet:
  ```bash
  aptos move publish \
    --package-dir move-contracts \
    --skip-fetch-latest-git-deps \
    --max-gas 200000 \
    --gas-unit-price 100 \
    --assume-yes
  ```
- After publish, your module path will be:
  ```
  0x<your_account_address>::liquorchain
  ```

## Frontend
- Configure module address in `frontend/src/WalletContext.jsx`:
  ```js
  const MODULE_ADDRESS = '0x<your_account_address>'
  ```
- Development:
  ```bash
  npm run dev
  ```
- Production build + preview:
  ```bash
  npm run build
  npm run preview
  # visit http://localhost:4173/
  ```

## Using Petra
- Click “Connect” in the app to connect Petra
- Perform actions: initialize token store, create collection, mint batch/bottle NFTs
- Transactions return hashes that can be inspected in Aptos Explorer

## Troubleshooting
- `undeclared __COMPILE_FOR_TESTING__` during compile:
  - Upgrade Aptos CLI to `>= 7.11.1`
- Git dependency reset errors:
  - Use `--skip-fetch-latest-git-deps` for reliability
- Faucet API errors (HTTP 500):
  - Prefer the web faucet link: `https://aptos.dev/network/faucet`
- Insufficient balance when publishing:
  - Fund account on Testnet before running publish

## Security Notes
- Do not commit private keys or `.aptos/config.yaml` to source control
- Prefer using a global config (`~/.aptos/global_config.yaml`)
- Rotate keys periodically; never share private keys

## Project Structure
```
liquorchain_on_aptos/
├─ move-contracts/
│  ├─ Move.toml
│  └─ sources/
│     └─ liquorchain.move
├─ frontend/
│  ├─ src/
│  │  ├─ App.jsx
│  │  └─ WalletContext.jsx
│  └─ package.json
└─ README.md
```
