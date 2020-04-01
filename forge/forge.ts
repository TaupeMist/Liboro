import {
  mint,
  burn
} from './commands'

import {
  calcMintPayable,
  rebalanceMint
} from './minting'

import {
  calcBurnPayable,
  rebalanceBurn
} from './burning'

import {
  AssetHardType,
  WalletType,
  PortfolioType
} from '../chain'

import {
  format
} from '../contract'

import {
  PortfolioContract,
  calcGlobalPortfolio
} from '../portfolio'

export class ForgeContract extends PortfolioContract {
  public constructor(readonly id: string) { super(id) }

  mint = (amount: number, asset: AssetHardType, wallet: WalletType): this => {
    const deposit = {
      ...this.getAsset(asset),
      value: amount
    }

    const payable = calcMintPayable(
      deposit,
      this.baseAsset,
      this.baseToken,
      this.table.portfolio.global
    )

    const increasePortfolioAsset = (portfolio: PortfolioType): PortfolioType => {
      if (!wallet.assets[this.baseToken.id] || wallet.assets[this.baseToken.id] === undefined)
        return portfolio

      // When wallet portfolio cannot be increased
      if (this.getWallet(wallet).portfolio[asset] === 100)
        return portfolio

      const nextPortfolio = rebalanceMint(
        this.getAsset(asset),
        this.getWallet(wallet),
        payable,
        this.baseToken
      )

      return nextPortfolio
    }

    this.updateTable({
      asset,
      wallet
    })

    this.rebalance(increasePortfolioAsset, wallet)

    this.chain.execute(mint(deposit, wallet, this.id, payable))    

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
    const burner = this.getWallet(wallet)

    if (!burner.canBurn(amount, asset))
      throw new Error(`User ${wallet.id} cannot burn ${amount} of ${this.baseToken.id} to recieve ${asset}`)

    const withdrawal = {
      ...this.getAsset(asset),
      value: amount
    }

    const payable = calcBurnPayable(
      withdrawal,
      this.assets[withdrawal.id],
      this.baseToken,
      burner
    )

    const descreasePortfolioAsset = (portfolio: PortfolioType): PortfolioType => {
      const burner = this.getWallet(wallet)

      if (!wallet.assets[this.baseToken.id] || wallet.assets[this.baseToken.id] === undefined)
        return portfolio

      // When wallet portfolio cannot be decreased
      if (burner.portfolio[withdrawal.id] === 0)
        return portfolio

      const nextPortfolio = rebalanceBurn(
        portfolio,
        this.table.portfolio.global,
        this.getAsset(asset),
        burner
      )

      return nextPortfolio
    }

    this.rebalance(descreasePortfolioAsset, wallet)

    this.chain.execute(burn(withdrawal, wallet, this.id, payable))

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
}
