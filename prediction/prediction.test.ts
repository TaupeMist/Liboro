import 'mocha'
import { expect } from 'chai'

import { Chain, addWallet, WalletType } from '../chain'

import {
  PredictionContract
} from '.'

context('Prediction', () => {
  it('can init', () => {
    const chain = Chain({ initialState: { wallet: {}, contract: {} } })

    const taupemist: WalletType = {
      id: 'taupemist',
      assets: {}
    }

    chain.execute(addWallet(taupemist))

    new PredictionContract('predict')
      .deploy(chain)
      .configure({
        asset: 'liborodollar',
        wallet: taupemist
      })

    const { predict } = chain.getState().contract

    expect(predict.table.owner.id).to.equal(taupemist.id)

    expect(predict.table.portfolio.taupemist).to.exist

    expect(predict.table.portfolio.global).to.exist

    expect(predict.table.balance).to.exist

    expect(predict.table.credit).to.exist

    expect(predict.table.active).to.be.true

    expect(predict.table.resolved).to.be.false
  })

  describe('deposit', () => {
    it('can transfer', () => {
      const chain = Chain({ initialState: { wallet: {}, contract: {} } })

      const taupemist: WalletType = {
        id: 'taupemist',
        assets: {}
      }

      chain.execute(addWallet(taupemist))

      const cole: WalletType = {
        id: 'cole',
        assets: {
          liborodollar: 1000
        }
      }

      chain.execute(addWallet(cole))

      new PredictionContract('predict')
        .deploy(chain)
        .configure({
          asset: 'liborodollar',
          wallet: taupemist
        })
        .deposit(50, cole)

      const { wallet } = chain.getState()

      expect(wallet.taupemist.assets.liborodollar).to.equal(50)
      expect(wallet.cole.assets.liborodollar).to.equal(950)
    })
  })

  describe('resolve', () => {
    it('can resolve', () => {
      const chain = Chain({ initialState: { wallet: {}, contract: {} } })

      const taupemist: WalletType = {
        id: 'taupemist',
        assets: {}
      }

      chain.execute(addWallet(taupemist))

      const cole: WalletType = {
        id: 'cole',
        assets: {
          liborodollar: 1000
        }
      }

      chain.execute(addWallet(cole))

      new PredictionContract('predict')
        .deploy(chain)
        .configure({
          asset: 'liborodollar',
          wallet: taupemist
        })
        .updatePrediction(80, cole)
        .deposit(100, cole)
        .updatePrediction(60, cole)
        .resolve('yes')

        const { predict } = chain.getState().contract

        expect(predict.table.active).to.be.false

        expect(predict.table.resolved).to.be.true

        expect(predict.table.owner.assets.liborodollar).to.equal(0)

        const { wallet } = chain.getState()

        expect(wallet.cole.assets.liborodollar).to.equal(1000)
    })
  })
})
