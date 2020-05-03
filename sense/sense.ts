import * as contract from '../contract'
import * as chain from '../chain'
import * as content from '../content'

export class SenseContract extends contract.Contract {
  public constructor(readonly id: string, readonly contentId: string) { super(id) }

  public get contentContract(): content.ContentContract {
    this.requiresContract(this.contentId)

    return this.chain.getState().contract[this.contentId] as content.ContentContract
  }

  private requiresContentContract(id: string, chain: chain.StoreType = this.chain) {
    super.requiresContract(id, chain)

    // TODO: ensure that the type of contract matches content type
  }

  public deploy(chain: chain.StoreType): this {
    try {
      this.requiresContentContract(this.contentId, chain)

      super.deploy(chain)
    } catch (ex) {
      throw ex
    }

    return this
  }
}

export default SenseContract
