import 'mocha'
import { expect } from 'chai'

import { Chain, addWallet, WalletType } from '../chain'

import {
  PredictionContract
} from '.'

context('Prediction', () => {
  describe('update', () => {
    it('can update with no balance', () => {
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
        .updatePrediction(60, cole)

      const { predict } = chain.getState().contract

      expect(predict.table.portfolio.cole).to.deep.equal({
        yes: 60,
        no: 40
      })

      expect(predict.table.balance.cole).to.deep.equal({
        yes: 0,
        no: 0
      })
    })

    it('can set default prediction', () => {
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
        .deposit(100, 'liborodollar', cole)

        const { predict } = chain.getState().contract

        expect(predict.assets.liborodollar).to.equal(100)

        expect(predict.table.portfolio.cole).to.deep.equal({
          yes: 50,
          no: 50
        })

        expect(predict.table.balance.cole).to.deep.equal({
          yes: 50,
          no: 50
        })

        const { wallet } = chain.getState()

        expect(wallet.cole.assets.liborodollar).to.equal(900)
    })

    it('can deposit after prediction', () => {
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
        .updatePrediction(60, cole)
        .deposit(100, 'liborodollar', cole)

      const { predict } = chain.getState().contract

      expect(predict.table.portfolio.cole).to.deep.equal({
        yes: 60,
        no: 40
      })

      expect(predict.table.balance.cole).to.deep.equal({
        yes: 60,
        no: 40
      })
    })

    it('can set credit after update', () => {
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
        .deposit(200, 'liborodollar', cole)
        .updatePrediction(60, cole)

        const { predict } = chain.getState().contract

        expect(predict.assets.liborodollar).to.equal(200)

        expect(predict.table.portfolio.cole).to.deep.equal({
          yes: 60,
          no: 40
        })

        expect(predict.table.balance.cole).to.deep.equal({
          yes: 100,
          no: 66.6667
        })

        expect(predict.table.credit.cole.no).to.equal(33.3333)

        const { wallet } = chain.getState()

        expect(wallet.cole.assets.liborodollar).to.equal(800)
    })

    // TODO: add additional version to utils.test
    it('can equalise an unequal prediction', () => {
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
        .updatePrediction(60, cole)
        .deposit(100, 'liborodollar', cole)
        .updatePrediction(50, cole)

        const { predict } = chain.getState().contract

        expect(predict.assets.liborodollar).to.equal(100)

        expect(predict.table.portfolio.cole).to.deep.equal({
          yes: 50,
          no: 50
        })

        expect(predict.table.balance.cole).to.deep.equal({
          yes: 40,
          no: 40
        })

        expect(predict.table.credit.cole).to.deep.equal({
          yes: 20
        })

        const { wallet } = chain.getState()

        expect(wallet.cole.assets.liborodollar).to.equal(900)
    })

    // TODO: add additional version to utils.test
    it('can unequalise a prediction', () => {
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
        .deposit(200, 'liborodollar', cole)
        .updatePrediction(60, cole)
        .updatePrediction(80, cole)

        const { predict } = chain.getState().contract

        expect(predict.assets.liborodollar).to.equal(200)

        expect(predict.table.portfolio.cole).to.deep.equal({
          yes: 80,
          no: 20
        })

        expect(predict.table.balance.cole).to.deep.equal({
          yes: 100,
          no: 25
        })

        expect(predict.table.credit.cole).to.deep.equal({
          no: 75
        })

        const { wallet } = chain.getState()

        expect(wallet.cole.assets.liborodollar).to.equal(800)
    })

    // TODO: add additional version to utils.test
    it('can reverse a prediction', () => {
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
        .updatePrediction(40, cole)
        .deposit(100, 'liborodollar', cole)
        .updatePrediction(60, cole)

        const { predict } = chain.getState().contract

        expect(predict.assets.liborodollar).to.equal(100)

        expect(predict.table.portfolio.cole).to.deep.equal({
          no: 40,
          yes: 60
        })

        expect(predict.table.balance.cole).to.deep.equal({
          no: 26.6667,
          yes: 40
        })

        expect(predict.table.credit.cole).to.deep.equal({
          no: 33.3333
        })

        const { wallet } = chain.getState()

        expect(wallet.cole.assets.liborodollar).to.equal(900)
    })

    // TODO: add additional version to utils.test
    it('can expand a prediction', () => {
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
        .updatePrediction(60, cole)
        .deposit(100, 'liborodollar', cole)
        .updatePrediction(80, cole)

        const { predict } = chain.getState().contract

        expect(predict.assets.liborodollar).to.equal(100)

        expect(predict.table.portfolio.cole).to.deep.equal({
          no: 20,
          yes: 80
        })

        expect(predict.table.balance.cole).to.deep.equal({
          no: 15,
          yes: 60
        })

        expect(predict.table.credit.cole).to.deep.equal({
          no: 25
        })

        const { wallet } = chain.getState()

        expect(wallet.cole.assets.liborodollar).to.equal(900)
    })

    // TODO: add additional version to utils.test
    it('can shrink a prediction', () => {
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
        .deposit(100, 'liborodollar', cole)
        .updatePrediction(60, cole)

        const { predict } = chain.getState().contract

        expect(predict.assets.liborodollar).to.equal(100)

        expect(predict.table.asset.no).to.deep.equal({
          id: 'no',
          value: 0,
          marketCap: 20
        })

        expect(predict.table.asset.yes).to.deep.equal({
          id: 'yes',
          value: 0,
          marketCap: 80
        })

        expect(predict.table.portfolio.global).to.deep.equal({
          no: 40,
          yes: 60
        })

        expect(predict.table.portfolio.cole).to.deep.equal({
          no: 40,
          yes: 60
        })

        expect(predict.table.balance.cole).to.deep.equal({
          no: 20,
          yes: 30
        })

        expect(predict.table.credit.cole).to.deep.equal({
          yes: 50
        })

        const { wallet } = chain.getState()

        expect(wallet.cole.assets.liborodollar).to.equal(900)
    })
  })
})
