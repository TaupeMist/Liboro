import 'mocha'
import { expect } from 'chai'

import { Chain, addWallet, WalletType } from '../chain'

import {
  PredictionContract
} from '.'

context('Prediction', () => {
  describe('PredictionContract', () => {
    it('can init', () => {
      const chain = Chain({ initialState: { wallet: {}, contract: {} } })

      const taupemist: WalletType = {
        id: 'taupemist',
        assets: {
          usd: 1000
        }
      }

      chain.execute(addWallet(taupemist))

      new PredictionContract('predict')
        .deploy(chain)
        .configure({
          asset: 'liborodollar',
          wallet: taupemist
        })

      const { predict } = chain.getState().contract

      expect(predict.table.portfolio.taupemist).to.deep.equal({
        liborodollar: 0,
        yes: 0,
        no: 0
      })

      expect(predict.table.portfolio.global).to.deep.equal({
        liborodollar: 0,
        yes: 0,
        no: 0
      })
    })

    it('can update prediction', () => {
      const chain = Chain({ initialState: { wallet: {}, contract: {} } })

      const taupemist: WalletType = {
        id: 'taupemist',
        assets: {
          usd: 1000
        }
      }

      chain.execute(addWallet(taupemist))

      new PredictionContract('predict')
        .deploy(chain)
        .configure({
          asset: 'liborodollar',
          wallet: taupemist
        })
        .updatePrediction(60, taupemist)

      const { predict } = chain.getState().contract

      expect(predict.table.portfolio.taupemist).to.deep.equal({
        yes: 60,
        no: 40
      })
    })

    it('get prediction summary', () => {})
  })
})
