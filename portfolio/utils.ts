import {
  GetPorfolioType,
  AssetType,
  WalletType,
  LiboroAssetType,
  PortfolioType,
  TableType
} from './types'

import {
  format,
  LiboroWalletType
} from '../contract'

export const getPortfolioTotal = (portfolio: PortfolioType, excludedAssets: AssetType[] = []): number => {
  const excludeAssets = (asset: AssetType): boolean => excludedAssets.indexOf(asset) === -1

  const assetIds = Object
    .keys(portfolio)
    .filter(excludeAssets)

  const intoTotal = (acc: number, assetId: string): number => acc + portfolio[assetId]

  return assetIds.reduce(intoTotal, 0)
}

export const isPortfolioValid = (portfolio: PortfolioType): boolean => {
  return getPortfolioTotal(portfolio) === 100
}

export const calcPortfolio = (getPortfolio: GetPorfolioType, wallet: LiboroWalletType): PortfolioType => {
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

  console.log('balance', portfolio)

  const intoPortfolio = (acc: PortfolioType, assetId: string): PortfolioType => {
    const total = getPortfolioTotal(portfolio, [assetId])
    const value = total === 0 ? 100 : format(portfolio[assetId] / total)
    console.log('balance.intoPortfolio', assetId, portfolio[assetId], value)

    return {
      ...acc,
      [assetId]: value
    }
  }

  return assetIds.reduce(intoPortfolio, {} as PortfolioType)
}

export const getPortfolioMinusAsset = (portfolio: PortfolioType, asset: AssetType) => {
  const minusAsset = (id: string): boolean => id !== asset

  const assetIds = Object
    .keys(portfolio)
    .filter(minusAsset)

  const intoPortfolio = (acc: PortfolioType, assetId: string): PortfolioType => ({
    ...acc,
    [assetId]: portfolio[assetId]
  })

  console.log('portfolio', portfolio)

  const portfolioToBalance = assetIds.reduce(intoPortfolio, {} as PortfolioType)

  if (isPortfolioValid(portfolioToBalance))
    throw new Error(`Portfolio is yet to be balanced/flattened therefor, should be invalid. ${JSON.stringify(portfolioToBalance)}`)

  console.log('portfolioMinusAsset: unbalanced', portfolioToBalance)

  const total = getPortfolioTotal(portfolioToBalance)

  console.log('total', total)
    
  return total === 0 ? flatten(portfolioToBalance) : balance(portfolioToBalance)
}

export const calcRebalanceWeight = (
  wallet: WalletType,
  baseToken: LiboroAssetType,
  portfolio: TableType['portfolio']
): number => {
  if (baseToken.marketCap === 0 || Object.keys(portfolio).length === 1) return 1

  return format((wallet.assets[baseToken.id] || 0) / baseToken.marketCap)
}

export const calcGlobalPortfolio = (
  wallet: LiboroWalletType,
  baseToken: LiboroAssetType,
  portfolio: TableType['portfolio'],
  getPortfolio?: GetPorfolioType
): PortfolioType => {
  const currWalletPortfolio = getPortfolio
    ? calcPortfolio(getPortfolio, wallet)
    : wallet.portfolio

  console.log('calcGlobalPortfolio', currWalletPortfolio)

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
