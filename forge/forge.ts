import {
  ConfigureParams,
  WalletType,
  mint,
  melt,
  calcMintPayable,
  rebalanceMint,
  calcMeltPayable,
  rebalanceMelt,
  getWallet
} from '.'

import * as chain from '../chain'

import {
  format,
  getWalletId
} from '../contract'

import {
  PortfolioContract,
  calcGlobalPortfolio,
  PortfolioType
} from '../portfolio'

export class ForgeContract extends PortfolioContract {
  public constructor(readonly id: string) {
    super(id)

    this.type = 'ForgeContract'
    this.version = 1
  }

  public getWallet = (wallet: chain.WalletType): WalletType => {
    return getWallet(this.getState())(wallet)
  }

  public configure(config: ConfigureParams): this {
    super.configure(config)

    const { asset, wallet, burnWallet } = config

    this.updateTable({ asset, wallet })

    const initialPortfolio = {
      [this.table.baseAsset.id]: 100
    }

    if (this.table.baseToken)
      initialPortfolio[this.table.baseToken.id] = 0

    this.table.portfolio = {
      global: { ...initialPortfolio }
    }

    if (wallet)
      this.table.portfolio[getWalletId(wallet)] = { ...initialPortfolio }

    if (burnWallet)
      this.table.burnWallet = burnWallet

    return this
  }

  public mint(amount: number, asset: chain.AssetType, wallet: chain.WalletType): this {
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

  public melt(amount: number, asset: chain.AssetType, wallet: chain.WalletType): this {
    const fullwallet = this.getWallet(wallet)

    if (!fullwallet.canMelt(amount, asset))
      throw new Error(`User ${wallet.id} cannot melt ${amount} of ${this.baseToken.id} to recieve ${asset}`)

    const withdrawal = {
      ...this.getAsset(asset),
      value: amount
    }

    const payable = calcMeltPayable(
      withdrawal,
      this.assets[withdrawal.id],
      this.baseToken,
      fullwallet
    )

    const descreasePortfolioAsset = (portfolio: PortfolioType): PortfolioType => {
      const fullwallet = this.getWallet(wallet)

      if (!wallet.assets[this.baseToken.id] || wallet.assets[this.baseToken.id] === undefined)
        return portfolio

      // When wallet portfolio cannot be decreased
      if (fullwallet.portfolio[withdrawal.id] === 0)
        return portfolio

      const nextPortfolio = rebalanceMelt(
        portfolio,
        this.table.portfolio.global,
        this.getAsset(asset),
        fullwallet
      )

      return nextPortfolio
    }

    this.rebalance(descreasePortfolioAsset, wallet)

    this.chain.execute(melt(withdrawal, wallet, this.id, payable))

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

  public burn(amount: number, asset: chain.AssetType, wallet: chain.WalletType): this {
    const fullwallet = this.getWallet(wallet)

    if (asset !== this.baseAsset.id)
      throw new Error(`User ${wallet.id} cannot burn ${amount} of ${asset}. Burning is restricted to base asset ${this.baseAsset.id}`)

    if (!fullwallet.canBurn(amount, asset))
      throw new Error(`User ${wallet.id} cannot burn ${amount} of ${asset}`)

    this.withdraw(amount, asset, this.burnWallet)

    // TODO: move calc to utils
    this.table.asset[asset].marketCap = format(this.table.asset[asset].marketCap - amount)

    return this
  }

  protected get burnWallet(): chain.WalletType {
    if (!this.table.burnWallet)
      throw new Error('Cannot burn. No burn wallet exists')

    const wallet = this.chain.getState().wallet[this.table.burnWallet]

    if (!wallet)
      throw new Error(`Burn wallet ${this.table.burnWallet} was not found`)

    return wallet
  }

  // TODO: rename and clarify usage
  protected updateTable(config: {
    wallet?: chain.WalletType,
    asset?: chain.AssetType
  }) {
    if (!this.table.portfolio)
      this.table.portfolio = {
        global: {}
      }

    const { wallet, asset } = config

    if (wallet) {
      // If wallet portfolio does not exist, set wallet portfolio asset to current global portfolio
      const isNewWalletPortfolio = !this.table.portfolio[getWalletId(wallet)]
      if (isNewWalletPortfolio) {
        this.table.portfolio[getWalletId(wallet)] = { ...this.table.portfolio.global }
      }

      // If wallet portfolio's asset does not exist, set wallet portfolio's asset to 0
      const isNewAsset = asset && !this.table.portfolio[getWalletId(wallet)][asset]
      if (isNewAsset)
        this.table.portfolio[getWalletId(wallet)][asset] = 0
    }

    super.updateTable(config)
  }
}

export default ForgeContract
