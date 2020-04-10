import {
  WalletType,
  WalletPortfolioType,
  TableType
} from '.'

import * as chain from '../chain'

import * as contract from '../contract'
import { WalletReserveType } from './types';

export const getPortfolio = (state: contract.ContractStateType): TableType['portfolio'] => {
  return state.table.portfolio
}

export const getPortfolioRatio = (wallet: WalletType, assetId: chain.AssetType) => {
  return wallet.portfolio[assetId] / 100
}

export const getReserve = (state: contract.ContractStateType) => (wallet: WalletType, assetId: chain.AssetType): number => {
  return contract.format(wallet.ratioOfMarketCap * state.table.asset[assetId].marketCap * getPortfolioRatio(wallet, assetId))
}

export const getReserves = (state: contract.ContractStateType) => (wallet: WalletType): WalletPortfolioType => {
  const assetIds = Object.keys(wallet.portfolio)

  const intoPortfolio = (acc: WalletPortfolioType, assetId: chain.AssetType): WalletPortfolioType => {
    const liboroAsset = contract.getAsset(state)(assetId)
    const value = wallet.portfolio[assetId]
    const ratio = getPortfolioRatio(wallet, assetId)
    const reserve = getReserve(state)(wallet, assetId)

    const walletReserve = {
      ...liboroAsset,
      value,
      ratio,
      reserve
    }

    if (state.table.baseToken) {
      (walletReserve as WalletReserveType).baseTokenValue = ratio * wallet.assets[state.table.baseToken.id]

      walletReserve.marketCap = assetId === state.table.baseToken.id
        ? state.table.baseToken.marketCap
        : state.table.asset[assetId].marketCap
    } else {
      walletReserve.marketCap = state.table.asset[assetId].marketCap
    }

    return {
      ...acc,
      [assetId]: walletReserve as WalletReserveType
    }
  }

  return assetIds.reduce(intoPortfolio, {})
}

export const getCanBurn = (wallet: WalletType) => (amount: number, assetId: chain.AssetHardType): boolean => {
  return wallet.reserves[assetId].baseTokenValue >= amount
}

export const getWallet = (state: contract.ContractStateType) => (wallet: chain.WalletType): WalletType => {
  const portfolio = getPortfolio(state)[wallet.id] || {}

  const fullWallet: WalletType = {
    ...contract.getWallet(state)(wallet),
    portfolio
  }

  fullWallet.reserves = getReserves(state)(fullWallet)

  if (state.table.baseToken) {
    fullWallet.ratioOfMarketCap = contract.getWalletRatioOfMarketCap(state)(fullWallet)
    fullWallet.canBurn = getCanBurn(fullWallet)
  }

  return fullWallet
}
