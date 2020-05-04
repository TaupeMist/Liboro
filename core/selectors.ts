import * as chain from '../chain'
import * as contract from '../contract'

export const getUser = (state: contract.ContractStateType) => (wallet: chain.WalletType): contract.Contract =>
  state.table.users[wallet.id]
