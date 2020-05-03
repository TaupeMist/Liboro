import * as chain from '../chain';

import {
  addContract
} from '../chain';

import {
  TableType,
  WalletType,
  AssetType,
  IContract,
  ContractStateType,
  ConfigureParams,
  addAsset,
  setTable,
  deposit,
  withdraw,
  transfer,
  getWallet,
  getAsset
} from '.'

export class Contract implements IContract {
  protected chain?: chain.StoreType

  public constructor(readonly id: string) {}

  protected requiresContract(id: string, chain: chain.StoreType = this.chain) {
    if (!chain) throw new Error('Chain not found. Please ensure that the contract has been deployed.')

    if (!chain.getState().contract[id])
      throw new Error(`No contract with the id "${id}" was found. Please ensure that the contract has been deployed.`)
  }

  public get assets(): ContractStateType['assets'] {
    this.requiresContract(this.id)

    return this.chain.getState().contract[this.id].assets
  }

  public get table(): TableType {
    this.requiresContract(this.id)

    return this.chain.getState().contract[this.id].table
  }

  public set table(table: TableType) {
    this.requiresContract(this.id)

    this.chain.execute(setTable(table, this))
  }

  public get baseToken() {
    return this.getAsset(this.table.baseToken.id, this.table.baseToken)
  }

  public set baseToken(baseToken: AssetType) {
    this.table.baseToken = baseToken
  }

  public get baseAsset() {
    return this.getAsset(this.table.baseAsset.id, this.table.baseAsset)
  }

  public getState = (): ContractStateType => {
    return {
      assets: { ...this.assets },
      table: { ...this.table }
    }
  }

  public getWallet = (wallet: chain.WalletType): WalletType => {
    return getWallet(this.getState())(wallet)
  }

  public getAsset = (asset: chain.AssetType, prevAsset?: AssetType): AssetType => {
    return getAsset(this.getState())(asset, prevAsset)
  }

  // TODO: add string[] param here in order to specify dependent contracts to ensure that those contracts have been
  // TODO: deployed to the chain and exist
  public deploy(chain: chain.StoreType): this {
    if (this.chain) throw new Error('Chain already exists. Cannot override chain.')

    try {
      chain.execute(addContract(this))

      this.chain = chain

      this.updateTable({})
    } catch (ex) {
      throw new Error('Could not deploy contract.')
    }

    return this
  }

  public configure(config: ConfigureParams): this {
    if (!this.chain) throw new Error('Chain does not exist. Chain must first be deployed.')

    const { asset, token, baseAsset } = config

    this.addAsset(asset)

    this.table.baseAsset = this.getAsset(asset, {
      id: asset,
      value: baseAsset,
      marketCap: baseAsset
    })

    if (token) {
      this.addAsset(token)

      this.table.baseToken = this.getAsset(asset, {
        id: token,
        value: 0,
        marketCap: 0
      })
    }

    return this
  }

  public addAsset(asset: chain.AssetType, wallet?: chain.WalletType): this {
    this.chain.execute(addAsset(asset, this))

    this.updateTable({
      asset,
      wallet
    })

    return this
  }

  public addToken(token: string): this {
    return this.addAsset(token)
  }

  public deposit (
    amount: number,
    asset: chain.AssetType,
    sender: chain.WalletType
  ): this {
    this.chain.execute(deposit(amount, asset, sender, this.id))

    return this
  }

  public withdraw (
    amount: number,
    asset: chain.AssetType,
    receiver: chain.WalletType
  ): this {
    this.chain.execute(withdraw(amount, asset, receiver, this.id))

    return this
  }

  public transfer (
    amount: number,
    asset: chain.AssetType,
    sender: chain.WalletType,
    receiver: chain.WalletType
  ): this {
    this.chain.execute(transfer(amount, asset, sender, receiver))

    return this
  }

  // TODO: rename and clarify usage
  protected updateTable(config: {
    wallet?: chain.WalletType,
    asset?: chain.AssetType
  }) {
    if (!this.table.asset)
      this.table.asset = {}

    const { asset } = config

    if (asset) {
      if (!this.table.asset[asset])
        this.table.asset[asset] = {
          id: asset,
          value: 0,
          marketCap: 0
        }
    }
  }
}

export default Contract
