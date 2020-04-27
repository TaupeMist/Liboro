import 'mocha'
import { expect } from 'chai'

import { Chain, addWallet, WalletType } from '../chain'

import {
  PredictionContract
} from '.'

context('Prediction', () => {
  describe('buy', () => {
    it('can buy (through minting)', () => {
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

      const { predict } = chain.getState().contract

      expect(predict.table.asset.yes).to.deep.equal({
        id: 'yes',
        value: 0,
        marketCap: 25
      })

      expect(predict.table.asset.no).to.deep.equal({
        id: 'no',
        value: 0,
        marketCap: 25
      })

      expect(predict.table.balance.cole).to.deep.equal({
        yes: 25,
        no: 25
      })
    })

    it('can buy (through credit)', () => {
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
        .deposit(33.3333, cole)

        const { predict } = chain.getState().contract

        expect(predict.table.asset.yes).to.deep.equal({
          id: 'yes',
          value: 0,
          marketCap: 80
        })

        expect(predict.table.asset.no).to.deep.equal({
          id: 'no',
          value: 0,
          marketCap: 53.3333
        })

        expect(predict.table.balance.cole).to.deep.equal({
          yes: 80,
          no: 53.3333
        })

        expect(predict.table.credit.cole).to.deep.equal({})
    })

    it('can buy (through some credit)', () => {
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
        .deposit(16.6666, cole)

        const { predict } = chain.getState().contract

        expect(predict.table.asset.yes).to.deep.equal({
          id: 'yes',
          value: 0,
          marketCap: 80
        })

        expect(predict.table.asset.no).to.deep.equal({
          id: 'no',
          value: 0,
          marketCap: 36.6666
        })

        expect(predict.table.balance.cole).to.deep.equal({
          yes: 55,
          no: 36.6666
        })

        expect(predict.table.credit.cole).to.deep.equal({
          yes: 25
        })
    })

    it('can buy (through some credit and minting)', () => {
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
        .deposit(133.3333, cole)

        const { predict } = chain.getState().contract

        expect(predict.table.asset.yes).to.deep.equal({
          id: 'yes',
          value: 0,
          marketCap: 140
        })

        expect(predict.table.asset.no).to.deep.equal({
          id: 'no',
          value: 0,
          marketCap: 93.3333
        })

        expect(predict.table.balance.cole).to.deep.equal({
          yes: 140,
          no: 93.3333
        })

        expect(predict.table.credit.cole).to.deep.equal({})
    })
  })
})
