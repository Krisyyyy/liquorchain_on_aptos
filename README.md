# LiquorChain on Aptos

基于 Aptos Testnet 的 LiquorChain dApp 与 Move 合约。一体化支持批次 NFT、酒瓶 NFT、监管凭证记录、角色管理以及前端展示与验证。

## 模块地址

- Testnet 部署账户：`0xee7f6e6168e3dbd14d4f37106b26d1753dec5180299bef219bfa515f56c0e7b6`
- 发布交易哈希：`0xeee3051f949181a1abb0285a9dc714f5c0faf12acb93094da7e6e3b063d0e96c`
- Explorer 链接：`https://explorer.aptoslabs.com/txn/0xeee3051f949181a1abb0285a9dc714f5c0faf12acb93094da7e6e3b063d0e96c?network=testnet`

## Tech Stack
- Aptos CLI `>= 7.11.1`
- Move Framework（依赖 `aptos-core`）
- React 18, Vite 5
- `aptos` TypeScript SDK

## 前置要求
- Node.js `>= 18`
- Aptos CLI（macOS 可 `brew install aptos`）
- Petra 钱包浏览器扩展

## 初始化步骤
1. 安装前端依赖：
   ```bash
   cd frontend
   npm install
   ```
2. 初始化 Aptos CLI（Testnet）：
   ```bash
   cd ..
   aptos init --network testnet
   # 或使用已有私钥：
   # aptos init --network testnet --private-key 0x<your_ed25519_private_key>
   ```
3. 领取测试网水龙头：
   - `https://aptos.dev/network/faucet?address=<your_account_address>`

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
- 模块地址在 `frontend/src/WalletContext.jsx`：
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

## 使用 Petra
- 在应用中点击“连接”以连接 Petra 钱包
- 可执行：初始化 TokenStore、创建集合、铸造批次/酒瓶 NFT
- 交易返回哈希，可在 Aptos Explorer 查看

## 故障排查
- 编译提示 `undeclared __COMPILE_FOR_TESTING__`：升级 Aptos CLI 至 `>= 7.11.1`
- Git 依赖拉取异常：使用 `--skip-fetch-latest-git-deps`
- Faucet API 错误（HTTP 500）：使用网页 `https://aptos.dev/network/faucet`
- 发布失败余额不足：先在 Testnet 充值

## 安全提示
- 不要将私钥或 `.aptos/config.yaml` 提交到仓库
- 推荐使用全局配置：`~/.aptos/global_config.yaml`
- 定期轮换密钥；勿分享私钥

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

## 合约功能与前端联动

- 合约提供的核心入口：
  - `create_collection`、`init_store`、`mint_batch_nft`、`mint_bottle_nft`、`add_attestation`
- 读接口：
  - `batch_count/batch_by_index`、`bottle_count/bottle_by_index`、`attestation_count/attestation_by_index`、`delivery_count/delivery_by_index`、`get_member_roles`
- 前端首页四个区块数据来源：
  - Selected Brands ← `BatchStore`
  - Bottle Registry ← `BottleStore`
  - Regulatory Attestations ← `AttestationStore`
  - Role-Based Access ← 静态角色展示（可接入 `MemberRoles`）

说明：事件句柄暂未启用，当前通过资源读取展示；后续可根据 Aptos 事件 API 加回事件以支持索引器与事件流。

## IPFS 工作流

- 在仪表盘的“Mint NFT”区域开启“使用 IPFS 存储元数据”，选择提供商并填写 API Token（当前支持 Pinata 的 Bearer Token）。
- 提交铸造前，前端将构造标准 NFT 元数据 JSON 并上传到 IPFS，返回的 `CID` 作为 `ipfs://CID` 写入合约 `uri`。
- 成功后会自动生成包含 `ipfs://CID` 的二维码图片，并上传到 IPFS；弹窗中展示 `CID` 与 `QR CID`。
- 可一键铸造二维码 NFT（`mint_qr_nft`），其 `uri` 指向 `ipfs://QR_CID` 或原始 `ipfs://CID`。
└─ README.md
```
