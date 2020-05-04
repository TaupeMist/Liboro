import 'mocha'
import { expect } from 'chai'

import { Chain, addWallet, WalletType } from '../chain'

import { ContentContract } from '.'
import { CoreContract } from '../core'

const init = () => {
  const chain = Chain({ initialState: { wallet: {}, contract: {} } })

  const wallet: WalletType = {
    id: 'wallet',
    assets: {}
  }

  chain.execute(addWallet(wallet))

  new CoreContract('core')
    .deploy(chain)

  new ContentContract('content')
    .deploy(chain, {
      core: 'core'
    })

  return {
    chain
  }
}

context('Content', () => {
  it('can init', () => {
    expect(init).not.to.throw

    const { chain } = init()

    const { content } = chain.getState().contract

    expect(content.id).to.equal('content')
  })
})
