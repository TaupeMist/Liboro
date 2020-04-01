import {
  format,
  getTable
} from '../contract'

import {
  CommandType,
  AssetHardType,
  ExecuteType,
  UndoType,
  WalletType
} from '../chain'

export const seed = (
  amount: number,
  assetSeeding: AssetHardType,
  buyer: WalletType,
  contractId: string
): CommandType => {
  const execute: ExecuteType = state => {
    const { contract, wallet } = state;
    const assets = wallet[buyer.id].assets

    wallet[buyer.id].assets[assetSeeding] = format(assets[assetSeeding] - amount)

    contract[contractId].assets[assetSeeding] = amount

    return { ...state, contract }
  }

  const undo: UndoType = state => {
    const { contract } = state;
    const { baseToken } = getTable(state, contractId)

    contract[contractId].assets[assetSeeding] = 0
    contract[contractId].assets[baseToken.id] = 0

    return { ...state, contract }
  }

  return {
    execute,
    undo
  }
}
