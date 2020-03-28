import { addContract } from '../chain/commands';

import {
  AssetHardType,
  StoreType,
  AssetType,
  WalletType,
  ContractStateType,
  GetPorfolioType,
  TableType,
  PortfolioType,
  LiboroWalletType,
  LiboroAssetType
} from './types'

import {
  addAsset,
  setTable,
  seed,
  mint,
  burn,
  transfer
} from './commands'

import {
  calcPortfolio,
  calcGlobalPortfolio,
  getWalletId,
  calcMintPayable,
  calcBurnPayable,
  format,
  rebalanceMint,
  rebalanceBurn
} from './utils'

import {
  getLiboroWallet,
  getLiboroAsset
} from './selectors'

export class Contract {
  private chain?: StoreType

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
  getAsset = (asset: AssetType): LiboroAssetType => {
    // TODO: return global market cap
    // TODO: return price index based global portfolio

    return getLiboroAsset(this.getState())(asset)
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

    return this
  }

  seed = (amount: number, asset: AssetHardType, wallet: WalletType): this => {
    this.addAsset(asset, wallet)

    this.chain.execute(seed(amount, asset, wallet, this.id))

    return this
  }

  mint = (amount: number, asset: AssetHardType, wallet: WalletType): this => {
    this.updateTable({
      asset,
      wallet
    })

    const liboroAsset = {
      ...this.getAsset(asset),
      value: amount
    }

    const payable = calcMintPayable(liboroAsset)(this)

    console.log('calcMintPayable', payable)

    const increasePortfolioAsset = (portfolio: PortfolioType): PortfolioType => {
      if (!wallet.assets[this.baseToken] || wallet.assets[this.baseToken] === undefined)
        return portfolio

      console.log('asset', asset, wallet.assets)

      // When wallet portfolio cannot be increased
      if (this.getWallet(wallet).portfolio[asset] === 100)
        return portfolio

      const nextPortfolio = rebalanceMint(portfolio, asset, wallet, payable, this.getAsset(this.baseToken))

      console.log('result', nextPortfolio)

      return nextPortfolio
    }

    this.rebalance(increasePortfolioAsset, wallet)

    this.chain.execute(mint(liboroAsset, wallet, this.id))    

    // TODO: move calc to utils
    this.table.asset[asset].marketCap = format(this.table.asset[asset].marketCap + amount)

    // TODO: move calc to utils
    this.table.asset[this.table.baseToken].marketCap = format(this.table.asset[this.table.baseToken].marketCap + payable.value)

    return this
  }

  burn = (amount: number, asset: AssetHardType, wallet: WalletType): this => {
    const liboroAsset = {
      ...this.getAsset(asset),
      value: amount
    }
    const payable = calcBurnPayable(liboroAsset)

    console.log('burnPayable', payable)

    const descreasePortfolioAsset = (portfolio: PortfolioType): PortfolioType => {
      if (!wallet.assets[this.baseToken] || wallet.assets[this.baseToken] === undefined)
        return portfolio

      console.log('descreasePortfolioAsset', this.getWallet(wallet))

      // When wallet portfolio cannot be decreased
      if (this.getWallet(wallet).portfolio[this.baseToken] === 0)
        return portfolio

      console.log('asset', asset, wallet.assets)

      const nextPortfolio = rebalanceBurn(
        portfolio,
        this.getAsset(asset),
        this.getWallet(wallet),
        payable,
        this.getAsset(this.baseToken))

      console.log('result', nextPortfolio)

      // TODO: calc and set wallet portfolio
      // should also be applied when burning (in reverse)
      // using the payable amount, calculate the portfolio increase portfolio of that asset
      // add equal/flat decrease of other assets

      return nextPortfolio
    }

    this.rebalance(descreasePortfolioAsset, wallet)

    this.chain.execute(burn(liboroAsset, wallet, this.id))

    // TODO: calc and set wallet portfolio
    this.table.portfolio.global = calcGlobalPortfolio(wallet)(this)

    // TODO: move calc to utils
    this.table.asset[asset].marketCap = format(this.table.asset[asset].marketCap - payable.value)

    // TODO: move calc to utils
    this.table.asset[this.table.baseToken].marketCap = format(this.table.asset[this.table.baseToken].marketCap - amount)

    return this
  }

  rebalance = (getPortfolio: GetPorfolioType, wallet: WalletType): this => {
    this.table.portfolio[getWalletId(wallet)] = calcPortfolio(getPortfolio, wallet)(this)
    this.table.portfolio.global = calcGlobalPortfolio(wallet)(this)

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
