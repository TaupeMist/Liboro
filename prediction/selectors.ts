import {
  PredictionType,
  WalletType,
  CreditType,
  getTotal,
  getCreditBuyable
} from '.';

import * as chain from '../chain'

import * as contract from '../contract'

import * as portfolio from '../portfolio'

export const hasPrediction = (state: contract.ContractStateType) => (wallet: chain.WalletType): boolean => {
  return state.table.portfolio[wallet.id].yes + state.table.portfolio[wallet.id].no === 100
}

export const getPrediction = (state: contract.ContractStateType) => (wallet: chain.WalletType): PredictionType => {
  return hasPrediction(state)(wallet)
    ? {
      yes: state.table.portfolio[wallet.id].yes,
      no: state.table.portfolio[wallet.id].no
    }
    : undefined
}

export const getCredit = (state: contract.ContractStateType) => (wallet: chain.WalletType): CreditType => {
  return state.table.credit[wallet.id] as CreditType
}

export const getBalance = (state: contract.ContractStateType) => (wallet: portfolio.WalletType): WalletType['balance'] => {
  return state.table.balance[wallet.id] || { yes: 0, no: 0}
}

export const getWallet = (state: contract.ContractStateType) => (wallet: chain.WalletType): WalletType => {
  const portfolioWallet = portfolio.getWallet(state)(wallet)
  const credit = getCredit(state)(wallet)
  const balance = getBalance(state)(portfolioWallet)
  const total = getTotal(credit, balance)
  const creditBuyable = getCreditBuyable(credit, getPrediction(state)(wallet))

  return {
    ...portfolioWallet,
    credit,
    creditBuyable,
    balance,
    total
  }
}