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
  AssetHardType
} from '../chain'

import {
  Contract,
  getWalletId
} from '../contract'

export class PortfolioContract extends Contract {
  public constructor(readonly id: string) { super(id) }

  configure(asset: AssetHardType, token: ChainAssetType, baseAsset = 10000, wallet?: ChainWalletType): this {
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

  rebalance = (getPortfolio: GetPorfolioType, wallet: WalletType): this => {
    this.table.portfolio[getWalletId(wallet)] = calcPortfolio(getPortfolio, this.getWallet(wallet))

    this.table.portfolio.global = calcGlobalPortfolio(
      this.getWallet(wallet),
      this.baseToken,
      this.table.portfolio
    )

    return this
  }

  seed = (amount: number, asset: AssetHardType, wallet: ChainWalletType): this => {
    this.addAsset(asset, wallet)

    this.chain.execute(seed(amount, asset, wallet, this.id))

    return this
  }
}

export default PortfolioContract
