import 'mocha';
import { expect } from 'chai';

import Chain from './chain';
import { addContract, addWallet } from './chain.commands';
import { init as initBalance, buy, add, seed } from './balance.commands';
import { calcPayable, hasFunds } from './balance.utils';

const wallet = {
  Fred: {
    id: "Fred",
    assets: {
      token: 1000,
      usd: 1000
    }
  }
}

const contract = {
  'balance-usd': {
    id: 'balance-usd',
    assets: {
      token: 100,
      usd: 100
    }
  }
}

const initChainAndContract = () => {
  const chain = Chain({ initialState: { wallet: {}, contract: {} } })

  chain.execute(addWallet(wallet.Fred))

  const balance = initBalance('balance-usd')

  chain.execute(addContract(balance))
  chain.execute(add('usd', balance))

  return { chain, balance }
}

describe('Balance', () => {
  context('logic', () => {
    it('has funds', () => {
      expect(hasFunds(100, 'usd', wallet.Fred)(contract['balance-usd'])).to.equal(true)
    })

    it('can calculate payable', () => {
      expect(calcPayable(50, 'token')(contract['balance-usd'])).to.equal(33)
    })
  })

  context('state', () => {
    it('can init', () => {
      const balance = initBalance('balance-usd')

      expect(balance).to.deep.equal(
        {
          id: 'balance-usd',
          assets: {
            token: 0
          }
        }
      )
    })

    it('can add token', () => {
      const chain = Chain({ initialState: { wallet: {}, contract: {} } })

      const balance = initBalance('balance-usd')

      chain.execute(addContract(balance))

      expect(chain.getState().contract['balance-usd']).to.deep.equal(
        {
          id: 'balance-usd',
          assets: {
            token: 0
          }
        }
      )
    })

    it('can add balance to chain', () => {
      const { chain } = initChainAndContract()

      expect(chain.getState().contract['balance-usd']).to.deep.equal(
        {
          id: 'balance-usd',
          assets: {
            token: 0,
            usd: 0
          }
        }
      )
    })

    it('can init multiple', () => {
      const { chain } = initChainAndContract()

      const balanceEUR = initBalance('balance-eur')

      chain.execute(addContract(balanceEUR))

      expect(chain.getState().contract['balance-eur']).to.deep.equal(
        {
          id: 'balance-eur',
          assets: {
            token: 0
          }
        }
      )
    })
  })

  context('buying', () => {
    it('should create new token on first purchase', () => {
      const { chain } = initChainAndContract()

      const getContractAssets = () => chain.getState().contract['balance-usd'].assets

      expect(getContractAssets().token).to.deep.equal(0)

      const purchaseAmount = 50

      const getWalletAssets = () => chain.getState().wallet['Fred'].assets
      const initialWalletUsd = getWalletAssets().usd

      chain.execute(seed(
        purchaseAmount,
        'token',
        chain.getState().contract['balance-usd'],
        chain.getState().wallet['Fred']
      ))

      expect(getWalletAssets().usd).to.deep.equal(initialWalletUsd - purchaseAmount)

      expect(getContractAssets().token).to.deep.equal(purchaseAmount)
      expect(getContractAssets().usd).to.deep.equal(purchaseAmount)
    })

    it('should allow buying', () => {
      const initialState = {
        contract: {
          'balance-usd': {
            id: "balance-usd",
            assets: {
              token: 100,
              usd: 100
            }
          }
        },
        wallet: {
          Fred: {
            id: "Fred",
            assets: {
              token: 1000,
              usd: 1000
            }
          }
        }
      }

      const chain = Chain({ initialState })
  
      // First Payment
      chain.execute(buy(
        50,
        'token',
        chain.getState().contract['balance-usd'],
        chain.getState().wallet['Fred'])
      )

      // First Payment Result
      const secondState = {
        contract: {
          'balance-usd': {
            id: "balance-usd",
            assets: {
              token: 67,
              usd: 150
            }
          }
        },
        wallet: {
          Fred: {
            id: "Fred",
            assets: {
              token: 1033,
              usd: 950
            }
          }
        }
      }
  
      expect(chain.getState()).to.deep.equal(secondState)

      // Second Payment (return to inital state)
      chain.execute(buy(
        33,
        'usd',
        secondState.contract['balance-usd'],
        secondState.wallet['Fred'])
      )

      expect(chain.getState()).to.deep.equal(initialState)
    });
  })
});