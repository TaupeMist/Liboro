import 'mocha'
import { expect } from 'chai'

import { Chain, addWallet, WalletType } from '../chain'

import { SenseContract } from '.'
import { ContentContract } from '../content'

context('Sense', () => {
  it('can init', () => {
    const chain = Chain({ initialState: { wallet: {}, contract: {} } })

    const taupemist: WalletType = {
      id: 'taupemist',
      assets: {}
    }

    chain.execute(addWallet(taupemist))

    new ContentContract('content')
      .deploy(chain)
      .configure({
        asset: 'liboropoints'
      })

    new SenseContract('sense')
      .deploy(chain, {
        content: 'content'
      })
      .configure({
        asset: 'liboropoints'
      })

    const sense = chain.getState().contract.sense as SenseContract

    expect(sense.id).to.equal('sense')
  })
})
