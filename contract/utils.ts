import {
  AssetType,
  WalletType,
  ContractType
} from '../chain'

import {
  Contract,
} from './contract'

export const format = (num: number):number => {
  // TODO: can this method of rounding be improved?
  if (num.toString().indexOf('.0001') !== -1 || num.toString().indexOf('.9999') !== -1) {
    return +num.toFixed(0)
  }

  return +num.toFixed(4)
}

export const asDecimal = (num: number):number => format(num / 100)

export const hasFunds = (amount: number, assetBuying: AssetType, assetSelling: AssetType, wallet: WalletType) => (contract: ContractType): boolean => {
  if (contract.assets[assetBuying] === 0) return true

  return amount <= wallet.assets[assetSelling] && amount <= contract.assets[assetBuying]
}

export const getWalletId = (wallet: WalletType): string => wallet.id.toLowerCase()
