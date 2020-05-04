import * as contract from '../contract'

export class SenseContract extends contract.Contract {
  public constructor(readonly id: string) {
    super(id)

    this.type = 'SenseContract'
    this.version = 1
    this.dependencies.content = {
      type: 'ContentContract',
      version: 1
    }
  }
}

export default SenseContract
