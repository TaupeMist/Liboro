import {
  AssetType,
  WalletType,
  ContractType
} from './types'

import {
  Contract
} from './contract'

export const format = (num: number):number => +num.toFixed(4);

export const asDecimal = (num: number):number => format(num / 100)

export const hasFunds = (amount: number, assetBuying: AssetType, assetSelling: AssetType, wallet: WalletType) => (contract: ContractType): boolean => {
  if (contract.assets[assetBuying] === 0) return true

  return amount <= wallet.assets[assetSelling] && amount <= contract.assets[assetBuying]
}

export const getValue = (asset: AssetType) => (contract: Contract): number => {
  return format(contract.table.portfolio.global[asset] / 100)
}

export const getWalletId = (wallet: WalletType): string => wallet.id.toLowerCase()
