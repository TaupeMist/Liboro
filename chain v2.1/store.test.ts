import 'mocha'
import { expect } from 'chai'

import chain from './chain'
import Token from './token'

describe('Chain', () => {
  it.only('should init chain', () => {
    const tokenAddress = chain.addAddress('tokenAddress')

    const tmToken = new Token(tokenAddress, 'tmToken')

    tmToken.issue({
      amount: 15,
      receiver: tokenAddress
    })

    expect(chain.state.address.entities.tokenAddress.id).to.equal('tokenAddress')
    expect(chain.state.address.entities.tokenAddress.contractIds).to.deep.equal([])
    expect(chain.state.address.entities.tokenAddress.contractId).to.equal('tmToken')

    expect(chain.state.contract.entities.tmToken.id).to.equal('tmToken')
    expect(chain.state.contract.entities.tmToken.global.supply).to.equal(15)
    expect(chain.state.contract.entities.tmToken.tokenAddress.amount).to.equal(15)

    // console.log('tokenAddress', chain.state.address.entities.tokenAddress)
    // console.log('tmToken', chain.state.contract.entities.tmToken)

    console.log('address', chain.state.address)
    console.log('contract', chain.state.contract)
  })
})
