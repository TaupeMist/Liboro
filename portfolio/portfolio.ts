import {
  calcPortfolio,
  calcGlobalPortfolio,
  intoTotal,
  GetPorfolioType,
  ConfigureParams,
  WalletType,
  getWallet
} from '.'

import * as chain from '../chain'

import {
  Contract,
  getWalletId,
  deposit
} from '../contract'

export class PortfolioContract extends Contract {
  public constructor(readonly id: string) {
    super(id)

    this.type = 'PortfolioContract'
    this.version = 1
  }

  public get portfolioWallets() {
    this.updateTable()

    const outGlobal = key => key !== 'global'

    const outEmptyPortfolios = walletId => !this.isPortfolioEmpty(this.table.portfolio[walletId])

    const toWallet = id => this.getWallet({ id } as WalletType)

    return Object.keys(this.table.portfolio)
      .filter(outGlobal)
      .filter(outEmptyPortfolios)
      .map(toWallet)
  }

  public getWallet = (wallet: chain.WalletType): WalletType => {
    return getWallet(this.getState())(wallet)
  }

  public deploy(chain: chain.StoreType): this {
    try {
      super.deploy(chain)

      this.updateTable({})
    } catch (ex) {
      throw new Error('Could not deploy contract.')
    }

    return this
  }

  public configure(config: ConfigureParams): this {
    super.configure(config)

    const { asset, wallet } = config

    this.updateTable({ asset, wallet })

    const initialPortfolio = {
      [this.table.baseAsset.id]: 0
    }

    if (this.table.baseToken)
      initialPortfolio[this.table.baseToken.id] = 0

    this.table.portfolio = {
      global: { ...initialPortfolio }
    }

    if (wallet)
      this.table.portfolio[getWalletId(wallet)] = { ...initialPortfolio }

    return this
  }

  public addAsset(asset: chain.AssetType, wallet?: chain.WalletType): this {
    super.addAsset(asset, wallet)

    this.updateTable({ asset, wallet })

    return this
  }

  public rebalance(getPortfolio: GetPorfolioType, wallet: chain.WalletType): this {
    this.table.portfolio[getWalletId(wallet)] = calcPortfolio(getPortfolio, this.getWallet(wallet))

    this.table.portfolio.global = calcGlobalPortfolio(
      this.getWallet(wallet),
      this.baseToken,
      this.table.portfolio
    )

    return this
  }

  public seed(amount: number, asset: chain.AssetType, wallet: chain.WalletType): this {
    this.updateTable({ asset, wallet })

    this.addAsset(asset, wallet)

    this.chain.execute(deposit(amount, asset, wallet, this.id))

    if (this.isPortfolioEmpty(this.table.portfolio.global)) {
      this.table.portfolio.global = {
        ...this.table.portfolio.global,
        [asset]: 100
      }
    }

    if (this.isPortfolioEmpty(this.getWallet(wallet).portfolio)) {
      this.table.portfolio[wallet.id] = {
        ...this.table.portfolio[wallet.id],
        [asset]: 100
      }
    }

    return this
  }

  public isPortfolioEmpty(portfolio: chain.PortfolioType): boolean {
    return Object.keys(portfolio).reduce(intoTotal(portfolio), 0) === 0
  }

  // TODO: rename and clarify usage
  protected updateTable(config: {
    wallet?: chain.WalletType,
    asset?: chain.AssetType
  } = {}) {
    super.updateTable(config)

    if (!this.table.portfolio)
      this.table.portfolio = {
        global: {}
      }

    const { wallet, asset } = config

    if (asset) {
      if (!this.table.portfolio.global[asset])
        this.table.portfolio.global[asset] = 0
    }

    if (wallet) {
      // If wallet portfolio does not exist, set wallet portfolio to empty
      const isNewWalletPortfolio = !this.table.portfolio[getWalletId(wallet)]
      if (isNewWalletPortfolio) {
        this.table.portfolio[getWalletId(wallet)] = {}
      }

      // If wallet portfolio's asset does not exist, set wallet portfolio's asset to 0
      const isNewAsset = asset && !this.table.portfolio[getWalletId(wallet)][asset]
      if (isNewAsset)
        this.table.portfolio[getWalletId(wallet)][asset] = 0
    }
  }
}

export default PortfolioContract
