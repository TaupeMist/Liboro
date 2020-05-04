import * as chain from '../chain';

import {
  addContract
} from '../chain';

import {
  TableType,
  WalletType,
  AssetType,
  IContract,
  ContractStateType,
  ConfigureParams,
  addAsset,
  setTable,
  deposit,
  withdraw,
  transfer,
  getWallet,
  getAsset,
  ContractInfo,
  Dependencies,
  DependencyMap,
  ContractType
} from '.'

export class Contract implements IContract {
  public constructor(readonly id: string) {}

  protected type: ContractType = 'Contract'

  protected version: number = 1

  protected chain?: chain.StoreType

  protected dependencies: Dependencies = {}

  protected ensureDeployed(
    chain: chain.StoreType = this.chain,
    expected: ContractInfo = this.info
  ) {
    if (!chain)
      throw new Error('Chain does not exist. Chain must first be deployed.')

    if (!chain.getState().contract[expected.id])
      throw new Error(`No contract with the id "${expected.id}" was found. Please ensure that the contract has been deployed.`)

    const contract = chain.getState().contract[expected.id]

    if (contract.type !== expected.type)
      throw new Error(`The contract "${expected.id}" is type ${contract.type}. Contract type ${expected.type} was expected`)

    if (contract.version !== expected.version)
      throw new Error(`The contract "${expected.id}" is version ${contract.version}. Contract version ${expected.version} was expected`)

    return true
  }

  protected validateDependencies(chain: chain.StoreType, dependencyMap: DependencyMap = {}): void {
    const dependencyKeys = Object.keys(this.dependencies)

    const mapDependency = id => {
      if (!dependencyMap[id])
        throw new Error(`Dependency mismatch. Expected dependency "${id}" to be defined in ${JSON.stringify(dependencyMap)}`)

      this.dependencies[id].id = dependencyMap[id]

      this[id] = dependencyMap[id]

      // TODO: investigate wether it's possible to assign dynamic getters for the dep contracts
      // Object.defineProperty(this, id, {
      //   get: () => {
      //     return this.chain.getState().contract[id]
      //   }
      // })
    }

    const ensureDeployed = id => this.ensureDeployed(chain, this.dependencies[id] as ContractInfo)

    dependencyKeys.forEach(mapDependency)
    dependencyKeys.forEach(ensureDeployed)
  }

  // TODO: rename and clarify usage
  protected updateTable(config: {
    wallet?: chain.WalletType,
    asset?: chain.AssetType
  }) {
    if (!this.table.asset)
      this.table.asset = {}

    const { asset } = config

    if (asset) {
      if (!this.table.asset[asset])
        this.table.asset[asset] = {
          id: asset,
          value: 0,
          marketCap: 0
        }
    }
  }

  public get info(): ContractInfo {
    return {
      id: this.id,
      type: this.type,
      version: this.version
    }
  }

  public get assets(): ContractStateType['assets'] {
    this.ensureDeployed()

    return this.chain.getState().contract[this.id].assets
  }

  public get table(): TableType {
    this.ensureDeployed()

    return this.chain.getState().contract[this.id].table
  }

  public set table(table: TableType) {
    this.ensureDeployed()

    this.chain.execute(setTable(table, this))
  }

  public get baseToken() {
    return this.getAsset(this.table.baseToken.id, this.table.baseToken)
  }

  public set baseToken(baseToken: AssetType) {
    this.table.baseToken = baseToken
  }

  public get baseAsset() {
    return this.getAsset(this.table.baseAsset.id, this.table.baseAsset)
  }

  public getState = (): ContractStateType => {
    return {
      assets: { ...this.assets },
      table: { ...this.table }
    }
  }

  public getWallet = (wallet: chain.WalletType): WalletType => {
    return getWallet(this.getState())(wallet)
  }

  public getAsset = (asset: chain.AssetType, prevAsset?: AssetType): AssetType => {
    return getAsset(this.getState())(asset, prevAsset)
  }

  public deploy(chain: chain.StoreType, dependencyMap?: DependencyMap): this {
    if (this.chain) throw new Error('Chain already exists. Cannot override chain.')

    try {
      this.validateDependencies(chain, dependencyMap)

      chain.execute(addContract(this))

      this.chain = chain

      this.updateTable({})
    } catch (ex) {
      throw new Error(`Could not deploy contract. ${ex}`)
    }

    return this
  }

  public configure(config: ConfigureParams): this {
    if (!this.chain) throw new Error('Chain does not exist. Chain must first be deployed.')

    const { asset, token, baseAsset } = config

    this.addAsset(asset)

    this.table.baseAsset = this.getAsset(asset, {
      id: asset,
      value: baseAsset,
      marketCap: baseAsset
    })

    if (token) {
      this.addAsset(token)

      this.table.baseToken = this.getAsset(asset, {
        id: token,
        value: 0,
        marketCap: 0
      })
    }

    return this
  }

  public addAsset(asset: chain.AssetType, wallet?: chain.WalletType): this {
    this.chain.execute(addAsset(asset, this))

    this.updateTable({
      asset,
      wallet
    })

    return this
  }

  public addToken(token: string): this {
    return this.addAsset(token)
  }

  public deposit (
    amount: number,
    asset: chain.AssetType,
    sender: chain.WalletType
  ): this {
    this.chain.execute(deposit(amount, asset, sender, this.id))

    return this
  }

  public withdraw (
    amount: number,
    asset: chain.AssetType,
    receiver: chain.WalletType
  ): this {
    this.chain.execute(withdraw(amount, asset, receiver, this.id))

    return this
  }

  public transfer (
    amount: number,
    asset: chain.AssetType,
    sender: chain.WalletType,
    receiver: chain.WalletType
  ): this {
    this.chain.execute(transfer(amount, asset, sender, receiver))

    return this
  }
}

export default Contract
