import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { WalletProvider } from './WalletContext.jsx'
import { LanguageProvider } from './LanguageContext.jsx'
import 'antd/dist/reset.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LanguageProvider>
      <WalletProvider>
        <App />
      </WalletProvider>
    </LanguageProvider>
  </React.StrictMode>
)