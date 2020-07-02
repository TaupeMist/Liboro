import Address from './address'
import Contract from './contract'

import {
  issue
} from './token.store'

export interface TokenIssue {
  amount: number,
  receiver: Address
}

export class Token extends Contract {
  constructor(public address: Address, public id: string) {
    super(address, id)
  }

  public issue({ amount, receiver }: TokenIssue): void {
    this.dispatch(issue({ contractId: this.id, amount, receiverId: receiver.id }))
  }
}

export default Token
