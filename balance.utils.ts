import {
  StateType,
  AssetType,
  WalletType,
  ContractType,
} from './chain.types'

export const format = (num: number):number => +num.toFixed(2);

export const getAltAssetType = (assetType: AssetType): AssetType => (assetType === 'token' ? 'usd' : 'token');

export const hasFunds = (amount: number, assetBuying: AssetType, wallet: WalletType) => (contract: ContractType): boolean => {
  const assetSelling = getAltAssetType(assetBuying)

  if (contract.assets[assetBuying] === 0) return true

  return amount <= wallet.assets[assetSelling] && amount <= contract.assets[assetBuying]
}

export const calcPayable = (amount: number, assetBuying: AssetType) => (contract: ContractType): number => {
  const assetSelling = getAltAssetType(assetBuying)
  
  const ratio = format(amount / (contract.assets[assetSelling] + amount));

  const payable = ratio * contract.assets[assetBuying];

  return Math.round(payable);
};

export const getRandom = (floor: number, ceil: number) => Math.floor((Math.random() * ceil) + floor);
