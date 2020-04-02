import {
  CreatePrediction,
  Prediction
} from './types'

import {
  getPrediction
} from './utils'

import {
  AssetType as ChainAssetType,
  WalletType as ChainWalletType
} from '../chain'

import {
  Contract
} from '../contract'

export class PredictionContract extends Contract {
  public constructor(readonly id: string) { super(id) }

  public configure(): this {
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
