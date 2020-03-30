import {
  LiboroWalletType,
  LiboroAssetType,
  PortfolioType
} from './types'

import {
  getPortfolioMinusAsset
} from './utils'

import {
  format,
  asDecimal
} from '../contract'

export const calcBurnPayable = (
  withdrawal: LiboroAssetType,
  contractAsset: number,
  baseToken: LiboroAssetType
): LiboroAssetType => {
  const { percentageOfMarketCap } = baseToken.compare(withdrawal)

  return {
    ...withdrawal,
    value: format(percentageOfMarketCap * contractAsset)
  } 
}

export const rebalanceBurn = (
  portfolio: PortfolioType,
  asset: LiboroAssetType,
  wallet: LiboroWalletType,
  payable: LiboroAssetType,
  baseToken: LiboroAssetType
): PortfolioType => {
  console.log('rebalanceBurn', portfolio, asset, wallet, payable, baseToken)
  const ratio = asset.compare(payable).percentageOfMarketCap

  console.log('ratio', ratio)

  const decrease = format(wallet.assets[baseToken.id] * ratio)

  console.log('decrease', decrease)

  const portfolioMinusAsset = getPortfolioMinusAsset(portfolio, asset.id)

  console.log('portfolioMinusAsset', portfolioMinusAsset)

  if (portfolioMinusAsset[asset.id] !== undefined)
    throw new Error(`Asset must be removed from portfolio. Asset: ${asset}. Portfolio: ${JSON.stringify(portfolioMinusAsset)}`)

  const intoPortfolio = (acc: PortfolioType, assetId: string): PortfolioType => {
    const value = assetId === asset.id
      ? format(portfolio[assetId] - decrease)
      : format(portfolio[assetId] + asDecimal(portfolioMinusAsset[assetId]) * decrease)

    console.log('intoPortfolio', assetId, portfolio[assetId], value)

    if (value > 100 || value < 0)
      throw new Error(`Value must be between 0 and 100. Value: ${value}`)

    return {
      ...acc,
      [assetId]: value
    }
  }

  return Object
    .keys(portfolio)
    .reduce(intoPortfolio, {} as PortfolioType)
}
