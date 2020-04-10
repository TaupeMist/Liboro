import {
  PredictionType,
  WalletType,
  CreditType
} from '.';

import * as chain from '../chain'

import * as contract from '../contract'

import * as portfolio from '../portfolio'
import { balance } from '../portfolio/utils';

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

export const getBalance = (state: contract.ContractStateType) => (wallet: chain.WalletType): number => {
  return state.table.balance[wallet.id] || 0
}

export const getWallet = (state: contract.ContractStateType) => (wallet: chain.WalletType): WalletType => {
  return {
    ...portfolio.getWallet(state)(wallet),
    prediction: getPrediction(state)(wallet),
    credit: getCredit(state)(wallet),
    balance: getBalance(state)(wallet)
  }
}