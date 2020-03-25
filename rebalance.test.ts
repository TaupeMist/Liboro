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

describe('Liboro - Rebalance', () => {
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

    new Contract('liboro')
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

    new Contract('liboro')
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

    new Contract('liboro')
      .deploy(chain)
      .configure('usd', 'liborodollar', 1000)
      .mint(100, 'usd', taupemist)
      .seed(100, 'eos', taupemist)
      .rebalance(() => ({
        liborodollar: 0,
        usd: 50,
        eos: 50
      }), taupemist)
      .mint(100, 'usd', taupemist)

    const { liboro } = chain.getState().contract

    console.log('final: wallet', chain.getState().wallet)
    console.log('final: portfolio', liboro.table.portfolio)
    console.log('final: assets', liboro.assets)

    // console.log('final: assets', liboro.assets)

    // console.log('final: portfolio', liboro.table.portfolio)
    
    expect(liboro.table.portfolio.taupemist).to.deep.equal({
      liborodollar: 0,
      usd: 78.5881,
      eos: 21.4119
    })
    expect(liboro.table.portfolio.global).to.deep.equal({
      liborodollar: 0,
      usd: 78.5881,
      eos: 21.4119
    })
  })
})