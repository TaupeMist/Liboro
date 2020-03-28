import {
  AssetType,
  WalletType,
  LiboroAssetType,
  LiboroWalletType,
  ContractType,
  PortfolioType,
  GetPorfolioType
} from './liboro.types'

import {
  Contract
} from './contract'

export const format = (num: number):number => +num.toFixed(4);

export const asDecimal = (num: number):number => format(num / 100)

export const hasFunds = (amount: number, assetBuying: AssetType, assetSelling: AssetType, wallet: WalletType) => (contract: ContractType): boolean => {
  if (contract.assets[assetBuying] === 0) return true

  return amount <= wallet.assets[assetSelling] && amount <= contract.assets[assetBuying]
}

export const getValue = (asset: AssetType) => (contract: Contract): number => {
  return format(contract.table.portfolio.global[asset] / 100)
}

export const calcMintPayable = (asset: LiboroAssetType) => (contract: Contract): LiboroAssetType => {
  const total = contract.table.baseSupply + contract.assets[asset.id] + asset.value

  const ratio = format(asset.value / total * getValue(asset.id)(contract))

  console.log('calcMintPayable', total, ratio, (contract.assets[contract.table.baseToken] || contract.table.baseSupply))

  return {
    ...asset,
    value: format(ratio * (contract.assets[contract.table.baseToken] || contract.table.baseSupply))
  }
}

export const calcBurnPayable = (asset: LiboroAssetType): LiboroAssetType => {
  // TODO: Add logic to calculate the asset to be paid due to the burn 

  return {
    ...asset,
    value: 50
  }
}

export const getWalletId = (wallet: WalletType): string => wallet.id.toLowerCase()

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

export const calcPortfolio = (getPortfolio: GetPorfolioType, wallet: WalletType) => (contract: Contract): PortfolioType => {
  const portfolio = getPortfolio(contract.table.portfolio[getWalletId(wallet)])

  if (!isPortfolioValid(portfolio))
    throw new Error(`Portfolio total/sum expected to equal 100. ${JSON.stringify(portfolio)}`)

  return portfolio 
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

  console.log('calcGlobalPortfolio', currWalletPortfolio)

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
    .reduce(intoPortfolio, {} as PortfolioType)
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

export const rebalanceMint = (
  portfolio: PortfolioType,
  asset: AssetType,
  wallet: WalletType,
  payable: LiboroAssetType,
  baseToken: LiboroAssetType
): PortfolioType => {
  const ratio = format(payable.value / (payable.value + wallet.assets[baseToken.id]))

  console.log('ratio', ratio)

  const increase = format(wallet.assets[baseToken.id] * ratio)

  console.log('increase', increase)

  const portfolioMinusAsset = getPortfolioMinusAsset(portfolio, asset)

  console.log('portfolioMinusAsset', portfolioMinusAsset)

  const intoPortfolio = (acc: PortfolioType, assetId: string): PortfolioType => {
    const value = assetId === asset
      ? format(portfolio[assetId] + increase)
      : format(portfolio[assetId] - asDecimal(portfolioMinusAsset[assetId]) * increase)

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
