import 'mocha'
import { expect } from 'chai'

import { Chain, addWallet, WalletType } from '../chain'

import {
  Contract
} from './contract'

describe('Contract', () => {
  it('can init', () => {
    const liboro = new Contract('liboro')

    expect(liboro.id).to.deep.equal('liboro')
  })

  it('can deploy', () => {
    const chain = Chain({ initialState: { wallet: {}, contract: {} } })

    new Contract('liboro').deploy(chain)

    expect(chain.getState().contract.liboro).to.exist
  })

  it('can configure', () => {
    const chain = Chain({ initialState: { wallet: {}, contract: {} } })

    new Contract('liboro')
      .deploy(chain)
      .configure('usd', 'liborodollar', 100)

    const { liboro } = chain.getState().contract

    expect(liboro.table.asset.usd).to.deep.equal({ marketCap: 0 })
    expect(liboro.table.asset.liborodollar).to.deep.equal({ marketCap: 0 })

    expect(liboro.table.baseSupply).to.deep.equal(100)
  })

  it('can add hard assets', () => {
    const chain = Chain({ initialState: { wallet: {}, contract: {} } })

    new Contract('liboro')
      .deploy(chain)
      .configure('usd', 'liborodollar', 100)
      .addAsset('eos')

    const { liboro } = chain.getState().contract

    expect(liboro.table.asset.usd).to.deep.equal({ marketCap: 0 })
    expect(liboro.table.asset.liborodollar).to.deep.equal({ marketCap: 0 })
    expect(liboro.table.asset.eos).to.deep.equal({ marketCap: 0 })

    expect(liboro.assets.usd).to.deep.equal(0)
    expect(liboro.assets.eos).to.deep.equal(0)
  })

  it('can add tokens', () => {
    const chain = Chain({ initialState: { wallet: {}, contract: {} } })

    new Contract('liboro')
      .deploy(chain)
      .configure('usd', 'liborodollar', 100)
      .addToken('taupemist')

    const { liboro } = chain.getState().contract

    expect(liboro.table.asset.usd).to.deep.equal({ marketCap: 0 })
    expect(liboro.table.asset.liborodollar).to.deep.equal({ marketCap: 0 })
    expect(liboro.table.asset.taupemist).to.deep.equal({ marketCap: 0 })

    expect(liboro.assets.liborodollar).to.deep.equal(0)
    expect(liboro.assets.taupemist).to.deep.equal(0)
  })

  it('can get wallet and asset', () => {
    const chain = Chain({ initialState: { wallet: {}, contract: {} } })

    const taupemist: WalletType = {
      id: 'taupemist',
      assets: {
        usd: 1000
      }
    }

    chain.execute(addWallet(taupemist))

    new Contract('liboro')
      .deploy(chain)
      .configure('usd', 'liborodollar', 1000)

    const { liboro } = chain.getState().contract

    console.log('Liboro Wallet', liboro.getWallet(taupemist))
    console.log('Liboro Asset', liboro.getAsset('usd'))
  })

  it('can seed', () => {
    const chain = Chain({ initialState: { wallet: {}, contract: {} } })

    const wallet: WalletType = {
      id: 'taupemist',
      assets: {
        eos: 100
      }
    }

    chain.execute(addWallet(wallet))

    new Contract('liboro')
      .deploy(chain)
      .configure('usd', 'liborodollar', 1000)
      .seed(100, 'eos', wallet)

    const { liboro } = chain.getState().contract

    expect(liboro.assets.eos).to.equal(100)

    expect(liboro.table.portfolio.taupemist).to.exist
    expect(liboro.table.portfolio.taupemist.usd).to.equal(100)
    expect(liboro.table.portfolio.taupemist.liborodollar).to.equal(0)
    expect(liboro.table.portfolio.taupemist.eos).to.equal(0)

    expect(liboro.table.portfolio.global).to.exist
    expect(liboro.table.portfolio.global.usd).to.equal(100)
    expect(liboro.table.portfolio.global.eos).to.equal(0)
  })
})