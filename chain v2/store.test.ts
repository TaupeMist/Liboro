import 'mocha'
import { expect } from 'chai'

import { chain } from '../chain v2'
import Token from './token'

describe('Chain', () => {
  it('should init chain', () => {
    const tokenAddress = chain.addAddress('tokenAddress')

    const tmToken = new Token('tmToken')

    tokenAddress.addContract(tmToken)

    tmToken.mint(tokenAddress)

    console.log(tokenAddress.contracts)
    // console.log(chain.state.address.entities.tokenAddress.contract.entities.tmToken)
    // console.log(chain.addresses)
    // console.log(token.state)
  })
})
