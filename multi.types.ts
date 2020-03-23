import {
  AssetType
} from './chain.types'

export type WalletType = {
  id: string,
  assets: object
}

export type ContractType = {
  id: string,
  assets: object
}

export type PortfolioType = {
  [A in AssetType]: number
}

export type MultiType = ContractType & {
  portfolio: {
    [K: string]: PortfolioType
  }
}

export type StateType = {
  contract: {
    [K: string]: MultiType 
  },
  wallet: {
    [K: string]: WalletType
  }
}
