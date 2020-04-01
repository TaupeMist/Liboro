import {
  calcPortfolio,
  calcGlobalPortfolio
} from './utils'

import {
  GetPorfolioType
} from './types'

import {
  seed
} from './commands'

import {
  WalletType,
  AssetType as ChainAssetType,
  WalletType as ChainWalletType,
  AssetHardType,
  StoreType
} from '../chain'

import {
  Contract,
  getWalletId
} from '../contract'

export class PortfolioContract extends Contract {
  public constructor(readonly id: string) { super(id) }

  public deploy(chain: StoreType): this {
    try {
      super.deploy(chain)

      this.updateTable({})
    } catch (ex) {
      throw new Error('Could not deploy contract.')
    }

    return this
  }

  public configure(asset: AssetHardType, token: ChainAssetType, baseAsset = 10000, wallet?: ChainWalletType): this {
    super.configure(asset, token, baseAsset)

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

  public addAsset(asset: ChainAssetType, wallet?: ChainWalletType): this {
    super.addAsset(asset, wallet)

    this.updateTable({ asset, wallet })

    return this
  }

  public rebalance(getPortfolio: GetPorfolioType, wallet: WalletType): this {
    this.table.portfolio[getWalletId(wallet)] = calcPortfolio(getPortfolio, this.getWallet(wallet))

    this.table.portfolio.global = calcGlobalPortfolio(
      this.getWallet(wallet),
      this.baseToken,
      this.table.portfolio
    )

    return this
  }

  public seed(amount: number, asset: AssetHardType, wallet: ChainWalletType): this {
    this.addAsset(asset, wallet)

    this.chain.execute(seed(amount, asset, wallet, this.id))

    return this
  }

  // TODO: rename and clarify usage
  protected updateTable(config: {
    wallet?: ChainWalletType,
    asset?: ChainAssetType
  }) {
    super.updateTable(config)

    if (!this.table.portfolio)
      this.table.portfolio = {
        global: {}
      }

    const { wallet, asset } = config

    if (asset) {
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

export default PortfolioContract
