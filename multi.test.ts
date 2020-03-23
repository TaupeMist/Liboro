import 'mocha'
import { expect } from 'chai'

import Chain from './chain'
import { addContract } from './chain.commands';
import { add } from './multi.commands';

import { init as initMulti } from './multi.commands'

const getMulti = () => {
  const chain = Chain({ initialState: { wallet: {}, contract: {} } })

  const multi = initMulti('multi-usd')

  chain.execute(addContract(multi))
  chain.execute(add('usd', multi))

  return { chain, multi }
}

describe('Multi', () => {
  context('state', () => {
    it('can init', () => {
      const multi = initMulti('multi-usd')

      expect(multi).to.deep.equal(
        {
          id: 'multi-usd',
          assets: {
            token: 0
          },
          portfolio: {}
        }
      )
    })

    it('can add token', () => {
      const chain = Chain({ initialState: { wallet: {}, contract: {} } })

      const multi = initMulti('multi-usd')

      chain.execute(addContract(multi))

      expect(chain.getState().contract['multi-usd']).to.deep.equal(
        {
          id: 'multi-usd',
          assets: {
            token: 0
          },
          portfolio: {}
        }
      )
    })

    it('can add multi to chain', () => {
      const { chain } = getMulti()

      expect(chain.getState().contract['multi-usd']).to.deep.equal(
        {
          id: 'multi-usd',
          assets: {
            token: 0,
            usd: 0
          },
          portfolio: {}
        }
      )
    })
  })
});