import * as chain from '../chain/types'

export type GetPorfolioType = (portfolio: chain.PortfolioType) => chain.PortfolioType

export type ConfigureParams = {
  asset: chain.AssetHardType,
  token?: chain.AssetType,
  baseAsset?: number,
  wallet?: chain.WalletType
}
