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

  it('can seed', () => {
    const chain = Chain({ initialState: { wallet: {}, contract: {} } })

    const wallet: WalletType = {
      id: 'taupemist',
      assets: {
        eos: 100
      }
    }

    chain.execute(addWallet(wallet))

    new PortfolioContract('liboro')
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
