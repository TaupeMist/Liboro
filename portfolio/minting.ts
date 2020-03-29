import {
  LiboroWalletType,
  LiboroAssetType,
  PortfolioType
} from './types'

import {
  getPortfolioMinusAsset
} from './utils'

import {
  Contract,
  format,
  getValue,
  asDecimal
} from '../contract'

/**
 * Get the next total of a contract's asset
 * 
 * @param baseAsset any virtual or pre-defined supply of the asset
 * @param assetValue the contract's balance of the asset
 * @param deposit the deposit amount to be added to the contract's balance of the asset
 */
export const getContractAssetTotal = (
  baseAsset: LiboroAssetType,
  assetValue: number,
  deposit: LiboroAssetType
) => {
  return baseAsset.value + assetValue + deposit.value
}

/**
 * Get the decimal ratio increase of the deposit towards the contract's asset balance
 * 
 * @param deposit the deposit amount to be added to the contract's balance
 * @param total 
 * @param contract 
 */
export const getDepositRatio = (
  deposit: LiboroAssetType,
  total: number,
  contract: Contract
) => {
  return format(deposit.value / total * getValue(deposit.id)(contract))
}

/**
 * Calculate the amount of token to be minted
 * 
 * @param deposit the token deposit required to trigger the minting
 * @param contractAsset the contract's balance of the asset being minted
 * @param baseAsset the base supply of the base token
 * @param baseToken the primary token of this contract
 */

export const calcMintPayable = (
  deposit: LiboroAssetType,
  contractAsset: number,
  baseAsset: LiboroAssetType,
  baseToken: LiboroAssetType
) => (contract: Contract): LiboroAssetType => {
  console.log('calcMintPayable', deposit, contractAsset, baseAsset, baseToken)

  const contractAssetTotal = getContractAssetTotal(baseAsset, contractAsset, deposit)

  const depositRatio = getDepositRatio(deposit, contractAssetTotal, contract)

  console.log('calcMintPayable: contractAssetTotal', contractAssetTotal)
  console.log('calcMintPayable: depositRatio', depositRatio)

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
  minting: LiboroAssetType,
  wallet: LiboroWalletType,
  payable: LiboroAssetType,
  baseToken: LiboroAssetType
): PortfolioType => {
  const ratio = format(payable.value / (payable.value + wallet.assets[baseToken.id]))

  console.log('ratio', ratio)

  const increase = format(wallet.assets[baseToken.id] * ratio)

  console.log('increase', increase)

  const portfolioMinusAsset = getPortfolioMinusAsset(wallet.portfolio, minting.id)

  console.log('portfolioMinusAsset', portfolioMinusAsset)

  const intoPortfolio = (acc: PortfolioType, assetId: string): PortfolioType => {
    const value = assetId === minting.id
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
