import 'mocha';
import { expect } from 'chai';

import Chain from './index';

import {
  addWallet
} from './commands'

import {
  WalletType
} from './types'

import {
  Contract
} from '../contract'

describe('Chain', () => {
  it('should init chain', () => {
    const chain = Chain({ initialState: { wallet: {}, contract: {} } })

    expect(chain.getState()).to.deep.equal({ wallet: {}, contract: {} })
  });

  context('contract', () => {
    it('can be registered', () => {
      const chain = Chain({ initialState: { wallet: {}, contract: {} } })

      new Contract('liboro')
        .deploy(chain)

      const { contract } = chain.getState()

      expect(contract.liboro).to.exist
    })
  })

  context('wallet', () => {
    it('can be registered', () => {
      const chain = Chain({ initialState: { wallet: {}, contract: {} } })

      const taupemist: WalletType = {
        id: 'taupemist',
        assets: {
          usd: 1000
        }
      }

      chain.execute(addWallet(taupemist))

      const { wallet } = chain.getState()

      expect(wallet.taupemist).to.exist
    })
  })
});