import * as chain from '../chain'

export type ConfigureParams = {
  asset: chain.AssetHardType,
  wallet?: chain.WalletType
}

export type getPredictionSummaryParams = {
  value: number,
  wallet: chain.WalletType
}

export type BooleanPrediction = {
  yes: number,
  no: number
}

export type Prediction = BooleanPrediction

export type PredictionSummary = {
  prediction: Prediction
}
