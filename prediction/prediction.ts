import {
  CreatePrediction,
  Prediction,
  ConfigureParams
} from './types'

import {
  getPrediction
} from './utils'

import {
  AssetType as ChainAssetType,
  WalletType as ChainWalletType,
} from '../chain'

import {
  PortfolioContract
} from '../portfolio'

export class PredictionContract extends PortfolioContract {
  public constructor(readonly id: string) { super(id) }

  public configure(config: ConfigureParams): this {
    super.configure(config)

    const { asset } = config

    this.updateTable({ asset })

    this.addAsset('yes')
    this.addAsset('no')

    return this
  }

  public createPrediction({
    value
  }: CreatePrediction): Prediction {
    return getPrediction(value)
  }

  // TODO: rename and clarify usage
  protected updateTable(config: {
    wallet?: ChainWalletType,
    asset?: ChainAssetType
  }) {
    super.updateTable(config)
  }
}

export default PredictionContract
