import {
  WalletType,
  AssetType,
  ComparisonType,
  WalletPortfolioType,
  ContractStateType,
  TableType
} from './types'

import {
  getWalletId,
  format
} from './utils'

import {
  AssetType as ChainAssetType,
  WalletType as ChainWalletType,
  AssetHardType
} from '../chain'

export const getPortfolio = (state: ContractStateType): TableType['portfolio'] => {
  return state.table.portfolio
}

export const getComparison = (state: ContractStateType) => (asset: AssetType, targetAsset: AssetType): ComparisonType => {
  const comparison: ComparisonType = {
    total: getAssetTotal(state.table.baseAsset, state.assets[asset.id], targetAsset),
    percentageOfMarketCap: getAssetPercentageOfMarketCap(asset, targetAsset)
  }

  return comparison
}

export const getAsset = (state: ContractStateType) => (asset: ChainAssetType, prevAsset?: AssetType): AssetType => {
  const predefinedAsset = {
    ...state.table.asset[asset],
    ...prevAsset
  } 

  const newAsset = {
    ...state.table.asset[asset],
    id: asset,
    value: state.assets[asset],
  }

  const nextAsset = prevAsset
    ? predefinedAsset
    : newAsset

  nextAsset.compare = (targetAsset: AssetType) => getComparison(state)(nextAsset, targetAsset)

  return nextAsset
}

export const getWalletRatioOfMarketCap = (state: ContractStateType) => (wallet: WalletType) => {
  const walletBaseTokenValue = wallet.assets[state.table.baseToken.id]

  return walletBaseTokenValue
    ? walletBaseTokenValue / state.table.baseToken.marketCap
    : 0
}

export const getPortfolioRatio = (wallet: WalletType, assetId: ChainAssetType) => {
  return wallet.portfolio[assetId] / 100
}

export const getReserve = (state: ContractStateType) => (wallet: WalletType, assetId: ChainAssetType): number => {
  return format(wallet.ratioOfMarketCap * state.table.asset[assetId].marketCap * getPortfolioRatio(wallet, assetId))
}

export const getReserves = (state: ContractStateType) => (wallet: WalletType): WalletPortfolioType => {
  const assetIds = Object.keys(wallet.portfolio)

  const intoPortfolio = (acc: WalletPortfolioType, assetId: ChainAssetType): WalletPortfolioType => {
    const liboroAsset = getAsset(state)(assetId)
    const value = wallet.portfolio[assetId]
    const marketCap = assetId === state.table.baseToken.id
      ? state.table.baseToken.marketCap
      : state.table.asset[assetId].marketCap
    const ratio = getPortfolioRatio(wallet, assetId)
    const reserve = getReserve(state)(wallet, assetId)
    const baseTokenValue = ratio * wallet.assets[state.table.baseToken.id]

    return {
      ...acc,
      [assetId]: {
        ...liboroAsset,
        value,
        marketCap,
        ratio,
        reserve,
        baseTokenValue
      }
    }
  }

  return assetIds.reduce(intoPortfolio, {})
}

export const getCanBurn = (wallet: WalletType) => (amount: number, assetId: AssetHardType): boolean => {
  return wallet.reserves[assetId].baseTokenValue >= amount
} 

export const getWallet = (state: ContractStateType) => (wallet: ChainWalletType): WalletType => {
  const portfolio = getPortfolio(state)[getWalletId(wallet)] || {}

  const liboroWallet: WalletType = {
    ...wallet,
    portfolio
  }

  liboroWallet.ratioOfMarketCap = getWalletRatioOfMarketCap(state)(liboroWallet)
  liboroWallet.reserves = getReserves(state)(liboroWallet)
  liboroWallet.canBurn = getCanBurn(liboroWallet)

  return liboroWallet
}

/**
 * Get the next total of a contract's asset
 * 
 * @param baseAsset any virtual or pre-defined supply of the asset
 * @param assetValue the contract's balance of the asset
 * @param targetAsset the target amount to be added to the contract's balance of the asset
 */
export const getAssetTotal = (
  baseAsset: AssetType,
  assetValue: number,
  targetAsset?: AssetType
) => {
  return baseAsset.value + assetValue + (targetAsset ? targetAsset.value : 0)
}

export const getAssetPercentageOfMarketCap = (asset: AssetType, targetAsset: AssetType) => {
  const value = format(targetAsset.value / asset.marketCap)

  if (value > 1 || value < 0)
      throw new Error(`Percentage: ${value} must equal between 0 and 1.`)

  return value
}
