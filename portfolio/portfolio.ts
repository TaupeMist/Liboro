import {
  GetPorfolioType,
  AssetHardType,
  WalletType,
  PortfolioType
} from './types'

import {
  mint,
  burn
} from './commands'

import {
  calcPortfolio,
  calcGlobalPortfolio
} from './utils'

import {
  calcMintPayable,
  rebalanceMint
} from './minting'

import {
  calcBurnPayable,
  rebalanceBurn
} from './burning'

import {
  Contract,
  getWalletId,
  format
} from '../contract'

export class PortfolioContract extends Contract {
  public constructor(readonly id: string) { super(id) }

  mint = (amount: number, asset: AssetHardType, wallet: WalletType): this => {
    const liboroAsset = {
      ...this.getAsset(asset),
      value: amount
    }

    const payable = calcMintPayable(
      liboroAsset,
      this.baseAsset,
      this.baseToken
    )(this)

    console.log('calcMintPayable: result', payable)

    const increasePortfolioAsset = (portfolio: PortfolioType): PortfolioType => {
      if (!wallet.assets[this.baseToken.id] || wallet.assets[this.baseToken.id] === undefined)
        return portfolio

      console.log('asset', asset, wallet.assets)

      // When wallet portfolio cannot be increased
      if (this.getWallet(wallet).portfolio[asset] === 100)
        return portfolio

      const nextPortfolio = rebalanceMint(
        this.getAsset(asset),
        this.getWallet(wallet),
        payable,
        this.baseToken
      )

      console.log('result', nextPortfolio)

      return nextPortfolio
    }

    this.updateTable({
      asset,
      wallet
    })

    this.rebalance(increasePortfolioAsset, wallet)

    this.chain.execute(mint(liboroAsset, wallet, this.id, payable))    

    // TODO: move calc to utils
    this.table.asset[asset].marketCap = format(this.table.asset[asset].marketCap + amount)

    // TODO: move calc to utils
    this.baseToken = {
      ...this.baseToken,
      marketCap: this.baseToken.marketCap + payable.value
    }

    return this
  }

  burn = (amount: number, asset: AssetHardType, wallet: WalletType): this => {
    const liboroAsset = {
      ...this.getAsset(asset),
      value: amount
    }

    const payable = calcBurnPayable(
      liboroAsset,
      this.assets[liboroAsset.id],
      this.baseAsset,
      this.baseToken
    )(this)

    console.log('burnPayable', payable)

    const descreasePortfolioAsset = (portfolio: PortfolioType): PortfolioType => {
      if (!wallet.assets[this.baseToken.id] || wallet.assets[this.baseToken.id] === undefined)
        return portfolio

      console.log('descreasePortfolioAsset', this.getWallet(wallet))

      // When wallet portfolio cannot be decreased
      if (this.getWallet(wallet).portfolio[this.baseToken.id] === 0)
        return portfolio

      console.log('asset', asset, wallet.assets)

      const nextPortfolio = rebalanceBurn(
        portfolio,
        this.getAsset(asset),
        this.getWallet(wallet),
        payable,
        this.baseToken
      )

      console.log('result', nextPortfolio)

      // TODO: calc and set wallet portfolio
      // should also be applied when burning (in reverse)
      // using the payable amount, calculate the portfolio increase portfolio of that asset
      // add equal/flat decrease of other assets

      return nextPortfolio
    }

    this.rebalance(descreasePortfolioAsset, wallet)

    this.chain.execute(burn(liboroAsset, wallet, this.id, payable))

    // TODO: calc and set wallet portfolio
    this.table.portfolio.global = calcGlobalPortfolio(
      this.getWallet(wallet),
      this.baseToken,
      this.table.portfolio
    )

    // TODO: move calc to utils
    this.table.asset[asset].marketCap = format(this.table.asset[asset].marketCap - payable.value)

    // TODO: move calc to utils
    this.baseToken = {
      ...this.baseToken,
      marketCap: this.baseToken.marketCap - amount
    }

    return this
  }

  rebalance = (getPortfolio: GetPorfolioType, wallet: WalletType): this => {
    this.table.portfolio[getWalletId(wallet)] = calcPortfolio(getPortfolio, this.getWallet(wallet))

    this.table.portfolio.global = calcGlobalPortfolio(
      this.getWallet(wallet),
      this.baseToken,
      this.table.portfolio
    )

    return this
  }
}