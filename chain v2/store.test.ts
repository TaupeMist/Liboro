import 'mocha'
import { expect } from 'chai'

import chain from './chain'

describe('Chain', () => {
  it.only('should init chain', () => {
    const tokenAddress = chain.addAddress('tokenAddress')
    const tmToken = tokenAddress.addContract('tmToken')

    tmToken.issue({
      amount: 15,
      receiver: tokenAddress
    })

    expect(tokenAddress.state.id).to.equal('tokenAddress')
    expect(tokenAddress.state.contractIds).to.deep.equal([])
    expect(tokenAddress.state.contractId).to.equal('tmToken')

    expect(tmToken.state.id).to.equal('tmToken')
    expect(tmToken.state.global.supply).to.equal(15)
    expect(tmToken.state.tokenAddress.amount).to.equal(15)
  })
})
