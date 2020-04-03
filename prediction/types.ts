import * as chain from '../chain'

export type CreatePrediction = {
  value: number
}

export type BooleanVote = {
  value: number
}

export type BooleanPrediction = {
  yes: BooleanVote,
  no: BooleanVote
}

export type Prediction = BooleanPrediction

export type ConfigureParams = {
  asset: chain.AssetHardType,
  wallet?: chain.WalletType
}