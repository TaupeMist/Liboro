import * as chain from '../chain'

import * as portfolio from '../portfolio'

export type TokenType = 'yes' | 'no'

export type ConfigureParams = {
  asset: chain.AssetHardType,
  wallet?: chain.WalletType
}

export type CreditType = {
  [T in TokenType]?: number
}

export type WalletType = portfolio.WalletType & {
  prediction: PredictionType,
  credit: CreditType,
  balance: number
}

export type getPredictionSummaryParams = {
  value: number,
  wallet: WalletType
}

export type BooleanPrediction = {
  [T in TokenType]: number
}

export type PredictionType = BooleanPrediction

export type PredictionSummary = {
  prediction: PredictionType,
  nextBalance: number,
  nextCredit: CreditType
}

export type TableType = portfolio.TableType & {
  balance: {
    [K: string]: number
  },
  credit: {
    [K: string]: CreditType
  }
}
