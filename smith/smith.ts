import {
  ConfigureParams
} from '.'

import * as chain from '../chain'
import * as contract from '../contract'
import * as core from '../core'

export class SmithContract extends contract.Contract {
  private basepoints = 'interactionpoints'

  public constructor(readonly id: string) {
    super(id)

    this.type = 'SmithContract'
    this.version = 1
    this.dependencies.core = {
      type: 'CoreContract',
      version: 1
    }
  }

  public set mintMult(mintMult: number) {
    this.table.mintMult = mintMult
  }

  public get mintMult() {
    return this.table.mintMult || 1
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
        [this.basepoints]: {

        }
      }
  }

  public getWallet = (wallet: chain.WalletType) => {
    return this.getCore().getWallet(wallet)
  }

  public configure(config: ConfigureParams): this {
    super.configure(config)

    const { mintMult } = config

    this.mintMult = mintMult

    return this
  }

  public mintInteraction = (wallet: chain.WalletType): this => {
    this.updateTable({ wallet })

    // Increment user's interaction point total
    this.table.users[wallet.id][this.basepoints] = this.table.mintMult * this.getWallet(wallet).getRank()

    console.log('mintInteraction', this.table)

    return this
  }

  public convertInteraction = (wallet: chain.WalletType): this => {
    this.updateTable({ wallet })

    if (this.table.users[wallet.id][this.basepoints] === 0)
      throw new Error(`${this.basepoints} unavailable. No ${this.basepoints} exist for wallet ${wallet.id}`)

    // TODO: convert interaction points to liboro points (baseasset)

    // TODO: calculate amount of liboro points to be minted
    // TODO: calculate amount of interaction points to be burnt

    return this
  }

  public getCore = () => {
    this.ensureDeployed()

    return this.chain.getContract(this.dependencies.core.id) as core.CoreContract
  }
}

export default SmithContract
