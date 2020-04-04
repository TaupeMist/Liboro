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

export interface IContract {
  assets: ContractStateType['assets'],
  table: ContractStateType['table']
}

export type ConfigureParams = {
  asset: chain.AssetHardType,
  token?: chain.AssetType,
  baseAsset?: number
}