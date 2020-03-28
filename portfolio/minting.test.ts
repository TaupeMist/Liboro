import 'mocha'
import { expect } from 'chai'

import {
  rebalanceMint
} from './minting'

describe('Minting', () => {
  describe('rebalanceMint', () => {
    it('can rebalance', () => {
      const result = rebalanceMint(
        {
          marketCap: 100,
          id: 'usd',
          value: 100
        },
        {
          id: 'taupemist',
          assets: {
            usd: 900,
            eos: 1000,
            liborodollar: 90.9
          },
          portfolio: {
            liborodollar: 50,
            usd: 50
          }
        },
        {
          marketCap: 100,
          id: 'usd',
          value: 41.7
        },
        {
          marketCap: 90.9, 
          id: 'liborodollar',
          value: 0 
        }
      )

      expect(result).to.deep.equal({
        usd: 78.5881,
        liborodollar: 21.4119
      })
    })
  })
})