import React, { createContext, useContext, useMemo, useCallback, useState, useEffect } from 'react'
import { AptosClient } from 'aptos'

const NODE_URL = (import.meta?.env?.VITE_NODE_URL) || 'https://fullnode.testnet.aptoslabs.com/v1'
const MODULE_ADDRESS = (import.meta?.env?.VITE_MODULE_ADDRESS) || '0xee7f6e6168e3dbd14d4f37106b26d1753dec5180299bef219bfa515f56c0e7b6'

const WalletContext = createContext(null)

export function WalletProvider({ children }) {
  const client = useMemo(() => new AptosClient(NODE_URL), [])
  const [address, setAddress] = useState('')
  const [connected, setConnected] = useState(false)

  const connect = useCallback(async () => {
    if (!window.petra) throw new Error('Petra 未安装')
    const res = await window.petra.connect()
    setAddress(res.address)
    setConnected(true)
  }, [])

  const disconnect = useCallback(async () => {
    if (!window.petra) return
    await window.petra.disconnect()
    setAddress('')
    setConnected(false)
  }, [])

  const signAndSubmitTransaction = useCallback(async (payload) => {
    if (!window.petra) throw new Error('Petra 未安装')
    return window.petra.signAndSubmitTransaction(payload)
  }, [])

  useEffect(() => {
    (async () => {
      try {
        if (window.petra) {
          const isConnected = await window.petra.isConnected()
          if (isConnected) {
            const acc = await window.petra.account()
            setAddress(acc.address)
            setConnected(true)
          }
        }
      } catch {}
    })()
  }, [])

  return (
    <WalletContext.Provider value={{ client, moduleAddress: MODULE_ADDRESS, address, connected, connect, disconnect, signAndSubmitTransaction }}>
      {children}
    </WalletContext.Provider>
  )
}

export function useAppWallet() {
  return useContext(WalletContext)
}
