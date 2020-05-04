import * as chain from '../chain'

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
  canBurn?: (amount: number, assetId: chain.AssetType) => boolean,
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

export type GetPorfolioType = (portfolio: chain.PortfolioType) => chain.PortfolioType

export type ConfigureParams = {
  asset: chain.AssetType,
  token?: chain.AssetType,
  baseAsset?: number,
  wallet?: chain.WalletType
}
