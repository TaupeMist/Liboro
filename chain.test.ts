import 'mocha';
import { expect } from 'chai';

import Chain from './chain';
import { addContract, addWallet } from './chain.commands';

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
  Balance: {
    id: "Balance",
    assets: {
      token: 100,
      usd: 100
    }
  }
}

const INITIAL_STATE = {
  wallet,
  contract
}

describe('Chain', () => {
  it('should init chain', () => {
    let chain = Chain({ initialState: { ...INITIAL_STATE } });

    expect(chain.getState()).to.eql(INITIAL_STATE)

    chain = Chain();

    expect(chain.getState()).to.eql({ contract: {}, wallet: {} })
  });

  context('contract', () => {
    it('can be registered', () => {
      const chain = Chain();

      expect(chain.getState()).to.eql({ contract: {}, wallet: {} })

      chain.execute(addContract(contract.Balance))
  
      expect(chain.getState().contract).to.eql({
        [contract.Balance.id]: contract.Balance
      })
    })
  })

  context('wallet', () => {
    it('can be registered', () => {
      const chain = Chain();

      // expect(chain.getState()).to.eql({ contract: {}, wallet: {} })

      chain.execute(addWallet(wallet.Fred))
  
      expect(chain.getState().wallet).to.eql({
        [wallet.Fred.id]: wallet.Fred
      })
    })
  })
});