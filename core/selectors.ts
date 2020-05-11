import {
  WalletType
} from '.'

import * as chain from '../chain'
import * as contract from '../contract'

export const getWallet = (state: contract.ContractStateType) => (wallet: chain.WalletType): WalletType => {
  const chainWallet = { ...state.table.users[wallet.id] }

  return {
    ...chainWallet,

    // TODO: return correct rank of user
    getRank: () => 100
  }
}
