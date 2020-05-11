import { Contract } from '../contract'

export type AssetPredefined = 'usd' | 'eur' | 'gold' | 'eos' | 'liborodollar' | 'liboropoints'

export type AssetType = AssetPredefined | string

export type WalletType = {
  id: string,
  assets: {
    [A in AssetType]?: number
  }
}

export type ContractType = {
  id: string,
  assets: {
    [A in AssetType]?: number
  }
}

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
    [A in AssetType]: {
      marketCap: number
    }
  }
}

export type StateType = {
  contract: {
    [K: string]: Contract
  },
  wallet: {
    [K: string]: WalletType
  }
}

export type RebalanceType = {
  [A in AssetType]: {
    direction: 'up' | 'down',
    value: number
  }
}

export interface StoreConfig {
  initialState?: StateType,
  onMutation?: (state: StateType) => void
}

export type ExecuteType = (state: StateType) => StateType

export type CommandType = {
  execute: ExecuteType
}

export type StoreType = {
  execute: (command: CommandType) => void,
  undo: () => void,
  select: (func: (StateType) => StateType) => StateType,
  getState: () => StateType,
  getContract: (contractId: string) => Contract,
  getStateHistory: () => StateType[],
  getCommandHistory: () => CommandType[],
  debug: (command?: CommandType) => {},
  getDateTime: () => Date,
  setDateTime: (date: Date) => void,
  incrementDay: () => void
}

export type ContractStateType = {
  assets: {
    [A in AssetType]?: number
  },
  table: TableType
}
