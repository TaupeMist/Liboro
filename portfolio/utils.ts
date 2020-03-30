import {
  GetPorfolioType
} from './types'

import {
  AssetType as ChainAssetType,
  WalletType as ChainWalletType,
} from '../chain'

import {
  format,
  WalletType,
  AssetType,
  PortfolioType,
  TableType
} from '../contract'

export const getPortfolioTotal = (portfolio: PortfolioType, excludedAssets: ChainAssetType[] = []): number => {
  const excludeAssets = (asset: ChainAssetType): boolean => excludedAssets.indexOf(asset) === -1

  const assetIds = Object
    .keys(portfolio)
    .filter(excludeAssets)

  const intoTotal = (acc: number, assetId: string): number => acc + portfolio[assetId]

  return assetIds.reduce(intoTotal, 0)
}

export const isPortfolioValid = (portfolio: PortfolioType): boolean => {
  return getPortfolioTotal(portfolio) === 100
}

export const calcPortfolio = (getPortfolio: GetPorfolioType, wallet: WalletType): PortfolioType => {
  const nextPortfolio = getPortfolio(wallet.portfolio)

  if (!isPortfolioValid(nextPortfolio))
    throw new Error(`Portfolio total/sum expected to equal 100. ${JSON.stringify(nextPortfolio)}`)

  return nextPortfolio 
}

export const flatten = (portfolio: PortfolioType): PortfolioType => {
  const assetIds = Object.keys(portfolio)

  const value = format(100 / assetIds.length)

  const intoPortfolio = (acc: PortfolioType, assetId: string): PortfolioType => ({
    ...acc,
    [assetId]: value
  })

  return assetIds.reduce(intoPortfolio, {} as PortfolioType)
}

export const balance = (portfolio: PortfolioType): PortfolioType => {
  const assetIds = Object.keys(portfolio)

  const intoPortfolio = (acc: PortfolioType, assetId: string): PortfolioType => {
    const total = getPortfolioTotal(portfolio, [assetId])
    const value = total === 0 ? 100 : format(portfolio[assetId] / total)

    return {
      ...acc,
      [assetId]: value
    }
  }

  return assetIds.reduce(intoPortfolio, {} as PortfolioType)
}

export const getPortfolioMinusAsset = (portfolio: PortfolioType, asset: ChainAssetType) => {
  const minusAsset = (id: string): boolean => id !== asset

  const assetIds = Object
    .keys(portfolio)
    .filter(minusAsset)

  const intoPortfolio = (acc: PortfolioType, assetId: string): PortfolioType => ({
    ...acc,
    [assetId]: portfolio[assetId]
  })

  const portfolioToBalance = assetIds.reduce(intoPortfolio, {} as PortfolioType)

  if (isPortfolioValid(portfolioToBalance))
    throw new Error(`Portfolio is yet to be balanced/flattened therefor, should be invalid. ${JSON.stringify(portfolioToBalance)}`)

  const total = getPortfolioTotal(portfolioToBalance)
    
  return total === 0 ? flatten(portfolioToBalance) : balance(portfolioToBalance)
}

export const calcRebalanceWeight = (
  wallet: ChainWalletType,
  baseToken: AssetType,
  portfolio: TableType['portfolio']
): number => {
  if (baseToken.marketCap === 0 || Object.keys(portfolio).length === 1) return 1

  return format((wallet.assets[baseToken.id] || 0) / baseToken.marketCap)
}

export const calcGlobalPortfolio = (
  wallet: WalletType,
  baseToken: AssetType,
  portfolio: TableType['portfolio'],
  getPortfolio?: GetPorfolioType
): PortfolioType => {
  const currWalletPortfolio = getPortfolio
    ? calcPortfolio(getPortfolio, wallet)
    : wallet.portfolio

  const weight = calcRebalanceWeight(wallet, baseToken, portfolio)
  const weightNeg = 1 - weight

  const intoPortfolio = (nextPortfolio: PortfolioType, assetId: string): PortfolioType => {
    const increase = currWalletPortfolio[assetId] * weight
    const decrease = portfolio.global[assetId] * weightNeg
    const value = format(increase + decrease)

    return {
      ...nextPortfolio,
      [assetId]: value
    }
  }

  return Object
    .keys(portfolio.global)
    .reduce(intoPortfolio, {} as PortfolioType)
}
