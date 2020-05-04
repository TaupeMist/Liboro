import * as chain from '../chain'

import * as portfolio from '../portfolio'

export type WalletType = portfolio.WalletType & {
  canBurn?: (amount: number, assetId: chain.AssetType) => boolean
}