import * as chain from '../chain'

import * as portfolio from '../portfolio'

export type TokenType = 'yes' | 'no'

export type ConfigureParams = {
  asset: chain.AssetHardType,
  wallet?: chain.WalletType
}

export type getPredictionSummaryParams = {
  value: number,
  wallet: portfolio.WalletType,
  currPrediction: PredictionType
}

export type BooleanPrediction = {
  [T in TokenType]: number
}

export type PredictionType = BooleanPrediction

export type PredictionSummary = {
  prediction: PredictionType,
  nextBalance: number
}
