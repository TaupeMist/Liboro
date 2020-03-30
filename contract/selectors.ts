import {
  AssetType,
  WalletType,
  LiboroWalletType,
  LiboroAssetType,
  ComparisonType
} from './types'

import {
  getWalletId,
  format
} from './utils'

export const getWallet = (state): WalletType => {
  return state.wallet
}

export const getPortfolio = (state): WalletType => {
  return state.table.portfolio
}

export const getLiboroWallet = (state) => (wallet: WalletType): LiboroWalletType => {
  const portfolio = getPortfolio(state)

  return {
    ...wallet,
    portfolio: portfolio[getWalletId(wallet)] || {}
  }
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

export const getPercentageOfMarketCap = (asset: LiboroAssetType, targetAsset: LiboroAssetType) => {
  const value = format(targetAsset.value / asset.marketCap)

  if (value > 1 || value < 0)
      throw new Error(`Percentage: ${value} must equal between 0 and 1.`)

  return value
}

export const getComparison = (state) => (asset: LiboroAssetType, targetAsset: LiboroAssetType): ComparisonType => {
  const comparison: ComparisonType = {
    total: getAssetTotal(state.table.baseAsset, state.assets[asset.id], targetAsset),
    percentageOfMarketCap: getPercentageOfMarketCap(asset, targetAsset)
  }

  return comparison
}

export const getLiboroAsset = (state) => (asset: AssetType, prevAsset?: LiboroAssetType): LiboroAssetType => {
  console.log('state.table.portfolio', state.table.portfolio, asset)

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