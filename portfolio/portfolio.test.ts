import 'mocha'
import { expect } from 'chai'

import {
  PortfolioContract
} from './portfolio'

import { Chain, addWallet, WalletType } from '../chain'

import {
  flatten
} from './utils'

describe('Portfolio', () => {
  it('can rebalance', () => {
    const chain = Chain({ initialState: { wallet: {}, contract: {} } })

    const wallet: WalletType = {
      id: 'taupemist',
      assets: {}
    }

    chain.execute(addWallet(wallet))

    new PortfolioContract('liboro')
      .deploy(chain)
      .configure('usd', 'liborodollar', 1000, wallet)
      .rebalance(flatten, wallet)
    
    const { liboro } = chain.getState().contract

    expect(liboro.table.portfolio.taupemist).to.deep.equal({
      usd: 50,
      liborodollar: 50
    })

    expect(liboro.table.portfolio.global).to.deep.equal({
      usd: 50,
      liborodollar: 50
    })
  })

  it('can rebalance and calculate global portfolio', () => {
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

    new PortfolioContract('liboro')
      .deploy(chain)
      .configure('usd', 'liborodollar', 1000, taupemist)
      .mint(100, 'usd', cole)
      .mint(110, 'usd', taupemist)
      .rebalance(flatten, taupemist)

    const { liboro } = chain.getState().contract

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

  it('can rebalance on first mint to create initial portfolios', () => {
    const chain = Chain({ initialState: { wallet: {}, contract: {} } })

    const taupemist: WalletType = {
      id: 'taupemist',
      assets: {
        usd: 1000
      }
    }

    chain.execute(addWallet(taupemist))

    new PortfolioContract('liboro')
      .deploy(chain)
      .configure('usd', 'liborodollar', 1000)
      .mint(10, 'usd', taupemist)

    const { liboro } = chain.getState().contract
    
    expect(liboro.table.portfolio.taupemist).to.deep.equal({
      liborodollar: 0,
      usd: 100
    })
    expect(liboro.table.portfolio.global).to.deep.equal({
      liborodollar: 0,
      usd: 100
    })
  })

  it('can rebalance when minting', () => {
    const chain = Chain({ initialState: { wallet: {}, contract: {} } })

    const taupemist: WalletType = {
      id: 'taupemist',
      assets: {
        usd: 1000,
        eos: 1000
      }
    }

    chain.execute(addWallet(taupemist))

    new PortfolioContract('liboro')
      .deploy(chain)
      .configure('usd', 'liborodollar', 1000)
      .mint(100, 'usd', taupemist)
      .rebalance(() => ({
        liborodollar: 50,
        usd: 50
      }), taupemist)
      .mint(100, 'usd', taupemist)

    console.log('end')

    const { liboro } = chain.getState().contract
    
    expect(liboro.table.portfolio.taupemist).to.deep.equal({
      usd: 78.5881,
      liborodollar: 21.4119
    })
  })

  it('can rebalance when burning', () => {
    console.log('can rebalance when burning')
    const chain = Chain({ initialState: { wallet: {}, contract: {} } })

    const taupemist: WalletType = {
      id: 'taupemist',
      assets: {
        usd: 1000
      }
    }

    chain.execute(addWallet(taupemist))

    new PortfolioContract('liboro')
      .deploy(chain)
      .configure('usd', 'liborodollar', 1000)
      .mint(100, 'usd', taupemist)
      .rebalance(() => ({
        liborodollar: 50,
        usd: 50
      }), taupemist)
      .burn(45.45, 'usd', taupemist)

    console.log('end')

    const { liboro } = chain.getState().contract
    const { wallet } = chain.getState()

    console.log('can rebalance when burning', wallet, liboro.assets, liboro.table)

    expect(liboro.table.asset.usd.marketCap).to.equal(75)
    expect(liboro.table.baseToken.marketCap).to.equal(45.45)

    expect(wallet.taupemist.assets.usd).to.equal(925)
    expect(wallet.taupemist.assets.liborodollar).to.equal(45.45)

    expect(liboro.table.portfolio.taupemist.usd).to.equal(0)
    expect(liboro.table.portfolio.taupemist.liborodollar).to.equal(100)
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

    new PortfolioContract('liboro')
      .deploy(chain)
      .configure('usd', 'liborodollar', 1000)
      .mint(50, 'usd', taupemist)

    const { liboro } = chain.getState().contract
    let { wallet } = chain.getState()

    expect(liboro.table.asset.usd.marketCap).to.equal(50)
    expect(liboro.table.baseToken.marketCap).to.equal(47.6)

    expect(wallet.taupemist.assets.usd).to.equal(950)
    expect(wallet.taupemist.assets.liborodollar).to.equal(47.6)

    expect(liboro.assets.usd).to.equal(50)

    new PortfolioContract('tiny')
      .deploy(chain)
      .configure('usd', 'tinydollar', 100)
      .mint(50, 'usd', taupemist)

    const { tiny } = chain.getState().contract
    wallet = chain.getState().wallet

    expect(tiny.table.asset.usd.marketCap).to.equal(50)
    expect(tiny.table.baseToken.marketCap).to.equal(33.33)

    expect(wallet.taupemist.assets.usd).to.equal(900)
    expect(wallet.taupemist.assets.tinydollar).to.equal(33.33)

    expect(tiny.assets.usd).to.equal(50)

    new PortfolioContract('large')
      .deploy(chain)
      .configure('usd', 'largedollar', 10000)
      .mint(100, 'usd', taupemist)

    const { large } = chain.getState().contract
    wallet = chain.getState().wallet

    expect(large.table.asset.usd.marketCap).to.equal(100)
    expect(large.table.baseToken.marketCap).to.equal(99)

    expect(large.assets.usd).to.equal(100)

    expect(wallet.taupemist.assets.usd).to.equal(800)
    expect(wallet.taupemist.assets.largedollar).to.equal(99)
  })

  it('can burn', () => {
    const chain = Chain({ initialState: { wallet: {}, contract: {} } })

    const taupemist: WalletType = {
      id: 'taupemist',
      assets: {
        usd: 1000
      }
    }

    chain.execute(addWallet(taupemist))

    new PortfolioContract('liboro')
      .deploy(chain)
      .configure('usd', 'liborodollar', 1000)
      .mint(50, 'usd', taupemist)
      .burn(47.6, 'usd', taupemist)
    
    const { wallet } = chain.getState()
    const { liboro } = chain.getState().contract

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

    new PortfolioContract('liboro')
      .deploy(chain)
      .configure('usd', 'liborodollar', 100)
      .mint(50, 'usd', taupemist)
      .transfer(20, 'liborodollar', taupemist, cole)

    const { wallet } = chain.getState()

    expect(wallet.taupemist.assets.liborodollar).to.equal(13.33)
    expect(wallet.cole.assets.liborodollar).to.equal(20)
  })
})