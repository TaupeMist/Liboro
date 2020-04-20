import 'mocha'
import { expect } from 'chai'

import { Chain, addWallet, WalletType } from '../chain'

import {
  PredictionContract
} from '.'

context('Prediction', () => {
  describe('Contract', () => {
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

    it('can buy', () => {
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

    it('get prediction summary', () => {})
  })
})
