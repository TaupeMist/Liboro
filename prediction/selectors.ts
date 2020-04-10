import {
  PredictionType,
  WalletType,
  CreditType
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
  const balance = state.table.balance[wallet.id] || 0

  const yes = wallet.reserves.yes ? balance * wallet.reserves.yes.ratio : 0

  const no = wallet.reserves.no ? balance * wallet.reserves.no.ratio : 0

  return {
    yes,
    no
  }
}

export const getWallet = (state: contract.ContractStateType) => (wallet: chain.WalletType): WalletType => {
  const portfolioWallet = portfolio.getWallet(state)(wallet)

  return {
    ...portfolioWallet,
    credit: getCredit(state)(wallet),
    balance: getBalance(state)(portfolioWallet)
  }
}