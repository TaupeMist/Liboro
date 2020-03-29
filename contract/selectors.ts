import {
  AssetType,
  WalletType,
  LiboroWalletType,
  LiboroAssetType
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

export const getLiboroAsset = (state) => (asset: AssetType): LiboroAssetType => {
  console.log('state.table.portfolio', state.table.portfolio, asset)
  return {
    ...state.table.asset[asset],
    id: asset,
    value: state.assets[asset],
    marketCap: state.table.asset[asset].marketCap || 0
  }
}
  

export const getBaseTokenMarketCap = (state): number => {
  return getLiboroAsset(state)(state.baseToken).marketCap
}