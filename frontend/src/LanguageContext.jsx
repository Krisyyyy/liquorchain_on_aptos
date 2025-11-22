import React, { createContext, useContext, useMemo, useState, useCallback, useEffect } from 'react'

const dict = {
  zh: {
    app_title: 'LiquorChain dApp',
    network_tag: 'Aptos Testnet',
    disconnected: '未连接',
    address_label: '地址',
    disconnect: '断开',
    connect_petra: '连接 Petra',
    section_collection_account: '集合与账户',
    create_collection: '创建集合',
    init_tokenstore: '初始化 TokenStore',
    section_mint: 'NFT 铸造',
    type: '类型',
    batch_nft: '批次 NFT',
    bottle_nft: '瓶子 NFT',
    linked_batch_id: '关联批次 ID',
    linked_batch_id_placeholder: '例如 1',
    name: '名称',
    name_placeholder: '例如：Liquor Batch #1',
    description: '描述',
    description_placeholder: '描述信息',
    uri: 'Token URI',
    uri_placeholder: 'https://...',
    mint_nft: '铸造 NFT',
    footer: '在 Aptos Testnet 上',
    need_connect: '请先连接 Petra 钱包',
    create_collection_success: '集合创建成功，Tx:',
    create_collection_fail: '集合创建失败',
    init_store_success: 'TokenStore 初始化成功，Tx:',
    init_store_fail: 'TokenStore 初始化失败',
    mint_success: '铸造成功，Tx:',
    mint_fail: '铸造失败',
    require_batch_id: '请输入批次 ID',
    require_name: '请输入名称',
    require_description: '请输入描述',
    require_uri: '请输入 Token URI',
    language: '语言',
    zh: '中文',
    en: '英文'
  },
  en: {
    app_title: 'LiquorChain dApp',
    network_tag: 'Aptos Testnet',
    disconnected: 'Disconnected',
    address_label: 'Address',
    disconnect: 'Disconnect',
    connect_petra: 'Connect Petra',
    section_collection_account: 'Collection & Account',
    create_collection: 'Create Collection',
    init_tokenstore: 'Init TokenStore',
    section_mint: 'Mint NFT',
    type: 'Type',
    batch_nft: 'Batch NFT',
    bottle_nft: 'Bottle NFT',
    linked_batch_id: 'Linked Batch ID',
    linked_batch_id_placeholder: 'e.g. 1',
    name: 'Name',
    name_placeholder: 'e.g., Liquor Batch #1',
    description: 'Description',
    description_placeholder: 'Description',
    uri: 'Token URI',
    uri_placeholder: 'https://...',
    mint_nft: 'Mint NFT',
    footer: 'on Aptos Testnet',
    need_connect: 'Please connect Petra wallet first',
    create_collection_success: 'Collection created, Tx:',
    create_collection_fail: 'Collection creation failed',
    init_store_success: 'TokenStore initialized, Tx:',
    init_store_fail: 'TokenStore initialization failed',
    mint_success: 'Mint success, Tx:',
    mint_fail: 'Mint failed',
    require_batch_id: 'Please input batch ID',
    require_name: 'Please input name',
    require_description: 'Please input description',
    require_uri: 'Please input Token URI',
    language: 'Language',
    zh: 'Chinese',
    en: 'English'
  }
}

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const initial = useMemo(() => {
    const saved = typeof window !== 'undefined' ? window.localStorage.getItem('lang') : null
    if (saved === 'zh' || saved === 'en') return saved
    const nav = typeof navigator !== 'undefined' ? navigator.language || navigator.userLanguage : 'en'
    return nav && nav.toLowerCase().startsWith('zh') ? 'zh' : 'en'
  }, [])
  const [lang, setLangState] = useState(initial)
  const setLang = useCallback((l) => {
    setLangState(l)
    if (typeof window !== 'undefined') window.localStorage.setItem('lang', l)
  }, [])
  const t = useCallback((k) => {
    const d = dict[lang] || dict.en
    return d[k] || k
  }, [lang])
  useEffect(() => {}, [lang])
  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}