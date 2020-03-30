import {
  addContract,
  AssetHardType,
  StoreType,
  AssetType as ChainAssetType,
  WalletType as ChainWalletType
} from '../chain';

import {
  TableType,
  WalletType,
  AssetType,
  IContract,
  ContractStateType
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
  getWallet,
  getAsset
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

  get baseToken() {
    return this.getAsset(this.table.baseToken.id, this.table.baseToken)
  }

  set baseToken(baseToken: AssetType) {
    this.table.baseToken = baseToken
  }

  get baseAsset() {
    return this.getAsset(this.table.baseAsset.id, this.table.baseAsset)
  }

  getState = (): ContractStateType => {
    return {
      assets: { ...this.assets },
      table: { ...this.table }
    }
  }

  getWallet = (wallet: ChainWalletType): WalletType => {
    return getWallet(this.getState())(wallet)
  }

  getAsset = (asset: ChainAssetType, prevAsset?: AssetType): AssetType => {
    return getAsset(this.getState())(asset, prevAsset)
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

  configure = (asset: AssetHardType, token: ChainAssetType, baseAsset = 10000, wallet?: ChainWalletType): this => {
    if (!this.chain) throw new Error('Chain does not exist. Chain must first be deployed.')

    this.addAsset(asset)
    this.addAsset(token)

    this.table.baseAsset = this.getAsset(asset, {
      id: asset,
      value: baseAsset,
      marketCap: baseAsset
    })

    this.table.baseToken = this.getAsset(asset, {
      id: token,
      value: 0,
      marketCap: 0
    })

    const initialPortfolio = {
      [this.table.baseToken.id]: 0,
      [this.table.baseAsset.id]: 100
    }

    this.table.portfolio = {
      global: { ...initialPortfolio }
    }

    if (wallet)
      this.table.portfolio[getWalletId(wallet)] = { ...initialPortfolio }

    return this
  }

  addAsset = (asset: ChainAssetType, wallet?: ChainWalletType): this => {
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

  transfer = (amount: number, asset: ChainAssetType, sender: ChainWalletType, receiver: ChainWalletType) => {
    this.chain.execute(transfer(amount, asset, sender, receiver))

    return this
  }

  seed = (amount: number, asset: AssetHardType, wallet: ChainWalletType): this => {
    this.addAsset(asset, wallet)

    this.chain.execute(seed(amount, asset, wallet, this.id))

    return this
  }

  // TODO: rename and clarify usage
  protected updateTable = (config: {
    wallet?: ChainWalletType,
    asset?: ChainAssetType
  }) => {
    const { wallet, asset } = config

    if (asset) {
      if (!this.table.asset[asset])
        this.table.asset[asset] = {
          id: asset,
          value: 0,
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
