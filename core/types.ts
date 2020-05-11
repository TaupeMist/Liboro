import * as chain from '../chain'

export type WalletType = chain.WalletType & {
  getRank: () => number
}
