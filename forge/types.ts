import * as chain from '../chain'

import * as portfolio from '../portfolio'

export type ConfigureParams = portfolio.ConfigureParams & {
  burnWallet?: string
}

export type WalletType = portfolio.WalletType & {
  canMelt?: (amount: number, assetId: chain.AssetType) => boolean,
  canBurn?: (amount: number, assetId: chain.AssetType) => boolean
}
