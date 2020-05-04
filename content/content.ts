import * as contract from '../contract'

export class ContentContract extends contract.Contract {
  public constructor(readonly id: string) {
    super(id)

    this.type = 'ContentContract'
    this.version = 1

    // TODO: add core contract as dependency
    // this.dependencies.core = {
    //   type: 'CoreContract',
    //   version: 1
    // }
  }
}

export default ContentContract
