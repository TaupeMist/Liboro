import { addContract, IContract } from '../chain';

import {
  AssetHardType,
  StoreType,
  AssetType,
  WalletType,
  ContractStateType,
  TableType,
  LiboroWalletType,
  LiboroAssetType
} from './types'

import {
  addAsset,
  setTable,
  seed,
  transfer
} from './commands'

import {
  getWalletId
} from './utils'

import {
  getLiboroWallet,
  getLiboroAsset
} from './selectors'

export class Contract implements IContract {
  protected chain?: StoreType

  public constructor(readonly id: string) {}

  get assets(): ContractStateType['assets'] {
    try {
      return this.chain.getState().contract[this.id].assets
    } catch (ex) {
      throw new Error('Contract not found. Please ensure that the contract has been deployed.')
    }
  }

  get table(): TableType {
    try {
      return this.chain.getState().contract[this.id].table
    } catch (ex) {
      throw new Error('Contract not found. Please ensure that the contract has been deployed.')
    }
  }

  set table(table: TableType) {
    try {
      this.chain.execute(setTable(table, this))
    } catch (ex) {
      throw new Error('Contract not found. Please ensure that the contract has been deployed.')
    }
  }

  set baseToken(baseToken: string) {
    this.table = {
      ...this.table,
      baseToken
    }
  }

  get baseToken() {
    return this.table.baseToken
  }

  get baseAsset() {
    return this.getAsset(this.table.baseAsset.id, this.table.baseAsset)
  }

  getState = () => {
    return {
      assets: { ...this.assets },
      table: { ...this.table }
    }
  }

  // TODO: return additonal account information (including its assets and price indexes) and create type
  getWallet = (wallet: WalletType): LiboroWalletType => {
    // TODO: return wallet portfolio cap
    // TODO: return price index based wallet portfolio

    return getLiboroWallet(this.getState())(wallet)
  }

  // TODO: return additonal asset information and create type
  getAsset = (asset: AssetType, prevAsset?: LiboroAssetType): LiboroAssetType => {
    // TODO: return global market cap
    // TODO: return price index based global portfolio

    return getLiboroAsset(this.getState())(asset, prevAsset)
  }

  deploy = (chain: StoreType): this => {
    if (this.chain) throw new Error('Chain already exists. Cannot override chain.')

    try {
      chain.execute(addContract(this))

      this.chain = chain

      this.table.portfolio = {
        global: {}
      }
  
      this.table.asset = {}
    } catch (ex) {
      throw new Error('Could not deploy contract.')
    }

    return this
  }

  configure = (asset: AssetHardType, token: AssetType, baseAsset = 10000, wallet?: WalletType): this => {
    if (!this.chain) throw new Error('Chain does not exist. Chain must first be deployed.')

    this.addAsset(asset)
    this.addAsset(token)

    this.table.baseAsset = this.getAsset(asset, {
      id: asset,
      value: baseAsset,
      marketCap: baseAsset
    })

    this.table.baseToken = token

    const initialPortfolio = {
      [this.table.baseToken]: 0,
      [this.table.baseAsset.id]: 100
    }

    this.table.portfolio = {
      global: { ...initialPortfolio }
    }

    if (wallet)
      this.table.portfolio[getWalletId(wallet)] = { ...initialPortfolio }

    return this
  }

  addAsset = (asset: AssetType, wallet?: WalletType): this => {
    this.chain.execute(addAsset(asset, this))

    this.updateTable({
      asset,
      wallet
    })

    return this
  }

  addToken = (token: string): this => {
    return this.addAsset(token)
  }

  transfer = (amount: number, asset: AssetType, sender: WalletType, receiver: WalletType) => {
    this.chain.execute(transfer(amount, asset, sender, receiver))

    return this
  }

  seed = (amount: number, asset: AssetHardType, wallet: WalletType): this => {
    this.addAsset(asset, wallet)

    this.chain.execute(seed(amount, asset, wallet, this.id))

    return this
  }

  // TODO: rename and clarify usage
  protected updateTable = (config: {
    wallet?: WalletType,
    asset?: AssetType
  }) => {
    const { wallet, asset } = config

    if (asset) {
      if (!this.table.asset[asset])
        this.table.asset[asset] = {
          marketCap: 0
        }

      if (!this.table.portfolio.global[asset])
        this.table.portfolio.global[asset] = 0
    }

    if (wallet) {
      // If wallet portfolio does not exist, set wallet portfolio asset to current global portfolio
      const isNewWalletPortfolio = !this.table.portfolio[getWalletId(wallet)]
      if (isNewWalletPortfolio) {
        this.table.portfolio[getWalletId(wallet)] = { ...this.table.portfolio.global }
      }

      // If wallet portfolio's asset does not exist, set wallet portfolio's asset to 0
      const isNewAsset = asset && !this.table.portfolio[getWalletId(wallet)][asset]
      if (isNewAsset)
        this.table.portfolio[getWalletId(wallet)][asset] = 0
    }
  }
}

export default Contract
