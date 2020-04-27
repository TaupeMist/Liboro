import * as chain from '../chain'

import * as portfolio from '../portfolio'

import * as contract from '../contract'

export type TokenType = 'yes' | 'no'

export type AssetType = contract.AssetType & {
  id: TokenType | chain.AssetType
}

export type ConfigureParams = {
  asset: chain.AssetHardType,
  wallet?: chain.WalletType
}

export type CreditType = {
  [T in TokenType]?: number
}

export type WalletType = portfolio.WalletType & {
  credit: CreditType,
  creditBuyable: CreditType,
  balance: {
    [A in chain.AssetHardType | TokenType]?: number
  },
  total: {
    [A in chain.AssetHardType | TokenType]?: number
  }
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
  nextBalance: {
    [A in chain.AssetHardType | TokenType]?: number
  },
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

export type CreditBuybackSummary = {
  remainder: number,
  mintable?: {
    id: TokenType,
    value: number
  },
  nextBalance: {
    [A in chain.AssetHardType | TokenType]?: number
  },
  nextCredit: CreditType
}
