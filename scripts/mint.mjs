import 'dotenv/config'
import { Account, Aptos, AptosConfig, Network, NetworkToNetworkName, Ed25519PrivateKey } from '@aptos-labs/ts-sdk'

const APTOS_NETWORK = NetworkToNetworkName[process.env.APTOS_NETWORK] || Network.TESTNET
const config = new AptosConfig({ network: APTOS_NETWORK })
const aptos = new Aptos(config)

async function main() {
  const raw = process.env.PRIVATE_KEY || ''
  if (!raw) throw new Error('PRIVATE_KEY missing in env')
  const key = raw.startsWith('ed25519-priv-') ? raw : `ed25519-priv-${raw}`
  const alice = Account.fromPrivateKey({ privateKey: new Ed25519PrivateKey(key) })

  const collectionName = process.env.COLLECTION_NAME || 'LiquorChain Collection'
  const collectionDescription = process.env.COLLECTION_DESCRIPTION || 'LiquorChain digital assets'
  const collectionURI = process.env.COLLECTION_URI || 'https://aptos.dev'

  const createCollectionTxn = await aptos.createCollectionTransaction({
    creator: alice,
    description: collectionDescription,
    name: collectionName,
    uri: collectionURI,
  })
  const committedCollection = await aptos.signAndSubmitTransaction({ signer: alice, transaction: createCollectionTxn })
  await aptos.waitForTransaction({ transactionHash: committedCollection.hash })

  const tokenName = process.env.TOKEN_NAME || 'LiquorChain NFT'
  const tokenDescription = process.env.TOKEN_DESCRIPTION || 'LiquorChain asset'
  const tokenURI = process.env.TOKEN_URI || 'ipfs://bafybeicpqb35s6cwzyaxxnxkm35oad65agmxmc3sl7kj2imz4dlhdn4sdm'

  const mintTxnReq = await aptos.mintDigitalAssetTransaction({
    creator: alice,
    collection: collectionName,
    description: tokenDescription,
    name: tokenName,
    uri: tokenURI,
  })
  const mintTxn = await aptos.signAndSubmitTransaction({ signer: alice, transaction: mintTxnReq })
  await aptos.waitForTransaction({ transactionHash: mintTxn.hash })

  const owned = await aptos.getOwnedDigitalAssets({ ownerAddress: alice.accountAddress })
  console.log(JSON.stringify({
    network: APTOS_NETWORK,
    address: `${alice.accountAddress}`,
    collection_tx: committedCollection.hash,
    mint_tx: mintTxn.hash,
    owned_count: owned.length,
  }, null, 2))
}

main().catch((e) => { console.error(e); process.exit(1) })

