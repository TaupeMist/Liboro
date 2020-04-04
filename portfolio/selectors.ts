import {
  WalletType,
  WalletPortfolioType,
  TableType
} from '.'

import {
  getWalletId,
  format,
  ContractStateType,
  getAsset,
  getWalletRatioOfMarketCap
} from '../contract'

import * as chain from '../chain'

export const getPortfolio = (state: ContractStateType): TableType['portfolio'] => {
  return state.table.portfolio
}

export const getPortfolioRatio = (wallet: WalletType, assetId: chain.AssetType) => {
  return wallet.portfolio[assetId] / 100
}

export const getReserve = (state: ContractStateType) => (wallet: WalletType, assetId: chain.AssetType): number => {
  return format(wallet.ratioOfMarketCap * state.table.asset[assetId].marketCap * getPortfolioRatio(wallet, assetId))
}

export const getReserves = (state: ContractStateType) => (wallet: WalletType): WalletPortfolioType => {
  const assetIds = Object.keys(wallet.portfolio)

  const intoPortfolio = (acc: WalletPortfolioType, assetId: chain.AssetType): WalletPortfolioType => {
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

export const getCanBurn = (wallet: WalletType) => (amount: number, assetId: chain.AssetHardType): boolean => {
  return wallet.reserves[assetId].baseTokenValue >= amount
}

export const getWallet = (state: ContractStateType) => (wallet: chain.WalletType): WalletType => {
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
