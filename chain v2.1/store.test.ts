import 'mocha'
import { expect } from 'chai'

import chain from './chain'
import address from './address'
import Token from './token'

describe('Chain', () => {
  it.only('should init chain', () => {
    const tokenAddress = chain.addAddress('tokenAddress')

    const tmToken = new Token(tokenAddress, 'tmToken')

    tmToken.mint()

    console.log(tmToken)
    // console.log(chain.state.address.entities.tokenAddress.contract.entities.tmToken)
    // console.log(chain.addresses)
    // console.log(token.state)
  })
})
