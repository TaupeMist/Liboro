import {
  calcPortfolio,
  calcGlobalPortfolio
} from './utils'

import {
  GetPorfolioType,
  WalletType
} from '../chain'

import {
  Contract,
  getWalletId
} from '../contract'

export class PortfolioContract extends Contract {
  public constructor(readonly id: string) { super(id) }

  rebalance = (getPortfolio: GetPorfolioType, wallet: WalletType): this => {
    this.table.portfolio[getWalletId(wallet)] = calcPortfolio(getPortfolio, this.getWallet(wallet))

    this.table.portfolio.global = calcGlobalPortfolio(
      this.getWallet(wallet),
      this.baseToken,
      this.table.portfolio
    )

    return this
  }
}

export default PortfolioContract
