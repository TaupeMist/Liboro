import * as chain from '../chain'

import * as portfolio from '../portfolio'

import * as contract from '../contract'

export type TokenType = 'yes' | 'no'

export type AssetType = contract.AssetType & {
  id: TokenType | chain.AssetType
}

export type ConfigureParams = {
  asset: chain.AssetType,
  wallet?: chain.WalletType
}

export type CreditType = {
  [T in TokenType]?: number
}

export type WalletType = portfolio.WalletType & {
  credit: CreditType,
  creditBuyable: CreditType,
  balance: {
    [A in chain.AssetType | TokenType]?: number
  },
  total: {
    [A in chain.AssetType | TokenType]?: number
  }
}

export type GetPredictionSummaryParams = {
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
    [A in chain.AssetType | TokenType]?: number
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
    [A in chain.AssetType | TokenType]?: number
  },
  nextCredit: CreditType
}

export type getResolutionSummaryParams = {
  asset: AssetType
  balance: number,
  wallets: WalletType[]
}

export type WalletPayableType = WalletType & {
  payable: AssetType
}

export type ResolutionSummary = {
  value: number,
  wallets: WalletPayableType[]
}
