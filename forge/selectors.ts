import {
  WalletType,
  getCanMelt,
  getCanBurn
} from '.';

import * as chain from '../chain'

import * as contract from '../contract'

import * as portfolio from '../portfolio'

export const getWallet = (state: contract.ContractStateType) => (wallet: chain.WalletType): WalletType => {
  const portfolioWallet = portfolio.getWallet(state)(wallet)
  const canMelt = getCanMelt(portfolioWallet)
  const canBurn = getCanBurn(portfolioWallet)

  return {
    ...portfolioWallet,
    canMelt,
    canBurn
  }
}
