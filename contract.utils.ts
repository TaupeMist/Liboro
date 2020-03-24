import {
  AssetType,
  WalletType,
  ContractType,
  PortfolioType,
  GetPorfolioType
} from './chain.types'

import {
  Contract
} from './contract'

export const format = (num: number):number => +num.toFixed(4);

export const hasFunds = (amount: number, assetBuying: AssetType, assetSelling: AssetType, wallet: WalletType) => (contract: ContractType): boolean => {
  if (contract.assets[assetBuying] === 0) return true

  return amount <= wallet.assets[assetSelling] && amount <= contract.assets[assetBuying]
}

export const getValue = (asset: AssetType) => (contract: Contract): number => {
  return format(contract.table.portfolio.global[asset] / 100)
}

export const calcMintPayable = (amount: number, assetSelling: AssetType) => (contract: Contract): number => {
  const total = contract.table.baseSupply + contract.assets[assetSelling] + amount

  const ratio = format(amount / total * getValue(assetSelling)(contract))

  return format(ratio * (contract.assets[contract.table.baseToken] || contract.table.baseSupply))
}

export const calcLiquidatePayable = (amount: number, assetBuying: AssetType) => (contract: Contract): number => {
  const total = contract.assets[contract.table.baseToken] + amount

  const ratio = format(amount / total * getValue(assetBuying)(contract))

  return format(ratio * contract.assets[assetBuying])
}

export const getWalletId = (wallet: WalletType): string => wallet.id.toLowerCase()

export const calcPortfolio = (getPortfolio: GetPorfolioType, wallet: WalletType) => (contract: Contract): PortfolioType => {
  return getPortfolio(contract.table.portfolio[getWalletId(wallet)])
}

export const calcRebalanceWeight = (wallet: WalletType) => (contract: Contract): number => {
  const { asset, baseToken, portfolio } = contract.table

  if (asset[baseToken].marketCap === 0 || Object.keys(portfolio).length === 1) return 1

  return format((wallet.assets[baseToken] || 0) / asset[baseToken].marketCap)
}

export const calcGlobalPortfolio = (wallet: WalletType, getPortfolio?: GetPorfolioType) => (contract: Contract): PortfolioType => {
  const currWalletPortfolio = getPortfolio
    ? calcPortfolio(getPortfolio, wallet)(contract)
    : contract.table.portfolio[getWalletId(wallet)]

  const weight = calcRebalanceWeight(wallet)(contract)
  const weightNeg = 1 - weight

  const intoPortfolio = (portfolio: PortfolioType, assetId: string): PortfolioType => {
    const increase = currWalletPortfolio[assetId] * weight
    const decrease = contract.table.portfolio.global[assetId] * weightNeg
    const value = format(increase + decrease)

    return {
      ...portfolio,
      [assetId]: value
    }
  }

  return Object
    .keys(contract.table.portfolio.global)
    .reduce(intoPortfolio, {})
}

export const flatten = (portfolio: PortfolioType): PortfolioType => {
  const assetIds = Object.keys(portfolio)

  const value = format(100 / assetIds.length)

  const intoPortfolio = (acc: PortfolioType, curr: string): PortfolioType => ({
    ...acc,
    [curr]: value
  })

  return assetIds.reduce(intoPortfolio, {})
}
