import {
  getWallet,
  WalletType
} from '.'

import * as chain from '../chain'
import * as contract from '../contract'
import * as smith from '../smith'

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

  public getWallet = (wallet: chain.WalletType): WalletType => {
    this.updateTable({ wallet })

    return getWallet(this.getState())(wallet)
  }


  public getSmith = () => {
    return this.getChild('SmithContract') as smith.SmithContract
  }
}

export default CoreContract
