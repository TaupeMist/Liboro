import 'mocha'
import { expect } from 'chai'

import { Chain } from '../chain'

import {
  Contract
} from '.'

export class DependencyContract extends Contract {
  public constructor(readonly id: string) {
    super(id)

    this.type = 'SenseContract'
    this.version = 1
    this.dependencies.content = {
      type: 'ContentContract',
      version: 1
    }
  }
}

describe('Contract', () => {
  it('can init', () => {
    const contract = new Contract('contract')

    expect(contract.id).to.deep.equal('contract')
  })

  it('can deploy', () => {
    const chain = Chain({ initialState: { wallet: {}, contract: {} } })

    new Contract('contract').deploy(chain)

    expect(chain.getState().contract.contract).to.exist
  })

  it('should throw if dependent contract does not exist', () => {
    const chain = Chain({ initialState: { wallet: {}, contract: {} } })

    const withoutDependentConract = () => {
      new DependencyContract('sense')
      .deploy(chain, {
        content: 'content'
      })
      .configure({
        asset: 'liboropoints'
      })
    }

    expect(withoutDependentConract).to.throw('Could not deploy contract. Error: Dependency mismatch. Expected dependent contract "content" to have been deployed')
  })

  it('should throw if dependent contract mapping does not exist', () => {
    const chain = Chain({ initialState: { wallet: {}, contract: {} } })

    const withoutDependentConractMapping = () => {
      new Contract('contract')
        .deploy(chain)
        .configure({
          asset: 'liboropoints'
        })

      new DependencyContract('dependency')
      .deploy(chain)
      .configure({
        asset: 'liboropoints'
      })
    }

    expect(withoutDependentConractMapping).to.throw('Could not deploy contract. Error: Dependency mismatch. Expected dependency "content" to be defined in {}');
  })

  it('can configure', () => {
    const chain = Chain({ initialState: { wallet: {}, contract: {} } })

    new Contract('contract')
      .deploy(chain)
      .configure({
        asset: 'usd',
        token: 'liborodollar',
        baseAsset: 100
      })

    const { contract } = chain.getState().contract

    expect(contract.table.asset.usd).to.deep.equal({
      id: 'usd',
      marketCap: 0,
      value: 0
    })
    expect(contract.table.asset.liborodollar).to.deep.equal({
      id: 'liborodollar',
      marketCap: 0,
      value: 0
    })

    expect(contract.table.baseAsset.value).to.deep.equal(100)
  })

  it('can add hard assets', () => {
    const chain = Chain({ initialState: { wallet: {}, contract: {} } })

    new Contract('contract')
      .deploy(chain)
      .configure({
        asset: 'usd',
        token: 'liborodollar',
        baseAsset: 100
      })
      .addAsset('eos')

    const { contract } = chain.getState().contract

    expect(contract.table.asset.usd).to.deep.equal({
      id: 'usd',
      marketCap: 0,
      value: 0
    })
    expect(contract.table.asset.liborodollar).to.deep.equal({
      id: 'liborodollar',
      marketCap: 0,
      value: 0
    })
    expect(contract.table.asset.eos).to.deep.equal({
      id: 'eos',
      marketCap: 0,
      value: 0
    })

    expect(contract.assets.usd).to.deep.equal(0)
    expect(contract.assets.eos).to.deep.equal(0)
  })

  it('can add tokens', () => {
    const chain = Chain({ initialState: { wallet: {}, contract: {} } })

    new Contract('contract')
      .deploy(chain)
      .configure({
        asset: 'usd',
        token: 'liborodollar',
        baseAsset: 100
      })
      .addToken('taupemist')

    const { contract } = chain.getState().contract

    expect(contract.table.asset.usd).to.deep.equal({
      id: 'usd',
      marketCap: 0,
      value: 0
    })
    expect(contract.table.asset.liborodollar).to.deep.equal({
      id: 'liborodollar',
      marketCap: 0,
      value: 0
    })
    expect(contract.table.asset.taupemist).to.deep.equal({
      id: 'taupemist',
      marketCap: 0,
      value: 0
    })

    expect(contract.assets.liborodollar).to.deep.equal(0)
    expect(contract.assets.taupemist).to.deep.equal(0)
  })
})