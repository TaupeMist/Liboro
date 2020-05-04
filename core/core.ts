import {
  getUser
} from '.'

import * as chain from '../chain'
import * as contract from '../contract'

export class CoreContract extends contract.Contract {
  public constructor(readonly id: string) {
    super(id)

    this.type = 'CoreContract'
    this.version = 1
  }

  // TODO: rename and clarify usage
  protected updateTable(params: {
    wallet?: chain.WalletType,
    asset?: chain.AssetType
  } = {}) {
    super.updateTable(params)

    if (!this.table.users)
      this.table.users = {}

    const { wallet } = params

    if (wallet && !this.table.users[wallet.id])
      this.table.users[wallet.id] = {
        [this.baseAsset.id]: 0
      }
  }

  public getUser = (wallet: chain.WalletType): chain.WalletType => {
    this.updateTable({ wallet })

    return getUser(this.getState())(wallet)
  }
}

export default CoreContract
