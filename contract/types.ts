import * as chain from '../chain/types'

export type ComparisonType = {
  total: number,
  percentageOfMarketCap?: number
}

export type LiboroAssetType = {
  id: chain.AssetType,
  value: number,
  marketCap: number,
  compare?: (targetAsset: LiboroAssetType) => ComparisonType
}

export type LiboroWalletReserveType = LiboroAssetType & {
  ratio: number,
  reserve: number,
  baseTokenValue: number
}

export type LiboroWalletPortfolioType = {
  [A in chain.AssetType]?: LiboroWalletReserveType
}

export type LiboroWalletType = chain.WalletType & {
  portfolio: PortfolioType,
  reserves?: LiboroWalletPortfolioType,
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
    [A in chain.AssetType]: LiboroAssetType
  },
  baseAsset: LiboroAssetType,
  baseToken: LiboroAssetType
}

export type ContractStateType = {
  assets: {
    [A in chain.AssetType]?: number
  },
  table: TableType
}
