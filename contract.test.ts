import 'mocha'
import { expect } from 'chai'

import Chain from './chain'
import { addWallet } from './chain.commands';

import {
  WalletType
} from './chain.types'

import {
  Contract
} from './contract'

import {
  flatten
} from './contract.utils'

describe('Liboro', () => {
  it('can init', () => {
    const liboro = new Contract('liboro')

    expect(liboro.id).to.deep.equal('liboro')
  })

  it('can deploy', () => {
    const chain = Chain({ initialState: { wallet: {}, contract: {} } })

    new Contract('liboro').deploy(chain)

    expect(chain.getState().contractNew.liboro).to.exist
  })

  it('can configure', () => {
    const chain = Chain({ initialState: { wallet: {}, contract: {} } })

    new Contract('liboro')
      .deploy(chain)
      .configure('usd', 'liborodollar', 100)

    const { liboro } = chain.getState().contractNew

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

    const { liboro } = chain.getState().contractNew

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

    const { liboro } = chain.getState().contractNew

    expect(liboro.table.asset.usd).to.deep.equal({ marketCap: 0 })
    expect(liboro.table.asset.liborodollar).to.deep.equal({ marketCap: 0 })
    expect(liboro.table.asset.taupemist).to.deep.equal({ marketCap: 0 })

    expect(liboro.assets.liborodollar).to.deep.equal(0)
    expect(liboro.assets.taupemist).to.deep.equal(0)
  })

  it('can mint', () => {
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
      .mint(50, 'usd', taupemist)

    const { liboro } = chain.getState().contractNew
    let { wallet } = chain.getState()

    expect(liboro.table.asset.usd.marketCap).to.equal(50)
    expect(liboro.table.asset.liborodollar.marketCap).to.equal(47.6)

    expect(wallet.taupemist.assets.usd).to.equal(950)
    expect(wallet.taupemist.assets.liborodollar).to.equal(47.6)

    expect(liboro.assets.usd).to.equal(50)

    new Contract('tiny')
      .deploy(chain)
      .configure('usd', 'tinydollar', 100)
      .mint(50, 'usd', taupemist)

    const { tiny } = chain.getState().contractNew
    wallet = chain.getState().wallet

    expect(tiny.table.asset.usd.marketCap).to.equal(50)
    expect(tiny.table.asset.tinydollar.marketCap).to.equal(33.33)

    expect(wallet.taupemist.assets.usd).to.equal(900)
    expect(wallet.taupemist.assets.tinydollar).to.equal(33.33)

    expect(tiny.assets.usd).to.equal(50)

    new Contract('large')
      .deploy(chain)
      .configure('usd', 'largedollar', 10000)
      .mint(100, 'usd', taupemist)

    const { large } = chain.getState().contractNew
    wallet = chain.getState().wallet

    expect(large.table.asset.usd.marketCap).to.equal(100)
    expect(large.table.asset.largedollar.marketCap).to.equal(99)

    expect(large.assets.usd).to.equal(100)

    expect(wallet.taupemist.assets.usd).to.equal(800)
    expect(wallet.taupemist.assets.largedollar).to.equal(99)
  })

  it('can liquidate', () => {
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
      .configure('usd', 'liborodollar', 100)
      .mint(50, 'usd', taupemist)
      .liquidate(33.33, 'usd', taupemist)
    
    const { wallet } = chain.getState()
    const { liboro } = chain.getState().contractNew

    expect(wallet.taupemist.assets.usd).to.equal(1000)
    expect(wallet.taupemist.assets.liborodollar).to.equal(0)

    expect(liboro.assets.usd).to.equal(0)
    expect(liboro.assets.liborodollar).to.equal(0)

    expect(liboro.table.asset.usd.marketCap).to.equal(0)
    expect(liboro.table.asset.liborodollar.marketCap).to.equal(0)
  })

  it('can transfer', () => {
    const chain = Chain({ initialState: { wallet: {}, contract: {} } })

    const taupemist: WalletType = {
      id: 'taupemist',
      assets: {
        usd: 1000
      }
    }

    chain.execute(addWallet(taupemist))

    const cole: WalletType = {
      id: 'cole',
      assets: {
        usd: 1000
      }
    }

    chain.execute(addWallet(cole))

    new Contract('liboro')
      .deploy(chain)
      .configure('usd', 'liborodollar', 100)
      .mint(50, 'usd', taupemist)
      .transfer(20, 'liborodollar', taupemist, cole)

    const { wallet } = chain.getState()

    expect(wallet.taupemist.assets.liborodollar).to.equal(13.33)
    expect(wallet.cole.assets.liborodollar).to.equal(20)
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

    const { liboro } = chain.getState().contractNew

    expect(liboro.assets.eos).to.equal(100)

    expect(liboro.table.portfolio.taupemist).to.exist
    expect(liboro.table.portfolio.taupemist.usd).to.equal(100)
    expect(liboro.table.portfolio.taupemist.liborodollar).to.equal(0)
    expect(liboro.table.portfolio.taupemist.eos).to.equal(0)

    expect(liboro.table.portfolio.global).to.exist
    expect(liboro.table.portfolio.global.usd).to.equal(100)
    expect(liboro.table.portfolio.global.liborodollar).to.equal(0)
    expect(liboro.table.portfolio.global.eos).to.equal(0)
  })

  it('can rebalance', () => {
    const chain = Chain({ initialState: { wallet: {}, contract: {} } })

    const wallet: WalletType = {
      id: 'taupemist',
      assets: {}
    }

    chain.execute(addWallet(wallet))

    new Contract('liboro')
      .deploy(chain)
      .configure('usd', 'liborodollar', 1000, wallet)
      .rebalance(flatten, wallet)
    
    const { liboro } = chain.getState().contractNew

    expect(liboro.table.portfolio.taupemist).to.deep.equal({
      usd: 50,
      liborodollar: 50
    })

    expect(liboro.table.portfolio.global).to.deep.equal({
      usd: 50,
      liborodollar: 50
    })
  })

  it('can rebalance with multiple wallets', () => {
    const chain = Chain({ initialState: { wallet: {}, contract: {} } })

    const taupemist: WalletType = {
      id: 'taupemist',
      assets: {
        usd: 1000
      }
    }

    chain.execute(addWallet(taupemist))

    const cole: WalletType = {
      id: 'cole',
      assets: {
        usd: 1000
      }
    }

    chain.execute(addWallet(cole))

    new Contract('liboro')
      .deploy(chain)
      .configure('usd', 'liborodollar', 1000, taupemist)
      .mint(100, 'usd', cole)
      .mint(110, 'usd', taupemist)
      .rebalance(flatten, taupemist)

    const { liboro } = chain.getState().contractNew

    expect(liboro.table.portfolio.cole).to.deep.equal({
      usd: 100,
      liborodollar: 0
    })

    expect(liboro.table.portfolio.taupemist).to.deep.equal({
      usd: 50,
      liborodollar: 50
    })

    expect(liboro.table.portfolio.global).to.deep.equal({
      usd: 75,
      liborodollar: 25
    })
  })
})