import {
  CommandType,
  ExecuteType,
  WalletType,
} from '../chain'

import {
  AssetType,
  format,
  getTable
} from '../contract'

export const mint = (
  assetSelling: AssetType,
  buyer: WalletType,
  contractId: string,
  payable: AssetType
): CommandType => {
  const execute: ExecuteType = state => {
    const { contract, wallet } = state
    const { baseToken } = getTable(state, contractId)

    // TODO: replace with better system
    // if (!hasFunds(assetSelling.value, baseToken, assetSelling.id, wallet[buyer.id])(getContract(state, contractId))) return state

    const { assets } = wallet[buyer.id]

    wallet[buyer.id].assets[assetSelling.id] = format(assets[assetSelling.id] - assetSelling.value)

    contract[contractId].assets[assetSelling.id] = format(contract[contractId].assets[assetSelling.id] + assetSelling.value)

    wallet[buyer.id].assets[baseToken.id] = format((assets[baseToken.id] || 0) + payable.value)

    return { ...state, contract, wallet }
  }

  return {
    execute
  }
}

export const burn = (
  assetBuying: AssetType,
  buyer: WalletType,
  contractId: string,
  payable: AssetType
): CommandType => {
  const execute: ExecuteType = state => {
    const { contract, wallet } = state
    const { baseToken } = getTable(state, contractId)

    // TODO: replace with better system
    // if (!hasFunds(assetBuying.value, baseToken, assetBuying.id, wallet[buyer.id])(getContract(state, contractId))) return state

    const { assets } = wallet[buyer.id]

    wallet[buyer.id].assets[baseToken.id] = format(assets[baseToken.id] - assetBuying.value)

    contract[contractId].assets[assetBuying.id] = format(contract[contractId].assets[assetBuying.id] - payable.value)

    wallet[buyer.id].assets[assetBuying.id] = format((assets[assetBuying.id] || 0) + payable.value)

    return { ...state, contract, wallet }
  }

  return {
    execute
  }
}
