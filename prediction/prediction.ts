import {
  PredictionSummary,
  ConfigureParams,
  getPredictionSummaryParams,
  calcGlobalPortfolio,
  getPredictionSummary
} from '.'

import * as chain from '../chain'

import * as portfolio from '../portfolio'

export class PredictionContract extends portfolio.PortfolioContract {
  public constructor(readonly id: string) { super(id) }

  public configure(config: ConfigureParams): this {
    super.configure(config)

    const { asset, wallet } = config

    this.updateTable({ asset, wallet })

    this.addAsset('yes', wallet)
    this.addAsset('no', wallet)

    return this
  }

  public getPredictionSummary(params: getPredictionSummaryParams): PredictionSummary {
    return getPredictionSummary(params)
  }

  public updatePrediction(value: number, wallet: chain.WalletType) {
    const summary = getPredictionSummary({ value, wallet })

    // TODO: return portfolio type instead of BooleanPrediction
    this.table.portfolio[wallet.id] = summary.prediction
    this.table.portfolio.global = calcGlobalPortfolio(summary)
  }

  // TODO: rename and clarify usage
  protected updateTable(params: {
    wallet?: chain.WalletType,
    asset?: chain.AssetType
  }) {
    super.updateTable(params)

    this.table.balance = {}

    const { wallet } = params

    if (wallet && !this.table.balance[wallet.id])
      this.table.balance[wallet.id] = 0
  }
}

export default PredictionContract
