import {
  LiboroWalletType,
  LiboroAssetType,
  ComparisonType,
  LiboroWalletPortfolioType
} from './types'

import {
  getWalletId,
  format
} from './utils'

import {
  AssetType,
  WalletType,
  AssetHardType
} from '../chain'

export const getWallet = (state): WalletType => {
  return state.wallet
}

export const getPortfolio = (state): LiboroWalletType => {
  return state.table.portfolio
}

export const getWalletRatioOfMarketCap = (state) => (wallet: LiboroWalletType) => {
  const walletBaseTokenValue = wallet.assets[state.table.baseToken.id]

  return walletBaseTokenValue
    ? walletBaseTokenValue / state.table.baseToken.marketCap
    : 0
}

export const getPortfolioRatio = (wallet: LiboroWalletType, assetId: AssetType) => {
  return wallet.portfolio[assetId] / 100
}

export const getReserve = (state) => (wallet: LiboroWalletType, assetId: AssetType): number => {
  return format(wallet.ratioOfMarketCap * state.table.asset[assetId].marketCap * getPortfolioRatio(wallet, assetId))
}

export const getReserves = (state) => (wallet: LiboroWalletType): LiboroWalletPortfolioType => {
  const assetIds = Object.keys(wallet.portfolio)

  const intoPortfolio = (acc: LiboroWalletPortfolioType, assetId: string): LiboroWalletPortfolioType => {
    const liboroAsset = getLiboroAsset(state)(assetId)
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

export const getCanBurn = (wallet: LiboroWalletType) => (amount: number, assetId: AssetHardType): boolean => {
  return wallet.reserves[assetId].baseTokenValue >= amount
} 

export const getLiboroWallet = (state) => (wallet: WalletType): LiboroWalletType => {
  const portfolio = getPortfolio(state)[getWalletId(wallet)] || {}

  const liboroWallet: LiboroWalletType = {
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
  baseAsset: LiboroAssetType,
  assetValue: number,
  targetAsset?: LiboroAssetType
) => {
  return baseAsset.value + assetValue + (targetAsset ? targetAsset.value : 0)
}

export const getAssetPercentageOfMarketCap = (asset: LiboroAssetType, targetAsset: LiboroAssetType) => {
  const value = format(targetAsset.value / asset.marketCap)

  if (value > 1 || value < 0)
      throw new Error(`Percentage: ${value} must equal between 0 and 1.`)

  return value
}

export const getComparison = (state) => (asset: LiboroAssetType, targetAsset: LiboroAssetType): ComparisonType => {
  const comparison: ComparisonType = {
    total: getAssetTotal(state.table.baseAsset, state.assets[asset.id], targetAsset),
    percentageOfMarketCap: getAssetPercentageOfMarketCap(asset, targetAsset)
  }

  return comparison
}

export const getLiboroAsset = (state) => (asset: AssetType, prevAsset?: LiboroAssetType): LiboroAssetType => {
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

  nextAsset.compare = (targetAsset: LiboroAssetType) => getComparison(state)(nextAsset, targetAsset)

  return nextAsset
}
  

export const getBaseTokenMarketCap = (state): number => {
  return getLiboroAsset(state)(state.baseToken).marketCap
}