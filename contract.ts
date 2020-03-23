import { addContractNew } from './chain.commands';

import {
  AssetHardType,
  StoreType,
  AssetType,
  WalletType,
  ContractStateType,
  GetPorfolioType,
  TableType,
} from './chain.types'

import {
  addAsset,
  setTable,
  seed,
  mint,
  liquidate,
  transfer
} from './contract.commands'

import {
  calcPortfolio,
  calcGlobalPortfolio,
  getWalletId,
  calcMintPayable,
  calcLiquidatePayable,
  format
} from './contract.utils'

export class Contract {
  private chain?: StoreType

  public constructor(readonly id: string) {}

  get assets(): ContractStateType['assets'] {
    try {
      return this.chain.getState().contractNew[this.id].assets
    } catch (ex) {
      throw new Error('Contract not found. Please ensure that the contract has been deployed.')
    }
  }

  get table(): TableType {
    try {
      return this.chain.getState().contractNew[this.id].table
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

  deploy = (chain: StoreType): this => {
    if (this.chain) throw new Error('Chain already exists. Cannot override chain.')

    try {
      chain.execute(addContractNew(this))

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

  configure = (asset: AssetHardType, token: AssetType, baseSupply = 10000, wallet?: WalletType): this => {
    if (!this.chain) throw new Error('Chain does not exist. Chain must first be deployed.')

    this.addAsset(asset)
    this.addAsset(token)

    this.table.baseSupply = baseSupply
    this.table.baseAsset = asset
    this.table.baseToken = token

    const initialPortfolio = {
      [this.table.baseToken]: 0,
      [this.table.baseAsset]: 100
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

    // TODO: The global portfolio should also be updated here.
    // Perhaps the global portfolio should be replaced by a linear asset
    // as it may not be possible to calculate otherwise

    return this
  }

  seed = (amount: number, asset: AssetHardType, wallet: WalletType): this => {
    this.addAsset(asset, wallet)

    this.chain.execute(seed(amount, asset, wallet, this.id))

    return this
  }

  mint = (amount: number, asset: AssetHardType, wallet: WalletType): this => {
    const payable = calcMintPayable(amount, this.table.baseToken, asset)(this)

    this.chain.execute(mint(amount, asset, wallet, this.id))

    this.updateTable({
      asset,
      wallet
    })

    // TODO: move calc to utils
    this.table.asset[asset].marketCap = format(this.table.asset[asset].marketCap + amount)

    // TODO: move calc to utils
    this.table.asset[this.table.baseToken].marketCap = format(this.table.asset[this.table.baseToken].marketCap + payable)

    return this
  }

  liquidate = (amount: number, asset: AssetHardType, wallet: WalletType): this => {
    const payable = calcLiquidatePayable(amount, asset, this.table.baseToken)(this)

    this.chain.execute(liquidate(amount, asset, wallet, this.id))

    // TODO: move calc to utils
    this.table.asset[asset].marketCap = format(this.table.asset[asset].marketCap - payable)

    // TODO: move calc to utils
    this.table.asset[this.table.baseToken].marketCap = format(this.table.asset[this.table.baseToken].marketCap - amount)

    return this
  }

  rebalance = (getPortfolio: GetPorfolioType, wallet: WalletType): this => {
    this.table.portfolio[getWalletId(wallet)] = calcPortfolio(getPortfolio, wallet)(this)
    this.table.portfolio.global = calcGlobalPortfolio(getPortfolio, wallet)(this)

    return this
  }

  // TODO: rename and clarify usage
  private updateTable = (config: {
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
      // Use the current global portfolio as default wallet portfolio
      const isNewWalletPortfolio = !this.table.portfolio[getWalletId(wallet)]
      if (isNewWalletPortfolio) {
        this.table.portfolio[getWalletId(wallet)] = { ...this.table.portfolio.global }
      }

      const isNewAsset = asset && !this.table.portfolio[getWalletId(wallet)][asset]
      if (isNewAsset)
        this.table.portfolio[getWalletId(wallet)][asset] = 0
    }
  }
}
