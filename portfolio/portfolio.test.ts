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

    const taupemist: WalletType = {
      id: 'taupemist',
      assets: {}
    }

    chain.execute(addWallet(taupemist))

    new PortfolioContract('portfolio')
      .deploy(chain)
      .configure({
        asset: 'usd',
        token: 'liborodollar',
        baseAsset: 1000,
        wallet: taupemist
      })
      .rebalance(flatten, taupemist)

    const { portfolio } = chain.getState().contract

    expect(portfolio.table.portfolio.taupemist).to.deep.equal({
      usd: 50,
      liborodollar: 50
    })

    expect(portfolio.table.portfolio.global).to.deep.equal({
      usd: 50,
      liborodollar: 50
    })
  })

  it('can seed', () => {
    const chain = Chain({ initialState: { wallet: {}, contract: {} } })

    const taupemist: WalletType = {
      id: 'taupemist',
      assets: {
        eos: 100
      }
    }

    chain.execute(addWallet(taupemist))

    new PortfolioContract('portfolio')
      .deploy(chain)
      .configure({
        asset: 'usd',
        token: 'liborodollar',
        baseAsset: 1000,
        wallet: taupemist
      })
      .seed(100, 'eos', taupemist)

    const { portfolio } = chain.getState().contract

    expect(portfolio.assets.eos).to.equal(100)

    expect(portfolio.table.portfolio.taupemist).to.deep.equal({
      eos: 100,
      usd: 0,
      liborodollar: 0
    })

    expect(portfolio.table.portfolio.global).to.deep.equal({
      eos: 100,
      usd: 0,
      liborodollar: 0
    })
  })
})
