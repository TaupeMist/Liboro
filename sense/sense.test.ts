import 'mocha'
import { expect } from 'chai'

import { Chain, addWallet, WalletType } from '../chain'

import { SenseContract } from '.'
import { CoreContract } from '../core'
import { ContentContract } from '../content'

const init = () => {
  const chain = Chain({ initialState: { wallet: {}, contract: {} } })

  const wallet: WalletType = {
    id: 'wallet',
    assets: {}
  }

  chain.execute(addWallet(wallet))

  new CoreContract('core')
    .deploy(chain)
    .configure({
      asset: 'liboropoints'
    })

  new ContentContract('content')
    .deploy(chain, {
      core: 'core'
    })

  const senseContract = new SenseContract('sense')
    .deploy(chain, {
      content: 'content'
    })

  return {
    chain,
    wallet,
    senseContract
  }
}

context('Sense', () => {
  it('can init', () => {
    expect(init).not.to.throw

    const { chain } = init()

    const { sense } = chain.getState().contract

    expect(sense.id).to.equal('sense')
  })

  it('can interact', () => {
    const { chain, wallet, senseContract } = init()

    senseContract.interact(wallet)

    const { sense } = chain.getState().contract

    expect(sense.id).to.equal('sense')
  })
})
