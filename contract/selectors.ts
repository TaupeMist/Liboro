import {
  AssetType,
  WalletType,
  LiboroWalletType,
  LiboroAssetType,
  ComparisonType
} from './types'

import {
  getWalletId
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

export const getLiboroAsset = (state) => (asset: AssetType, prevAsset?: LiboroAssetType): LiboroAssetType => {
  console.log('state.table.portfolio', state.table.portfolio, asset)

  const nextAsset = prevAsset
    ? {
      ...state.table.asset[asset],
      ...prevAsset,
    }
    : {
      ...state.table.asset[asset],
      id: asset,
      value: state.assets[asset],
    }

  console.log('state.baseAsset', state)

  nextAsset.compare = (targetAsset: LiboroAssetType): ComparisonType => {
    return {
      total: getAssetTotal(state.table.baseAsset, state.assets[asset], targetAsset)
    }
  }

  return nextAsset
}
  

export const getBaseTokenMarketCap = (state): number => {
  return getLiboroAsset(state)(state.baseToken).marketCap
}