import * as chain from '../chain/types'

export type ComparisonType = {
  total: number,
  percentageOfMarketCap?: number
}

export type AssetType = {
  id: chain.AssetType,
  value: number,
  marketCap: number,
  compare?: (targetAsset: AssetType) => ComparisonType
}

export type WalletType = chain.WalletType & {
  ratioOfMarketCap?: number
}

export type TableType = {
  [K: string]: any,
  asset?: {
    [A in chain.AssetType]: AssetType
  }
}

export type ContractStateType = {
  assets: {
    [A in chain.AssetType]?: number
  },
  table: TableType
}

export type ContractType = 'Contract' | 'CoreContract' | 'ContentContract' | 'ForgeContract' | 'PortfolioContract' | 'PredictionContract' | 'SenseContract' | 'SmithContract'

export type ContractInfo = {
  id: string,
  type: ContractType,
  version: number
}

export type Dependencies = {
  [id: string]: {
    id?: string,
    type: ContractType,
    version: number
  }
}

export type DependencyMap = {
  [id: string]: string
}

export interface IContract {
  info: ContractInfo,
  assets: ContractStateType['assets'],
  table: ContractStateType['table']
}

export type ConfigureParams = {
  asset: chain.AssetType,
  token?: chain.AssetType,
  baseAsset?: number
}
