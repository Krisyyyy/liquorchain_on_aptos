import React, { useMemo, useState } from 'react'
import { Layout, Typography, Space, Button, Form, Input, Select, Row, Col, Divider, message, Tag } from 'antd'
import { useAppWallet } from './WalletContext.jsx'
import { useLanguage } from './LanguageContext.jsx'

const { Header, Content, Footer } = Layout
const { Title, Text } = Typography

export default function App() {
  const { client, moduleAddress, address, connected, connect, disconnect, signAndSubmitTransaction } = useAppWallet()
  const { t, lang, setLang } = useLanguage()
  const [loading, setLoading] = useState(false)
  const [mintType, setMintType] = useState('batch')

  const addr = useMemo(() => address || '', [address])

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

  const onInitStore = async () => {
    if (!connected) return message.error(t('need_connect'))
    setLoading(true)
    try {
      const payload = {
        type: 'entry_function_payload',
        function: `${moduleAddress}::liquorchain::init_store`,
        type_arguments: [],
        arguments: [],
      }
      const res = await signAndSubmitTransaction(payload)
      await client.waitForTransaction(res.hash)
      message.success(`${t('init_store_success')} ${res.hash}`)
    } catch (e) {
      console.error(e)
      message.error(t('init_store_fail'))
    } finally {
      setLoading(false)
    }
  }

  const onFinish = async (values) => {
    if (!connected) return message.error(t('need_connect'))
    const { name, description, uri, batchId } = values
    setLoading(true)
    try {
      const payload =
        mintType === 'batch'
          ? {
              type: 'entry_function_payload',
              function: `${moduleAddress}::liquorchain::mint_batch_nft`,
              type_arguments: [],
              arguments: [name, description, uri],
            }
          : {
              type: 'entry_function_payload',
              function: `${moduleAddress}::liquorchain::mint_bottle_nft`,
              type_arguments: [],
              arguments: [Number(batchId), name, description, uri],
            }

      const res = await signAndSubmitTransaction(payload)
      await client.waitForTransaction(res.hash)
      message.success(`${t('mint_success')} ${res.hash}`)
    } catch (e) {
      console.error(e)
      message.error(t('mint_fail'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ background: '#fff' }}>
        <Row align="middle" justify="space-between">
          <Col>
            <Space>
              <Title level={3} style={{ margin: 0 }}>{t('app_title')}</Title>
              <Tag color="blue">{t('network_tag')}</Tag>
            </Space>
          </Col>
          <Col>
            <Space>
              {connected && addr ? <Text>{t('address_label')}: {addr}</Text> : <Text type="secondary">{t('disconnected')}</Text>}
              {connected ? (
                <Button onClick={disconnect}>{t('disconnect')}</Button>
              ) : (
                <Button type="primary" onClick={connect}>{t('connect_petra')}</Button>
              )}
              <Select
                value={lang}
                onChange={setLang}
                options={[
                  { value: 'zh', label: t('zh') },
                  { value: 'en', label: t('en') },
                ]}
                style={{ width: 110 }}
              />
            </Space>
          </Col>
        </Row>
      </Header>
      <Content style={{ padding: 24 }}>
        <Row gutter={[24, 24]}>
          <Col xs={24} md={8}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Title level={4}>{t('section_collection_account')}</Title>
              <Button block disabled={loading} onClick={onCreateCollection}>{t('create_collection')}</Button>
              <Button block disabled={loading} onClick={onInitStore}>{t('init_tokenstore')}</Button>
            </Space>
          </Col>
          <Col xs={24} md={16}>
            <Title level={4}>{t('section_mint')}</Title>
            <Form layout="vertical" onFinish={onFinish} initialValues={{ mintType: 'batch' }}>
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
              <Divider />
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading} block>{t('mint_nft')}</Button>
              </Form.Item>
            </Form>
          </Col>
        </Row>
      </Content>
      <Footer style={{ textAlign: 'center' }}>
        LiquorChain © {new Date().getFullYear()} {t('footer')}
      </Footer>
    </Layout>
  )
}