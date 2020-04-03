import 'mocha'
import { expect } from 'chai'

import { Chain, addWallet, WalletType } from '../chain'

import {
  flatten
} from '../portfolio'

import {
  PredictionContract
} from './prediction'

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
          asset: 'liborodollar'
        })

      const { predict } = chain.getState().contract

      // TODO: check predict.table.portfolio.taupemist

      expect(predict.table.portfolio.global).to.deep.equal({
        liborodollar: 0,
        yes: 0,
        no: 0
      })
    })

    it('can make prediction', () => {})
  })
})
