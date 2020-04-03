import {
  CreatePrediction,
  Prediction,
  ConfigureParams,
  getPrediction
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

  public createPrediction({
    value
  }: CreatePrediction): Prediction {
    return getPrediction(value)
  }

  // TODO: rename and clarify usage
  protected updateTable(config: {
    wallet?: chain.WalletType,
    asset?: chain.AssetType
  }) {
    super.updateTable(config)
  }
}

export default PredictionContract
