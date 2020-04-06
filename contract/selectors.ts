import {
  Contract,
  WalletType,
  AssetType,
  ComparisonType,
  ContractStateType,
  format
} from '.'

import * as chain from '../chain'

export const getContract = (state: chain.StateType, id: string): Contract => state.contract[id]

export const getTable = (state: chain.StateType, id: string): ContractStateType['table'] => getContract(state, id).table

export const getComparison = (state: ContractStateType) => (asset: AssetType, targetAsset: AssetType): ComparisonType => {
  const comparison: ComparisonType = {
    total: getAssetTotal(state.table.baseAsset, state.assets[asset.id], targetAsset),
    percentageOfMarketCap: getAssetPercentageOfMarketCap(asset, targetAsset)
  }

  return comparison
}

export const getAsset = (state: ContractStateType) => (asset: chain.AssetType, prevAsset?: AssetType): AssetType => {
  const predefinedAsset = {
    ...state.table.asset[asset],
    ...prevAsset
  }

  const newAsset = {
    ...state.table.asset[asset],
    id: asset,
    value: state.assets[asset],
  }

  const nextAsset = prevAsset
    ? predefinedAsset
    : newAsset

  nextAsset.compare = (targetAsset: AssetType) => getComparison(state)(nextAsset, targetAsset)

  return nextAsset
}

export const getWalletRatioOfMarketCap = (state: ContractStateType) => (wallet: WalletType) => {
  const walletBaseTokenValue = wallet.assets[state.table.baseToken.id]

  return walletBaseTokenValue
    ? walletBaseTokenValue / state.table.baseToken.marketCap
    : 0
}

export const getWallet = (state: ContractStateType) => (wallet: chain.WalletType): WalletType => {
  const nextWallet: WalletType = { ...wallet }

  if (state.table.baseToken)
    nextWallet.ratioOfMarketCap = getWalletRatioOfMarketCap(state)(wallet)

  return nextWallet
}

/**
 * Get the next total of a contract's asset
 *
 * @param baseAsset any virtual or pre-defined supply of the asset
 * @param assetValue the contract's balance of the asset
 * @param targetAsset the target amount to be added to the contract's balance of the asset
 */
export const getAssetTotal = (
  baseAsset: AssetType,
  assetValue: number,
  targetAsset?: AssetType
) => {
  return baseAsset.value + assetValue + (targetAsset ? targetAsset.value : 0)
}

export const getAssetPercentageOfMarketCap = (asset: AssetType, targetAsset: AssetType) => {
  const value = format(targetAsset.value / asset.marketCap)

  if (value > 1 || value < 0)
      throw new Error(`Percentage: ${value} must equal between 0 and 1.`)

  return value
}
