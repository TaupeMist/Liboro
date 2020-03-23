import {
  CommandType,
  WalletType,
  ExecuteType,
  UndoType
} from './chain.types'

import {
  MultiType,
  PortfolioType
} from './multi.types'

import { init as initBalance, add as addToken, buy as buyToken } from './balance.commands'

export const init = (id: string): MultiType => {
  return {
    ...initBalance(id),
    portfolio: {}
  }
}

export const add = addToken

export const buy = buyToken

export const rebalance = (portfolio: PortfolioType, buyer: WalletType): CommandType => {
  let prev = undefined;

  const execute: ExecuteType = state => {
    const { contract } = state;
    
    prev = { ...state }

    contract.portfolio[buyer.id] = portfolio
    
    return { ...state, contract }
  }
  const undo: UndoType = state => {
    prev = { ...state }
    return { ...prev }
  }

  return {
    execute,
    undo
  }
}
