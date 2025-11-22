# LiquorChain on Aptos

Luxury spirits provenance dApp and Move contracts on Aptos Testnet. Supports Batch NFTs, Bottle NFTs, regulatory attestations, role management, and a React frontend with verification.

## Module Address
- Testnet account: `0xee7f6e6168e3dbd14d4f37106b26d1753dec5180299bef219bfa515f56c0e7b6`
- Publish Tx: `0xeee3051f949181a1abb0285a9dc714f5c0faf12acb93094da7e6e3b063d0e96c`
- Explorer: `https://explorer.aptoslabs.com/txn/0xeee3051f949181a1abb0285a9dc714f5c0faf12acb93094da7e6e3b063d0e96c?network=testnet`

## Tech Stack
- Aptos CLI `>= 7.11.1`
- Move Framework (`aptos-core`)
- React 18, Vite 5
- `aptos` TypeScript SDK

## Requirements
- Node.js `>= 18`
- Aptos CLI (`brew install aptos` on macOS)
- Petra wallet extension

## Quick Start
1) Install frontend deps:
```bash
cd frontend
npm install
```
2) Init Aptos CLI (Testnet):
```bash
cd ..
aptos init --network testnet
# Or use existing key:
# aptos init --network testnet --private-key 0x<your_ed25519_private_key>
```
3) Faucet:
`https://aptos.dev/network/faucet?address=<your_account_address>`

## Move Contracts
- Addresses config: `move-contracts/Move.toml`
  - `addresses.liquorchain = "0x<your_account_address>"`
- Compile:
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
- Module path after publish:
```
0x<your_account_address>::liquorchain
```

## Frontend
- Module address is in `frontend/src/WalletContext.jsx`:
```js
const MODULE_ADDRESS = '0x<your_account_address>'
```
- Dev:
```bash
npm run dev
```
- Build & preview:
```bash
npm run build
npm run preview
# http://localhost:4173/
```

## Environment Variables (optional)
Configure in Vercel/Lovable Project Settings:
- `VITE_NODE_URL` (default `https://fullnode.testnet.aptoslabs.com/v1`)
- `VITE_MODULE_ADDRESS` (default to the built-in testnet address)
- `VITE_INDEXER_GQL_URL` (default `https://api.testnet.aptoslabs.com/v1/graphql`)
- `VITE_IPFS_GATEWAY` (default `https://ipfs.io/ipfs/`)
- `VITE_QR_READ_API` (default `https://api.qrserver.com/v1/read-qr-code/`)
- `VITE_QR_CREATE_API` (default `https://api.qrserver.com/v1/create-qr-code/`)

## Deployment
- Vercel
  - Framework Preset: `Vite`
  - Root Directory: `frontend`
  - Install: `npm ci`
  - Build: `npm run build`
  - Output: `dist`
  - SPA Fallback: enabled
- Lovable
  - Import GitHub repo
  - Same Root/Build/Output as above

## Features
- IPFS workflow: upload metadata to IPFS before mint, QR code generated and optionally minted as a QR NFT.
- Verify flow: scan QR or input link, fetch IPFS metadata, cross-check Aptos Indexer activities.
- Bottle Detail: Proof Card for on-page verification.
- Indexer Events: filter by All / Mint Only / Transfer Only.

## Structure
```
liquorchain_on_aptos/
├─ move-contracts/
│  ├─ Move.toml
│  └─ sources/
│     └─ liquorchain.move
├─ frontend/
│  ├─ src/
│  │  ├─ App.jsx
│  │  ├─ LanguageContext.jsx
│  │  └─ WalletContext.jsx
│  └─ package.json
└─ README.md
```

## Security
- Never commit private keys or `.aptos/config.yaml`.
- Prefer `~/.aptos/global_config.yaml`.

---

## LiquorChain on Aptos（中文）

基于 Aptos Testnet 的 LiquorChain dApp 与 Move 合约。一体化支持批次 NFT、酒瓶 NFT、监管凭证记录、角色管理以及前端展示与验证。

## 模块地址
- Testnet 部署账户：`0xee7f6e6168e3dbd14d4f37106b26d1753dec5180299bef219bfa515f56c0e7b6`
- 发布交易哈希：`0xeee3051f949181a1abb0285a9dc714f5c0faf12acb93094da7e6e3b063d0e96c`
- Explorer 链接：`https://explorer.aptoslabs.com/txn/0xeee3051f949181a1abb0285a9dc714f5c0faf12acb93094da7e6e3b063d0e96c?network=testnet`

## 技术栈
- Aptos CLI `>= 7.11.1`
- Move Framework（依赖 `aptos-core`）
- React 18, Vite 5
- `aptos` TypeScript SDK

## 前置要求
- Node.js `>= 18`
- Aptos CLI（macOS 可 `brew install aptos`）
- Petra 钱包浏览器扩展

## 初始化步骤
1) 安装前端依赖：
```bash
cd frontend
npm install
```
2) 初始化 Aptos CLI（Testnet）：
```bash
cd ..
aptos init --network testnet
# 或使用已有私钥：
# aptos init --network testnet --private-key 0x<your_ed25519_private_key>
```
3) 领取测试网水龙头：
`https://aptos.dev/network/faucet?address=<your_account_address>`

## Move 合约
- 命名地址配置：`move-contracts/Move.toml`
  - `addresses.liquorchain = "0x<your_account_address>"`
- 本地编译：
```bash
aptos move compile --package-dir move-contracts --skip-fetch-latest-git-deps
```
- 发布到 Testnet：
```bash
aptos move publish \
  --package-dir move-contracts \
  --skip-fetch-latest-git-deps \
  --max-gas 200000 \
  --gas-unit-price 100 \
  --assume-yes
```
- 发布后模块路径：
```
0x<your_account_address>::liquorchain
```

## 前端
- 模块地址位于 `frontend/src/WalletContext.jsx`
```js
const MODULE_ADDRESS = '0x<your_account_address>'
```
- 开发模式：
```bash
npm run dev
```
- 生产构建与预览：
```bash
npm run build
npm run preview
# 访问 http://localhost:4173/
```

## 环境变量（可选）
- 在 Vercel/Lovable 项目环境变量中配置：
  - `VITE_NODE_URL`、`VITE_MODULE_ADDRESS`、`VITE_INDEXER_GQL_URL`、`VITE_IPFS_GATEWAY`、`VITE_QR_READ_API`、`VITE_QR_CREATE_API`

## 部署
- Vercel：Preset 选 `Vite`，Root `frontend`，Build `npm run build`，Output `dist`，开启 SPA Fallback
- Lovable：导入 GitHub 仓库，配置同上

## 功能
- IPFS 工作流：铸造前上传元数据到 IPFS，生成二维码并可铸造二维码 NFT
- 验证流程：扫码/输入链接，获取 IPFS 元数据并交叉检查 Indexer 活动
- Bottle 详情：内置“证明卡片”支持页内验证
- 索引器事件：支持“全部/仅 Mint/仅 Transfer”过滤

## 项目结构
```
liquorchain_on_aptos/
├─ move-contracts/
│  ├─ Move.toml
│  └─ sources/
│     └─ liquorchain.move
├─ frontend/
│  ├─ src/
│  │  ├─ App.jsx
│  │  ├─ LanguageContext.jsx
│  │  └─ WalletContext.jsx
│  └─ package.json
└─ README.md
```

## 安全提示
- 不要提交私钥或 `.aptos/config.yaml`
- 推荐使用 `~/.aptos/global_config.yaml`
