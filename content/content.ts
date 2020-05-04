import * as contract from '../contract'
import * as core from '../core'

export class ContentContract extends contract.Contract {
  public constructor(readonly id: string) {
    super(id)

    this.type = 'ContentContract'
    this.version = 1
    this.dependencies.core = {
      type: 'CoreContract',
      version: 1
    }
  }

  public core: string

  public getCore = (): core.CoreContract => {
    this.ensureDeployed()

    return this.chain.getContract(this.core) as core.CoreContract
  }
}

export default ContentContract
