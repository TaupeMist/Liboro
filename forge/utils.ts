import {
  WalletType
} from '.';

import * as chain from '../chain'

export const getCanMelt = (wallet: WalletType) => (amount: number, assetId: chain.AssetType): boolean => {
  return wallet.reserves[assetId].baseTokenValue >= amount
}

export const getCanBurn = (wallet: WalletType) => (amount: number, assetId: chain.AssetType): boolean => {
  return wallet.reserves[assetId].reserve >= amount
}
