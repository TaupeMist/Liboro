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
  asDecimal,
  Contract
} from '../contract'

export const calcBurnPayable = (
  withdrawal: LiboroAssetType,
  contractAsset: number,
  baseAsset: LiboroAssetType,
  baseToken: LiboroAssetType
) => (contract: Contract): LiboroAssetType => {
  console.log('calcBurnPayable', withdrawal)
  // TODO: Add logic to calculate the asset to be paid due to the burn

  return {
    ...withdrawal,
    value: 50
  } 
}

export const rebalanceBurn = (
  portfolio: PortfolioType,
  asset: LiboroAssetType,
  wallet: LiboroWalletType,
  payable: LiboroAssetType,
  baseToken: LiboroAssetType
): PortfolioType => {
  console.log('Liboro Asset', asset)
  console.log('Liboro Wallet', wallet)
  console.log('Base Token', baseToken)

  const ratio = format(payable.value / baseToken.marketCap)

  if (ratio > 1 || ratio < 0)
    throw new Error(`Ratio must equal between 0 and 1. Ratio: ${ratio}`)

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
