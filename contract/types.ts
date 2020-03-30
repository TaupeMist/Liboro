import { Contract } from './contract'

export type AssetHardType = 'usd' | 'eur' | 'gold' | 'eos'

export type AssetType = AssetHardType | string

export type ComparisonType = {
  total: number
}

export type LiboroAssetType = {
  id: AssetType,
  value: number,
  marketCap: number,
  compare?: (targetAsset: LiboroAssetType) => ComparisonType
}

export type WalletType = {
  id: string,
  assets: {
    [A in AssetType]?: number
  }
}

export type LiboroWalletType = WalletType & {
  portfolio: PortfolioType
}

export type ContractType = {
  id: string,
  assets: {
    [A in AssetType]?: number
  }
}

// TODO: change from number to LiboroAssetType
export type PortfolioType = {
  [A in AssetType]?: number
}

export type TableType = {
  [K: string]: any,
  portfolio?: {
    global: PortfolioType,
    [K: string]: PortfolioType
  },
  asset?: {
    [A in AssetType]: LiboroAssetType
  },
  baseAsset: LiboroAssetType,
  baseToken: LiboroAssetType
}

export type ContractStateType = {
  assets: {
    [A in AssetType]?: number
  },
  table: TableType
}

export type StateType = {
  contract: {
    [K: string]: Contract
  },
  wallet: {
    [K: string]: WalletType
  }
}

export interface StoreConfig {
  initialState?: StateType,
  onMutation?: (state: StateType) => void
}

export type ExecuteType = (state: StateType) => StateType

export type UndoType = (state?: StateType) => StateType

export type CommandType = {
  execute: ExecuteType,
  undo: UndoType
}

export type StoreType = {
  execute: (command: CommandType) => void,
  undo: () => void,
  select: (func: (StateType) => StateType) => StateType,
  getState: () => StateType,
  getStateHistory: () => StateType[],
  getCommandHistory: () => CommandType[],
  debug: (command?: CommandType) => {}
}