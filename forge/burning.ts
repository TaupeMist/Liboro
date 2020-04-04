import {
  PortfolioType
} from '../chain'

import {
  getPortfolioMinusAsset,
  WalletType
} from '../portfolio'

import {
  format,
  asDecimal,
  AssetType
} from '../contract'

export const calcBurnPayable = (
  withdrawal: AssetType,
  contractAsset: number,
  baseToken: AssetType,
  burner: WalletType
): AssetType => {
  const { percentageOfMarketCap } = baseToken.compare(withdrawal)

  return {
    ...withdrawal,
    value: format(percentageOfMarketCap * contractAsset * burner.reserves[withdrawal.id].ratio)
  }
}

export const rebalanceBurn = (
  portfolio: PortfolioType,
  contractPortfolio: PortfolioType,
  asset: AssetType,
  wallet: WalletType
): PortfolioType => {
  const decrease = format(contractPortfolio[asset.id] * wallet.ratioOfMarketCap)

  const portfolioMinusAsset = getPortfolioMinusAsset(portfolio, asset.id)

  if (portfolioMinusAsset[asset.id] !== undefined)
    throw new Error(`Asset must be removed from portfolio. Asset: ${asset}. Portfolio: ${JSON.stringify(portfolioMinusAsset)}`)

  const intoPortfolio = (acc: PortfolioType, assetId: string): PortfolioType => {
    const value = assetId === asset.id
      ? format(portfolio[assetId] - decrease)
      : format(portfolio[assetId] + asDecimal(portfolioMinusAsset[assetId]) * decrease)

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
