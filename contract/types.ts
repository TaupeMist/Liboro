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

export type WalletReserveType = AssetType & {
  ratio: number,
  reserve: number,
  baseTokenValue: number
}

export type WalletPortfolioType = {
  [A in chain.AssetType]?: WalletReserveType
}

export type WalletType = chain.WalletType & {
  portfolio: PortfolioType,
  reserves?: WalletPortfolioType,
  ratioOfMarketCap?: number,
  canBurn?: (amount: number, assetId: chain.AssetHardType) => boolean,
  baseTokenValue?: number
}

// TODO: change from number to LiboroAssetType
export type PortfolioType = {
  [A in chain.AssetType]?: number
}

export type TableType = {
  [K: string]: any,
  portfolio?: {
    global: PortfolioType,
    [K: string]: PortfolioType
  },
  asset?: {
    [A in chain.AssetType]: AssetType
  },
  baseAsset: AssetType,
  baseToken: AssetType
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
