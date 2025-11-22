import React, { useMemo, useState } from 'react'
import { Layout, Typography, Space, Button, Form, Input, Select, Row, Col, Divider, message, Tag, Card, Statistic, ConfigProvider, Upload, Result, Avatar, Modal } from 'antd'
import { useAppWallet } from './WalletContext.jsx'
import { useLanguage } from './LanguageContext.jsx'
import logo from './assets/logo.svg'

const { Header, Content, Footer } = Layout
const { Title, Text } = Typography

export default function App() {
  const INDEXER_GQL_URL = (import.meta?.env?.VITE_INDEXER_GQL_URL) || 'https://api.testnet.aptoslabs.com/v1/graphql'
  const IPFS_GATEWAY = (import.meta?.env?.VITE_IPFS_GATEWAY) || 'https://ipfs.io/ipfs/'
  const QR_READ_API = (import.meta?.env?.VITE_QR_READ_API) || 'https://api.qrserver.com/v1/read-qr-code/'
  const QR_CREATE_API = (import.meta?.env?.VITE_QR_CREATE_API) || 'https://api.qrserver.com/v1/create-qr-code/'
  const { client, moduleAddress, address, connected, connect, disconnect, signAndSubmitTransaction } = useAppWallet()
  const { t, lang, setLang } = useLanguage()
  const [loading, setLoading] = useState(false)
  const [mintType, setMintType] = useState('batch')
  const [page, setPage] = useState('landing')
  const [scanLoading, setScanLoading] = useState(false)
  const [scanResult, setScanResult] = useState(null)
  const [showAddressModal, setShowAddressModal] = useState(false)
  const [logoSize, setLogoSize] = useState(40)
  const [brands, setBrands] = useState([])
  const [bottles, setBottles] = useState([])
  const [attestations, setAttestations] = useState([])
  const [detailId, setDetailId] = useState(null)
  const [memberRoles, setMemberRoles] = useState([])
  const [indexerEvents, setIndexerEvents] = useState([])
  const [eventFilter, setEventFilter] = useState('all')
  const [useIpfs, setUseIpfs] = useState(false)
  const [ipfsProvider, setIpfsProvider] = useState('pinata')
  const [ipfsToken, setIpfsToken] = useState('')
  const [qrModalVisible, setQrModalVisible] = useState(false)
  const [qrImageUrl, setQrImageUrl] = useState('')
  const [lastCid, setLastCid] = useState('')
  const [lastQrCid, setLastQrCid] = useState('')

  const addr = useMemo(() => address || '', [address])

  React.useEffect(() => {
    const update = () => {
      const w = typeof window !== 'undefined' ? window.innerWidth : 1024
      setLogoSize(w < 576 ? 28 : 40)
    }
    update()
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', update)
      return () => window.removeEventListener('resize', update)
    }
  }, [])

  React.useEffect(() => {
    const demoBrands = [
      { name: 'Bordeaux Reserve 2024', status: t('status_active'), batch: 1, grape: 'Cabernet Sauvignon', harvested: '2024-09-15', sugar: '22°', weight: '250kg', ripeness: '95%', farmer: '0x1234...5678' },
      { name: 'Tuscany Classic 2024', status: t('status_active'), batch: 2, grape: 'Sangiovese', harvested: '2024-09-10', sugar: '20°', weight: '220kg', ripeness: '90%', farmer: '0xabcd...efgh' },
      { name: 'Macallan 30 Years 2025', status: t('status_active'), batch: 3, grape: 'Single Malt Scotch', harvested: '1995-01-01', sugar: '0°', weight: '180kg', ripeness: '100%', farmer: '0x9999...aaaa' }
    ]
    const demoBottles = [
      { id: 101, title: 'Bordeaux Reserve 2024', status: t('status_sealed'), batch: 1, nfc: 'A1B2C3D4E5F6G7H8', winemaker: '0x5678...abcd' },
      { id: 102, title: 'Bordeaux Reserve 2024', status: t('status_sealed'), batch: 1, nfc: 'H8G7F6E5D4C3B2A1', winemaker: '0x5678...abcd' },
      { id: 103, title: 'Tuscany Classic 2024', status: t('status_unsealed'), batch: 2, nfc: '1A2B3C4D5E6F7G8H', winemaker: '0x9876...fedc' }
    ]
    const demoAtt = [
      { id: 1, title: 'Bordeaux Reserve 2024', status: t('valid'), standard: 'AOC Bordeaux', date: '2024-10-01', regulator: '0xREG1...4567', batch: 1 },
      { id: 2, title: 'Tuscany Classic 2024', status: t('valid'), standard: 'DOCG Chianti Classico', date: '2024-09-28', regulator: '0xREG2...8901', batch: 2 }
    ]
    setBrands(demoBrands)
    setBottles(demoBottles)
    setAttestations(demoAtt)
    ;(async () => {
      try {
        const decodeStr = (s) => {
          if (!s) return ''
          const hex = s.bytes || ''
          if (typeof hex === 'string' && hex.startsWith('0x')) {
            try {
              const hs = hex.slice(2)
              const pairs = hs.match(/.{1,2}/g) || []
              const bytes = new Uint8Array(pairs.map((p) => parseInt(p, 16)))
              return new TextDecoder('utf-8').decode(bytes)
            } catch { return '' }
          }
          return ''
        }
        const typeBatch = `${moduleAddress}::liquorchain::BatchStore`
        const typeBottle = `${moduleAddress}::liquorchain::BottleStore`
        const typeAtt = `${moduleAddress}::liquorchain::AttestationStore`
        const typeRoles = `${moduleAddress}::liquorchain::MemberRoles`
        const [batchRes, bottleRes, attRes] = await Promise.all([
          client.getAccountResource(moduleAddress, typeBatch).catch(() => null),
          client.getAccountResource(moduleAddress, typeBottle).catch(() => null),
          client.getAccountResource(moduleAddress, typeAtt).catch(() => null),
        ])
        if (batchRes && Array.isArray(batchRes.data?.records)) {
          const chainBrands = batchRes.data.records.map((r) => ({
            name: decodeStr(r.name),
            status: t('status_active'),
            batch: Number(r.id),
            grape: '',
            harvested: new Date(Number(r.ts) * 1000).toISOString().slice(0,10),
            sugar: '',
            weight: '',
            ripeness: '',
            farmer: r.creator,
          }))
          if (chainBrands.length) setBrands(chainBrands)
        }
        if (bottleRes && Array.isArray(bottleRes.data?.records)) {
          const chainBottles = bottleRes.data.records.map((r) => ({
            id: Number(r.id),
            title: decodeStr(r.name),
            status: t('status_sealed'),
            batch: Number(r.batch_id),
            nfc: '',
            winemaker: r.creator,
          }))
          if (chainBottles.length) setBottles(chainBottles)
        }
        if (attRes && Array.isArray(attRes.data?.records)) {
          const chainAtt = attRes.data.records.map((a) => ({
            id: Number(a.id),
            title: '',
            status: a.valid ? t('valid') : '',
            standard: decodeStr(a.standard),
            date: new Date(Number(a.date) * 1000).toISOString().slice(0,10),
            regulator: a.regulator,
            batch: Number(a.batch_id),
          }))
          if (chainAtt.length) setAttestations(chainAtt)
        }
        const rolesRes = await client.getAccountResource(moduleAddress, typeRoles).catch(() => null)
        if (rolesRes && Array.isArray(rolesRes.data?.roles)) {
          const rs = rolesRes.data.roles.map(decodeStr).filter(Boolean)
          if (rs.length) setMemberRoles(rs)
        }
        const gql = INDEXER_GQL_URL
        const q = {
          query: `query($addr: String) { token_activities_v2(where: { creator_address: { _eq: $addr } }, order_by: { transaction_version: desc }, limit: 10) { event_type token_name collection_name transaction_version from_address to_address creator_address } }`,
          variables: { addr: moduleAddress }
        }
        try {
          const r = await fetch(gql, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(q) })
          const j = await r.json()
          const evs = j?.data?.token_activities_v2 || []
          setIndexerEvents(evs)
        } catch {}
      } catch {}
    })()
  }, [moduleAddress, t])

  const onCreateCollection = async () => {
    if (!connected) return message.error(t('need_connect'))
    setLoading(true)
    try {
      const payload = {
        type: 'entry_function_payload',
        function: `${moduleAddress}::liquorchain::create_collection`,
        type_arguments: [],
        arguments: [],
      }
      const res = await signAndSubmitTransaction(payload)
      await client.waitForTransaction(res.hash)
      message.success(`${t('create_collection_success')} ${res.hash}`)
    } catch (e) {
      console.error(e)
      message.error(t('create_collection_fail'))
    } finally {
      setLoading(false)
    }
  }

  

  const onFinish = async (values) => {
    if (!connected) return message.error(t('need_connect'))
    const { name, description, uri, batchId, useIpfsForm, ipfsProviderForm, ipfsTokenForm } = values
    setLoading(true)
    try {
      try {
        const tokenStoreTypes = ['0x4::token::TokenStore', '0x3::token::TokenStore']
        let hasStore = false
        for (const ty of tokenStoreTypes) {
          const r = await client.getAccountResource(addr, ty).catch(() => null)
          if (r) { hasStore = true; break }
        }
        if (!hasStore) {
          message.error(t('need_init_store'))
          setLoading(false)
          setPage('dashboard')
          return
        }
      } catch {}
      let finalUri = uri
      const shouldIpfs = useIpfsForm ?? useIpfs
      const provider = ipfsProviderForm ?? ipfsProvider
      const token = ipfsTokenForm ?? ipfsToken
      const pinJSONPinata = async (json) => {
        const r = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(json)
        })
        const j = await r.json()
        if (!j.IpfsHash) throw new Error('pin json fail')
        return j.IpfsHash
      }
      const pinFilePinata = async (blob) => {
        const fd = new FormData()
        fd.append('file', blob, 'qr.png')
        const r = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: fd
        })
        const j = await r.json()
        if (!j.IpfsHash) throw new Error('pin file fail')
        return j.IpfsHash
      }
      if (shouldIpfs) {
        if (!provider || !token) {
          message.error(t('ipfs_required'))
          setLoading(false)
          return
        }
        const meta = {
          name,
          description,
          image: uri,
          attributes: [
            { trait_type: 'token_type', value: mintType },
            ...(mintType === 'bottle' ? [{ trait_type: 'batch_id', value: Number(batchId) }] : [])
          ]
        }
        const cid = await pinJSONPinata(meta)
        finalUri = `ipfs://${cid}`
        setLastCid(cid)
      }
      const payload =
        mintType === 'batch'
          ? {
              type: 'entry_function_payload',
              function: `${moduleAddress}::liquorchain::mint_batch_nft`,
              type_arguments: [],
              arguments: [name, description, finalUri],
            }
          : {
              type: 'entry_function_payload',
              function: `${moduleAddress}::liquorchain::mint_bottle_nft`,
              type_arguments: [],
              arguments: [Number(batchId), name, description, finalUri],
            }
      const res = await signAndSubmitTransaction(payload)
      await client.waitForTransaction(res.hash)
      message.success(`${t('mint_success')} ${res.hash}`)
      if (shouldIpfs && lastCid) {
        const qrApi = `${QR_CREATE_API}?size=220x220&data=${encodeURIComponent(`ipfs://${lastCid}`)}`
        const rr = await fetch(qrApi)
        const bb = await rr.blob()
        const qrCid = await pinFilePinata(bb)
        setLastQrCid(qrCid)
        const url = URL.createObjectURL(bb)
        setQrImageUrl(url)
        setQrModalVisible(true)
        message.success(t('qr_generated'))
      }
    } catch (e) {
      console.error(e)
      message.error(t('mint_fail'))
    } finally {
      setLoading(false)
    }
  }

  const Landing = () => (
    <Row align="middle" justify="space-between" style={{ paddingTop: 48 }}>
      <Col xs={24} md={12}>
        <Space direction="vertical" size={24} style={{ width: '100%' }}>
          <Title style={{ color: '#CFAE4E' }}>{t('hero_title')}</Title>
          <Text style={{ color: '#E5E7EB' }}>{t('hero_subtitle')}</Text>
          <Space>
            <Button size="large" onClick={() => setPage('verify')} style={{ background: '#FFFFFF', color: '#3A2C5A', borderColor: '#FFFFFF' }}>{t('cta_verify')}</Button>
            <Button size="large" onClick={() => setPage('dashboard')} style={{ background: 'rgba(255,255,255,0.85)', color: '#3A2C5A', borderColor: 'rgba(255,255,255,0.85)' }}>{t('cta_dashboard')}</Button>
          </Space>
          <Space>
            <Tag style={{ background: '#121212', color: '#E5E7EB', borderColor: '#121212', boxShadow: '0 0 8px rgba(0,0,0,0.35)' }}>{t('feature_anti_counterfeit')}</Tag>
            <Tag style={{ background: '#121212', color: '#E5E7EB', borderColor: '#121212', boxShadow: '0 0 8px rgba(0,0,0,0.35)' }}>{t('feature_transparency')}</Tag>
            <Tag style={{ background: '#121212', color: '#E5E7EB', borderColor: '#121212', boxShadow: '0 0 8px rgba(0,0,0,0.35)' }}>{t('feature_investment')}</Tag>
          </Space>
        </Space>
      </Col>
      <Col xs={24} md={12}>
        <Card style={{ background: '#2B214F' }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Text style={{ color: '#E5E7EB' }}>{t('module_address_label')}</Text>
            <Text style={{ color: '#CFAE4E' }}>{moduleAddress}</Text>
          </Space>
        </Card>
      </Col>
    </Row>
  )

  const AddressShort = (s) => (typeof s === 'string' && s.length > 10 ? `${s.slice(0,6)}...${s.slice(-4)}` : s)

  const LandingSections = () => (
    <Space direction="vertical" size={24} style={{ width: '100%', marginTop: 24 }}>
      <Title level={3} style={{ color: '#E5E7EB' }}>{t('selected_brands')}</Title>
      <Row gutter={[16, 16]}>
        {brands.map((b, i) => (
          <Col xs={24} md={8} key={i}>
            <Card style={{ background: '#2B214F' }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text style={{ color: '#E5E7EB' }}>{b.name}</Text>
                <Space>
                  <Tag style={{ background: '#121212', color: '#E5E7EB', borderColor: '#121212' }}>{b.status}</Tag>
                  <Tag style={{ background: '#121212', color: '#E5E7EB', borderColor: '#121212' }}>{t('batch_id')} #{b.batch}</Tag>
                </Space>
                <Text style={{ color: '#C8A95A' }}>{b.grape}</Text>
                <Space wrap>
                  <Tag style={{ background: '#2D224A', color: '#E5E7EB', borderColor: '#2D224A' }}>{t('harvested')}: {b.harvested}</Tag>
                  <Tag style={{ background: '#2D224A', color: '#E5E7EB', borderColor: '#2D224A' }}>{t('sugar')}: {b.sugar}</Tag>
                  <Tag style={{ background: '#2D224A', color: '#E5E7EB', borderColor: '#2D224A' }}>{t('weight')}: {b.weight}</Tag>
                  <Tag style={{ background: '#2D224A', color: '#E5E7EB', borderColor: '#2D224A' }}>{t('ripeness')}: {b.ripeness}</Tag>
                </Space>
                <Text style={{ color: '#E5E7EB' }}>{t('farmer')}: {b.farmer}</Text>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>

      <Title level={3} style={{ color: '#E5E7EB' }}>{t('bottle_registry')}</Title>
      <Row gutter={[16, 16]}>
        {bottles.map((r, i) => (
          <Col xs={24} md={8} key={i}>
            <Card style={{ background: '#2B214F' }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text style={{ color: '#E5E7EB' }}>Bottle #{r.id}</Text>
                <Text style={{ color: '#C8A95A' }}>{r.title}</Text>
                <Space>
                  <Tag style={{ background: '#121212', color: '#E5E7EB', borderColor: '#121212' }}>{r.status}</Tag>
                  <Tag style={{ background: '#121212', color: '#E5E7EB', borderColor: '#121212' }}>{t('batch_id')} #{r.batch}</Tag>
                </Space>
                <Text style={{ color: '#E5E7EB' }}>{t('nfc')}: {r.nfc}</Text>
                <Text style={{ color: '#E5E7EB' }}>{t('winemaker')}: {r.winemaker}</Text>
                <Button onClick={() => { setDetailId(r.id); setPage('bottle') }} style={{ background: '#FFFFFF', color: '#3A2C5A', borderColor: '#FFFFFF' }}>{t('view_detail')}</Button>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>

      <Title level={3} style={{ color: '#E5E7EB' }}>{t('regulatory_attestations')}</Title>
      <Row gutter={[16, 16]}>
        {attestations.map((a, i) => (
          <Col xs={24} md={12} key={i}>
            <Card style={{ background: '#2B214F' }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text style={{ color: '#E5E7EB' }}>{t('attestation_id')} #{a.id} — {a.title}</Text>
                <Space>
                  <Tag style={{ background: '#121212', color: '#E5E7EB', borderColor: '#121212' }}>{a.status}</Tag>
                  <Tag style={{ background: '#121212', color: '#E5E7EB', borderColor: '#121212' }}>{t('batch_id')} #{a.batch}</Tag>
                </Space>
                <Text style={{ color: '#E5E7EB' }}>{t('compliance_standard')}: {a.standard}</Text>
                <Text style={{ color: '#E5E7EB' }}>{t('attestation_date')}: {a.date}</Text>
                <Text style={{ color: '#E5E7EB' }}>{t('regulator_address')}: {a.regulator}</Text>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>

      <Title level={3} style={{ color: '#E5E7EB' }}>{t('role_based_access')}</Title>
      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <Card style={{ background: '#2B214F' }}>
            <Space wrap>
              {memberRoles.length ? memberRoles.map((r, i) => (
                <Tag key={i} style={{ background: '#121212', color: '#E5E7EB', borderColor: '#121212' }}>{r}</Tag>
              )) : <Tag style={{ background: '#2D224A', color: '#E5E7EB', borderColor: '#2D224A' }}>No Roles</Tag>}
            </Space>
          </Card>
        </Col>
        {[{
          role: t('role_farmer'), caps: ['Create batches','Update grape data','Record harvest events']
        },{
          role: t('role_winemaker'), caps: ['Mint bottles','Seal bottles','Record fermentation','Print NFTs']
        },{
          role: t('role_distributor'), caps: ['Create deliveries','Update delivery status','Track shipments']
        },{
          role: t('role_regulator'), caps: ['Issue attestations','Verify compliance','View all data']
        },{
          role: t('role_retailer'), caps: ['Receive deliveries','Verify authenticity','View batch history']
        },{
          role: t('role_consortium'), caps: ['All permissions','Add/remove members','Assign roles']
        }].map((r, i) => (
          <Col xs={24} md={8} key={i}>
            <Card style={{ background: '#2B214F' }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text style={{ color: '#E5E7EB' }}>{r.role}</Text>
                <Text style={{ color: '#C8A95A' }}>{t('capabilities')}</Text>
                <Space direction="vertical">
                  {r.caps.map((c, j) => (
                    <Tag key={j} style={{ background: '#121212', color: '#E5E7EB', borderColor: '#121212' }}>{c}</Tag>
                  ))}
                </Space>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>

      <Title level={3} style={{ color: '#E5E7EB' }}>{t('indexer_label')}</Title>
      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <Card style={{ background: '#2B214F' }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Space>
                <Text style={{ color: '#E5E7EB' }}>{t('event_filter')}</Text>
                <Select
                  value={eventFilter}
                  onChange={setEventFilter}
                  options={[
                    { value: 'all', label: t('filter_all') },
                    { value: 'mint', label: t('filter_mint') },
                    { value: 'transfer', label: t('filter_transfer') },
                  ]}
                  style={{ width: 160 }}
                />
              </Space>
              {indexerEvents.length ? indexerEvents.filter((e) => {
                const et = String(e.event_type || '').toLowerCase()
                if (eventFilter === 'mint') return et.includes('mint')
                if (eventFilter === 'transfer') return et.includes('transfer')
                return true
              }).map((e, i) => (
                <Space key={i}>
                  <Tag style={{ background: '#121212', color: '#E5E7EB', borderColor: '#121212' }}>{e.event_type}</Tag>
                  <Text style={{ color: '#E5E7EB' }}>{e.collection_name} / {e.token_name}</Text>
                  <Text style={{ color: '#C8A95A' }}>{e.transaction_version}</Text>
                </Space>
              )) : <Result status="info" title="No Events" />}
            </Space>
          </Card>
        </Col>
      </Row>
    </Space>
  )

  const BottleDetail = () => {
    const bottle = bottles.find(b => b.id === detailId)
    const [proofFile, setProofFile] = React.useState(null)
    const [proofLoading, setProofLoading] = React.useState(false)
    const [proofResult, setProofResult] = React.useState(null)
    return (
      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <Card style={{ background: '#2B214F' }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Title level={3} style={{ color: '#E5E7EB' }}>{t('details')}</Title>
              {bottle ? (
                <Space direction="vertical">
                  <Text style={{ color: '#E5E7EB' }}>{t('bottle_id')}: {bottle.id}</Text>
                  <Text style={{ color: '#C8A95A' }}>{t('title')}: {bottle.title}</Text>
                  <Text style={{ color: '#E5E7EB' }}>{t('status')}: {bottle.status}</Text>
                  <Text style={{ color: '#E5E7EB' }}>{t('batch_id')}: #{bottle.batch}</Text>
                  <Text style={{ color: '#E5E7EB' }}>{t('nfc')}: {bottle.nfc}</Text>
                  <Text style={{ color: '#E5E7EB' }}>{t('winemaker')}: {bottle.winemaker}</Text>
                  <Divider />
                  <Text style={{ color: '#E5E7EB' }}>{t('module')}: {moduleAddress}</Text>
                </Space>
              ) : (
                <Result status="info" title="Not Found" />
              )}
              <Space>
                <Button onClick={() => setPage('landing')}>{t('nav_home')}</Button>
                <Button type="primary" onClick={() => setPage('verify')}>{t('nav_verify')}</Button>
              </Space>
            </Space>
          </Card>
          <Card style={{ background: '#2B214F', marginTop: 16 }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Title level={4} style={{ color: '#E5E7EB' }}>{t('proof_card')}</Title>
              <Upload beforeUpload={() => false} maxCount={1} onChange={(info) => {
                const f = info.fileList?.[0]?.originFileObj
                if (f) setProofFile(f)
              }}>
                <Button>{t('upload')}</Button>
              </Upload>
              <Form layout="vertical" onFinish={async (v) => {
                setProofLoading(true)
                try {
                  let cid = ''
                  if (proofFile) {
                    const fd = new FormData()
                    fd.append('file', proofFile)
                    const r = await fetch(QR_READ_API, { method: 'POST', body: fd })
                    const j = await r.json()
                    const data = j?.[0]?.symbol?.[0]?.data || ''
                    if (typeof data === 'string') {
                      if (data.startsWith('ipfs://')) cid = data.replace('ipfs://','')
                      else if (data.includes('/ipfs/')) {
                        const m = data.match(/\/ipfs\/(\w+)/)
                        cid = m ? m[1] : ''
                      }
                    }
                  }
                  if (!cid) {
                    const input = v.cidOrLink || ''
                    if (input.startsWith('ipfs://')) cid = input.replace('ipfs://','')
                    else if (input.includes('/ipfs/')) {
                      const m = input.match(/\/ipfs\/(\w+)/)
                      cid = m ? m[1] : ''
                    } else {
                      cid = input
                    }
                  }
                  if (!cid) {
                    setProofResult({ success: false })
                    setProofLoading(false)
                    return
                  }
                  const url = `${IPFS_GATEWAY}${cid}`
                  let meta = await fetch(url).then((r) => r.json().catch(() => null)).catch(() => null)
                  if (!meta) meta = { name: '', image: url }
                  const gql = INDEXER_GQL_URL
                  let q
                  if (meta?.name) {
                    q = {
                      query: `query($name: String) { token_activities_v2(where: { collection_name: { _eq: "LiquorChain Collection" }, token_name: { _eq: $name } }, order_by: { transaction_version: desc }, limit: 3) { event_type token_name collection_name transaction_version } }`,
                      variables: { name: meta.name }
                    }
                  } else {
                    q = {
                      query: `query { token_activities_v2(where: { collection_name: { _eq: "LiquorChain Collection" } }, order_by: { transaction_version: desc }, limit: 3) { event_type token_name collection_name transaction_version } }`
                    }
                  }
                  let activities = []
                  try {
                    const rr = await fetch(gql, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(q) })
                    const jj = await rr.json()
                    activities = jj?.data?.token_activities_v2 || []
                  } catch {}
                  const ok = activities.length > 0
                  setProofResult({ success: ok, cid, meta, activities })
                } catch (e) {
                  setProofResult({ success: false })
                } finally {
                  setProofLoading(false)
                }
              }}>
                <Form.Item label={t('verify_input_cid')} name="cidOrLink">
                  <Input placeholder="ipfs://CID 或 https://gateway/ipfs/CID" />
                </Form.Item>
                <Button type="primary" htmlType="submit" loading={proofLoading}>{t('verify_start')}</Button>
              </Form>
              {proofLoading ? (
                <Result status="info" title={t('verify_fetching')} />
              ) : proofResult ? (
                proofResult.success ? (
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Result status="success" title={t('verify_ok')} subTitle={`CID ${proofResult.cid}`} />
                    {proofResult.meta?.image ? <img src={proofResult.meta.image} alt="image" style={{ maxWidth: 280 }} /> : null}
                    <Title level={5}>{t('metadata')}</Title>
                    <pre style={{ whiteSpace: 'pre-wrap', color: '#E5E7EB' }}>{JSON.stringify(proofResult.meta, null, 2)}</pre>
                    <Title level={5}>{t('indexer_label')}</Title>
                    <pre style={{ whiteSpace: 'pre-wrap', color: '#E5E7EB' }}>{JSON.stringify(proofResult.activities, null, 2)}</pre>
                  </Space>
                ) : (
                  <Result status="error" title={t('verify_fail')} />
                )
              ) : null}
            </Space>
          </Card>
        </Col>
      </Row>
    )
  }

  const Dashboard = () => (
    <Row gutter={[24, 24]}>
      <Col xs={24} md={8}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Card>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Title level={4}>{t('section_collection_account')}</Title>
              <Button block disabled={loading} onClick={onCreateCollection}>{t('create_collection')}</Button>
            </Space>
          </Card>
          <Card>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Title level={4}>{t('section_roles')}</Title>
              <Form layout="vertical" onFinish={async (v) => {
                if (!connected) return message.error(t('need_connect'))
                setLoading(true)
                try {
                  const roles = (v.rolesCSV || '').split(',').map((s) => s.trim()).filter(Boolean)
                  const payload = {
                    type: 'entry_function_payload',
                    function: `${moduleAddress}::liquorchain::set_member_roles`,
                    type_arguments: [],
                    arguments: [roles],
                  }
                  const res = await signAndSubmitTransaction(payload)
                  await client.waitForTransaction(res.hash)
                  message.success(`${t('set_roles_success')} ${res.hash}`)
                } catch (e) {
                  console.error(e)
                  message.error(t('set_roles_fail'))
                } finally {
                  setLoading(false)
                }
              }}>
                <Form.Item label={t('set_roles')} name="rolesCSV">
                  <Input placeholder={t('roles_input_placeholder')} />
                </Form.Item>
                <Button type="primary" htmlType="submit" disabled={loading} block>{t('set_roles')}</Button>
              </Form>
            </Space>
          </Card>
          <Card>
            <Statistic title="最近验证" value={3} suffix="次" />
          </Card>
        </Space>
      </Col>
      <Col xs={24} md={16}>
        <Card>
          <Title level={4}>{t('section_mint')}</Title>
          <Form layout="vertical" onFinish={onFinish} initialValues={{ mintType: 'batch', useIpfsForm: useIpfs, ipfsProviderForm: ipfsProvider, uri: 'ipfs://bafybeicpqb35s6cwzyaxxnxkm35oad65agmxmc3sl7kj2imz4dlhdn4sdm' }}>
            <Form.Item label={t('type')} name="mintType" initialValue={mintType}>
              <Select
                value={mintType}
                onChange={setMintType}
                options={[
                  { value: 'batch', label: t('batch_nft') },
                  { value: 'bottle', label: t('bottle_nft') },
                ]}
              />
            </Form.Item>
            {mintType === 'bottle' && (
              <Form.Item label={t('linked_batch_id')} name="batchId" rules={[{ required: true, message: t('require_batch_id') }]}> 
                <Input placeholder={t('linked_batch_id_placeholder')} />
              </Form.Item>
            )}
            <Form.Item label={t('name')} name="name" rules={[{ required: true, message: t('require_name') }]}> 
              <Input placeholder={t('name_placeholder')} />
            </Form.Item>
            <Form.Item label={t('description')} name="description" rules={[{ required: true, message: t('require_description') }]}> 
              <Input.TextArea rows={3} placeholder={t('description_placeholder')} />
            </Form.Item>
            <Form.Item label={t('uri')} name="uri" rules={[{ required: true, message: t('require_uri') }]}> 
              <Input placeholder={t('uri_placeholder')} />
            </Form.Item>
            <Form.Item label={t('use_ipfs')} name="useIpfsForm">
              <Select value={useIpfs} onChange={(v) => setUseIpfs(!!v)} options={[{ value: true, label: 'On' }, { value: false, label: 'Off' }]} />
            </Form.Item>
            <Form.Item label={t('ipfs_provider')} name="ipfsProviderForm">
              <Select value={ipfsProvider} onChange={setIpfsProvider} options={[{ value: 'pinata', label: t('provider_pinata') }]} />
            </Form.Item>
            <Form.Item label={t('ipfs_token')} name="ipfsTokenForm">
              <Input value={ipfsToken} onChange={(e) => setIpfsToken(e.target.value)} placeholder="Bearer Token" />
            </Form.Item>
            <Divider />
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} block>{t('mint_nft_wallet')}</Button>
            </Form.Item>
          </Form>
        </Card>
      </Col>
    </Row>
  )

  const Verify = () => (
    <Row gutter={[24, 24]}>
      <Col xs={24} md={10}>
        <Card>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Title level={4}>{t('verify_title')}</Title>
            <Upload beforeUpload={() => false} maxCount={1} onChange={(info) => {
              const f = info.fileList?.[0]?.originFileObj
              if (f) setScanResult({ file: f })
            }}>
              <Button>{t('upload')}</Button>
            </Upload>
            <Form layout="vertical" onFinish={async (v) => {
              setScanLoading(true)
              try {
                let cid = ''
                if (scanResult?.file) {
                  const fd = new FormData()
                  fd.append('file', scanResult.file)
                  const r = await fetch(QR_READ_API, { method: 'POST', body: fd })
                  const j = await r.json()
                  const data = j?.[0]?.symbol?.[0]?.data || ''
                  if (typeof data === 'string') {
                    if (data.startsWith('ipfs://')) cid = data.replace('ipfs://','')
                    else if (data.includes('/ipfs/')) {
                      const m = data.match(/\/ipfs\/(\w+)/)
                      cid = m ? m[1] : ''
                    }
                  }
                }
                if (!cid) {
                  const input = v.cidOrLink || ''
                  if (input.startsWith('ipfs://')) cid = input.replace('ipfs://','')
                  else if (input.includes('/ipfs/')) {
                    const m = input.match(/\/ipfs\/(\w+)/)
                    cid = m ? m[1] : ''
                  } else {
                    cid = input
                  }
                }
                if (!cid) {
                  setScanResult({ success: false, reason: 'CID missing' })
                  setScanLoading(false)
                  return
                }
                const url = `${IPFS_GATEWAY}${cid}`
                let meta = await fetch(url).then((r) => r.json().catch(() => null)).catch(() => null)
                if (!meta) meta = { name: '', image: url }
                const gql = INDEXER_GQL_URL
                let q
                if (meta?.name) {
                  q = {
                    query: `query($name: String) { token_activities_v2(where: { collection_name: { _eq: "LiquorChain Collection" }, token_name: { _eq: $name } }, order_by: { transaction_version: desc }, limit: 1) { event_type token_name collection_name transaction_version } }`,
                    variables: { name: meta.name }
                  }
                } else {
                  q = {
                    query: `query { token_activities_v2(where: { collection_name: { _eq: "LiquorChain Collection" } }, order_by: { transaction_version: desc }, limit: 1) { event_type token_name collection_name transaction_version } }`
                  }
                }
                let activities = []
                try {
                  const rr = await fetch(gql, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(q) })
                  const jj = await rr.json()
                  activities = jj?.data?.token_activities_v2 || []
                } catch {}
                const ok = activities.length > 0
                setScanResult({ success: ok, cid, meta, activities })
              } catch (e) {
                setScanResult({ success: false })
              } finally {
                setScanLoading(false)
              }
            }}>
              <Form.Item label={t('verify_input_cid')} name="cidOrLink">
                <Input placeholder="ipfs://CID 或 https://gateway/ipfs/CID" />
              </Form.Item>
              <Button type="primary" htmlType="submit" loading={scanLoading}>{t('verify_start')}</Button>
            </Form>
          </Space>
        </Card>
        <Card style={{ marginTop: 16 }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Title level={5}>{t('verify_help_title')}</Title>
            <Text>{t('verify_help_text')}</Text>
          </Space>
        </Card>
      </Col>
      <Col xs={24} md={14}>
        <Card>
          {scanLoading ? (
            <Result status="info" title={t('verify_fetching')} />
          ) : scanResult ? (
            scanResult.success ? (
              <Space direction="vertical" style={{ width: '100%' }}>
                <Result status="success" title={t('verify_ok')} subTitle={`CID ${scanResult.cid}`} />
                {scanResult.meta?.image ? <img src={scanResult.meta.image} alt="image" style={{ maxWidth: 280 }} /> : null}
                <Title level={5}>{t('metadata')}</Title>
                <pre style={{ whiteSpace: 'pre-wrap', color: '#E5E7EB' }}>{JSON.stringify(scanResult.meta, null, 2)}</pre>
                <Title level={5}>{t('indexer_label')}</Title>
                <pre style={{ whiteSpace: 'pre-wrap', color: '#E5E7EB' }}>{JSON.stringify(scanResult.activities, null, 2)}</pre>
              </Space>
            ) : (
              <Result status="error" title={t('verify_fail')} subTitle="未查询到有效数据" />
            )
          ) : (
            <Result status="info" title="等待验证" subTitle="请上传或输入 CID" />
          )}
        </Card>
      </Col>
    </Row>
  )

  const Profile = () => (
    <Row gutter={[24, 24]}>
      <Col xs={24}>
        <Card>
          <Space align="center" size={24}>
            <Avatar shape="square" size={64}>LC</Avatar>
            <Space direction="vertical">
              <Text>{connected && addr ? addr : t('disconnected')}</Text>
              <Space>
                {connected ? <Button onClick={disconnect}>{t('disconnect')}</Button> : <Button type="primary" onClick={connect}>{t('connect_petra')}</Button>}
                <Button onClick={() => setShowAddressModal(true)}>模块地址</Button>
              </Space>
            </Space>
          </Space>
        </Card>
      </Col>
    </Row>
  )

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#3A2C5A',
          colorInfo: '#3A2C5A',
          colorSuccess: '#6BBF65',
          colorWarning: '#C8A95A',
          colorError: '#E24C4B',
          colorText: '#E5E7EB',
          colorBgBase: '#2D224A',
          colorBgLayout: '#37275A',
          colorBgContainer: '#2B214F',
          borderRadius: 8,
        }
      }}
    >
      <Layout style={{ minHeight: '100vh', background: '#37275A' }}>
        <Header style={{ background: '#2D224A' }}>
          <Row align="middle" justify="space-between">
            <Col>
              <Space>
                <img src={logo} alt="LiquorChain" style={{ width: logoSize, height: 'auto' }} />
                <Title level={3} style={{ margin: 0, color: '#CFAE4E' }}>LIQUORCHAIN</Title>
                <Tag color="purple">{t('network_tag')}</Tag>
              </Space>
            </Col>
            <Col>
              <Space>
                <Button type={page === 'landing' ? 'primary' : 'default'} onClick={() => setPage('landing')}>{t('nav_home')}</Button>
                <Button type={page === 'dashboard' ? 'primary' : 'default'} onClick={() => setPage('dashboard')}>{t('nav_dashboard')}</Button>
                <Button type={page === 'verify' ? 'primary' : 'default'} onClick={() => setPage('verify')}>{t('nav_verify')}</Button>
                <Button type={page === 'profile' ? 'primary' : 'default'} onClick={() => setPage('profile')}>{t('nav_profile')}</Button>
                <Select
                  value={lang}
                  onChange={setLang}
                  options={[{ value: 'zh', label: t('zh') }, { value: 'en', label: t('en') }]}
                  style={{ width: 110 }}
                />
              </Space>
            </Col>
          </Row>
        </Header>
        <Content style={{ padding: 24 }}>
          {page === 'landing' && (<>
            <Landing />
            <LandingSections />
          </>)}
          {page === 'bottle' && <BottleDetail />}
          {page === 'dashboard' && <Dashboard />}
          {page === 'verify' && <Verify />}
          {page === 'profile' && <Profile />}
        </Content>
        <Footer style={{ textAlign: 'center', background: '#2D224A', color: '#E5E7EB' }}>
          LiquorChain © {new Date().getFullYear()} {t('footer')}
        </Footer>
        <Modal open={showAddressModal} onCancel={() => setShowAddressModal(false)} onOk={() => setShowAddressModal(false)}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Text>模块地址</Text>
            <Text style={{ color: '#C8A95A' }}>{moduleAddress}</Text>
          </Space>
        </Modal>
        <Modal open={qrModalVisible} onCancel={() => setQrModalVisible(false)} footer={null} title={t('qr_generated')}>
          <Space direction="vertical" style={{ width: '100%' }}>
            {qrImageUrl ? <img src={qrImageUrl} alt="QR" style={{ width: 220, height: 220 }} /> : null}
            <Text>{t('cid')}: {lastCid}</Text>
            <Text>{t('qr_cid')}: {lastQrCid}</Text>
            <Button type="primary" onClick={async () => {
              if (!connected) return message.error(t('need_connect'))
              try {
                const payload = {
                  type: 'entry_function_payload',
                  function: `${moduleAddress}::liquorchain::mint_qr_nft`,
                  type_arguments: [],
                  arguments: [
                    `QR ${lastCid}`,
                    `QR for ${lastCid}`,
                    lastQrCid ? `ipfs://${lastQrCid}` : `ipfs://${lastCid}`
                  ],
                }
                const res = await signAndSubmitTransaction(payload)
                await client.waitForTransaction(res.hash)
                message.success(`${t('mint_qr_success')} ${res.hash}`)
              } catch (e) {
                console.error(e)
                message.error(t('mint_qr_fail'))
              }
            }}>{t('mint_qr_nft')}</Button>
          </Space>
        </Modal>
      </Layout>
    </ConfigProvider>
  )
}
