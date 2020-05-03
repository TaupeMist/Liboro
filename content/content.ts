import * as contract from '../contract'

export class ContentContract extends contract.Contract {
  public constructor(readonly id: string, readonly coreId: string) {
    super(id)
  }
}

export default ContentContract
