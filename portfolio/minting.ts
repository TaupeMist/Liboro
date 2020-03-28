import {
  LiboroWalletType
} from './types'

import {
  getPortfolioMinusAsset
} from './utils'

import {
  Contract,
  format,
  getValue,
  asDecimal,
  LiboroAssetType,
  PortfolioType
} from '../contract'

export const calcMintPayable = (asset: LiboroAssetType) => (contract: Contract): LiboroAssetType => {
  const total = contract.table.baseSupply + contract.assets[asset.id] + asset.value

  const ratio = format(asset.value / total * getValue(asset.id)(contract))

  console.log('calcMintPayable', total, ratio, (contract.assets[contract.table.baseToken] || contract.table.baseSupply))

  return {
    ...asset,
    value: format(ratio * (contract.assets[contract.table.baseToken] || contract.table.baseSupply))
  }
}

export const rebalanceMint = (
  asset: LiboroAssetType,
  wallet: LiboroWalletType,
  payable: LiboroAssetType,
  baseToken: LiboroAssetType
): PortfolioType => {
  const ratio = format(payable.value / (payable.value + wallet.assets[baseToken.id]))

  console.log('ratio', ratio)

  const increase = format(wallet.assets[baseToken.id] * ratio)

  console.log('increase', increase)

  const portfolioMinusAsset = getPortfolioMinusAsset(wallet.portfolio, asset.id)

  console.log('portfolioMinusAsset', portfolioMinusAsset)

  const intoPortfolio = (acc: PortfolioType, assetId: string): PortfolioType => {
    const value = assetId === asset.id
      ? format(wallet.portfolio[assetId] + increase)
      : format(wallet.portfolio[assetId] - asDecimal(portfolioMinusAsset[assetId]) * increase)

    console.log('intoPortfolio', assetId, wallet.portfolio[assetId], value)

    if (value > 100 || value < 0)
      throw new Error(`Value must be between 0 and 100. Value: ${value}`)

    return {
      ...acc,
      [assetId]: value
    }
  }

  return Object
    .keys(wallet.portfolio)
    .reduce(intoPortfolio, {} as PortfolioType)
}
