import {
  PredictionType
} from '.';

import * as chain from '../chain'

import * as contract from '../contract'

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
