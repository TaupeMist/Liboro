import {
  ConfigureParams,
  calcGlobalPortfolio,
  getPredictionSummary,
  TokenType,
  hasPrediction,
  getPrediction,
  PredictionType,
  WalletType,
  getWallet,
  calcBalance,
  getCreditBuybackSummary,
  getResolutionSummary
} from '.'

import {
  format
} from '../contract'

import * as chain from '../chain'

import * as portfolio from '../portfolio'

export class PredictionContract extends portfolio.PortfolioContract {
  public constructor(readonly id: string) { super(id) }

  public set active(active: boolean) {
    this.table.active = active
  }

  public get active() {
    return this.table.active
  }

  public set resolved(resolved: boolean) {
    this.table.resolved = resolved
  }

  public get resolved() {
    return this.table.resolved
  }

  public get balance() {
    this.updateTable()

    return this.table.owner.assets[this.baseAsset.id]
  }

  public getWallet = (wallet: chain.WalletType): WalletType => {
    return getWallet(this.getState())(wallet)
  }

  public configure(config: ConfigureParams): this {
    super.configure(config)

    const { asset, wallet } = config

    this.updateTable({ asset, wallet })

    this.addAsset('yes', wallet)
    this.addAsset('no', wallet)

    this.resolved = false
    this.active = true

    return this
  }

  public updatePrediction(value: number, wallet: chain.WalletType): this {
    this.updateTable({ wallet })

    const summary = getPredictionSummary({
      value,
      wallet: this.getWallet(wallet)
    })

    // TODO: return portfolio type instead of BooleanPrediction
    this.table.portfolio[wallet.id] = summary.prediction
    this.table.portfolio.global = calcGlobalPortfolio(summary)

    this.table.balance[wallet.id] = summary.nextBalance
    this.table.credit[wallet.id] = summary.nextCredit

    return this
  }

  /**
   * Mint new tokens for user
   */
  private mint(amount: number, asset: TokenType, wallet: chain.WalletType): this {
    this.updateTable({ wallet })

    const payable = {
      ...this.getAsset(asset),
      id: asset,
      value: amount
    }

    const currTokenBalance = this.table.balance[wallet.id][payable.id]

    this.table.balance[wallet.id][payable.id] = format(currTokenBalance + payable.value)

    // TODO: move calc to utils
    this.table.asset[asset].marketCap = format(this.getAsset(asset).marketCap + amount)

    return this
  }

  /**
   * Buy an amount of tokens for the user proportionate to their current prediction.
   * Include the user's current credit when buying
   *
   * @param amount the amount in base asset that will be used to buy tokens
   * @param wallet the wallet of the buyer
   */
  private buy(amount: number, wallet: chain.WalletType): this {
    this.updateTable({ wallet })

    const fullWallet = this.getWallet(wallet)

    try {
      /**
       * CREDIT BUYBACK
       *
       * Buy back credit (previously minted tokens) though minting the opposite token
       */
      const { mintable, remainder, ...creditBuyback } = getCreditBuybackSummary(amount, fullWallet)

      /**
       * If this user has existing credit, that credit can be reclaimed through minting
       */
      if (mintable) {
        this.mint(mintable.value, mintable.id, wallet)

        this.table.balance[wallet.id] = creditBuyback.nextBalance
        this.table.credit[wallet.id] = creditBuyback.nextCredit

        /**
         * If the credit buyback used the entire buying amount, then the purchase is complete
         */
        if (remainder === 0) return this
      }

      /**
       * MINTING
       *
       * Once any credit has been bought back, mint any remaining amount
       */
      const nextBalance = calcBalance(remainder, fullWallet)

      const amountToMint: WalletType['balance'] = {
        yes: nextBalance.yes - fullWallet.balance.yes,
        no: nextBalance.no - fullWallet.balance.no
      }

      if (amountToMint.yes > 0) {
        this.mint(amountToMint.yes, 'yes', wallet)
      }

      if (amountToMint.no > 0) {
        this.mint(amountToMint.no, 'no', wallet)
      }
    } catch(ex) {
      throw ex
    }

    return this
  }

  /**
   * Deposit an amount of base asset from a user's wallet into the contract
   * and buy an amount of yes/no tokens proportionate to their current prediction
   *
   * @param amount the amount in base asset that will be used to buy tokens
   * @param wallet the wallet of the buyer
   */
  public deposit(amount: number, wallet: chain.WalletType): this {
    this.updateTable({ wallet })

    /**
     * If user does not have a prediction, set a default prediction
     */
    if (!this.hasPrediction(wallet))
      this.updatePrediction(50, wallet)

    try {
      /**
       * Transfer must complete before tokens can be bought
       */
      this.transfer(amount, this.baseAsset.id, wallet, this.table.owner)

      /**
       * Once transfer has completed, buy the yes/no tokens
       */
      this.buy(amount, wallet)
    } catch(ex) {
      throw ex
    }

    return this
  }

  public resolve(assetType: TokenType): this {
    const { wallets } = getResolutionSummary({
      asset: this.getAsset(assetType),
      balance: this.balance,
      wallets: this.portfolioWallets.map(this.getWallet)
    })

    const transferPayable = wallet => {
      this.transfer(wallet.payable.value, this.baseAsset.id, this.table.owner, wallet)
    }

    try {
      wallets.forEach(transferPayable)

      this.resolved = true
      this.active = false
    } catch(ex) {
      throw ex
    }

    return this
  }

  public hasPrediction(wallet: chain.WalletType): Boolean {
    return hasPrediction(this.getState())(wallet)
  }

  public getPrediction(wallet: chain.WalletType): PredictionType {
    return getPrediction(this.getState())(wallet)
  }

  // TODO: rename and clarify usage
  protected updateTable(params: {
    wallet?: chain.WalletType,
    asset?: chain.AssetType
  } = {}) {
    super.updateTable(params)

    if (!this.table.balance)
      this.table.balance = {}

    if (!this.table.credit)
      this.table.credit = {}

    const { wallet } = params

    if (wallet && !this.table.owner)
      this.table.owner = wallet

    if (wallet && !this.table.balance[wallet.id])
      this.table.balance[wallet.id] = 0

    if (wallet && !this.table.credit[wallet.id])
      this.table.credit[wallet.id] = {}
  }
}

export default PredictionContract
