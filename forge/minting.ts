import {
  WalletType
} from '.'

import {
  format,
  asDecimal,
  AssetType
} from '../contract'

import {
  PortfolioType,
  getPortfolioMinusAsset
} from '../portfolio'

/**
 * Get the decimal ratio increase of the deposit towards the contract's asset balance
 *
 * @param deposit the deposit amount to be added to the contract's balance
 * @param total the new total of minting token
 * @param globalPortfolio the global portfolio of this contract
 */
export const getDepositRatio = (
  deposit: AssetType,
  total: number,
  globalPortfolio: PortfolioType
) => {
  const ratio = format(globalPortfolio[deposit.id] / 100)

  return format(deposit.value / total * ratio)
}

/**
 * Calculate the amount of token to be minted
 *
 * @param deposit the token deposit required to trigger the minting
 * @param contractAsset the contract's balance of the asset being minted
 * @param baseAsset the base supply of the base token
 * @param baseToken the primary token of this contract
 * @param globalPortfolio the global portfolio of this contract
 */

export const calcMintPayable = (
  deposit: AssetType,
  baseAsset: AssetType,
  baseToken: AssetType,
  globalPortfolio: PortfolioType
): AssetType => {
  const contractAssetTotal = baseAsset.compare(deposit).total

  const depositRatio = getDepositRatio(deposit, contractAssetTotal, globalPortfolio)

  return {
    ...deposit,
    value: format(depositRatio * (baseToken.value || baseAsset.value))
  }
}

/**
 *
 * @param minting the asset to be minted
 * @param wallet
 * @param payable
 * @param baseToken
 */
export const rebalanceMint = (
  minting: AssetType,
  wallet: WalletType,
  payable: AssetType,
  baseToken: AssetType
): PortfolioType => {
  const ratio = format(payable.value / (payable.value + wallet.assets[baseToken.id]))

  const increase = format(wallet.assets[baseToken.id] * ratio)

  const portfolioMinusAsset = getPortfolioMinusAsset(wallet.portfolio, minting.id)

  const intoPortfolio = (acc: PortfolioType, assetId: string): PortfolioType => {
    const value = assetId === minting.id
      ? format(wallet.portfolio[assetId] + increase)
      : format(wallet.portfolio[assetId] - asDecimal(portfolioMinusAsset[assetId]) * increase)

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
