import * as chain from '../chain'
import * as contract from '../contract'
import * as content from '../content'

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

  public interact(wallet: chain.WalletType): this {
    this
      .getSmith()
      .mintInteraction(wallet)
      .convertInteraction(wallet)

    return this
  }

  protected getContent() {
    this.ensureDeployed()

    return this.chain.getContract(this.dependencies.content.id) as content.ContentContract
  }

  protected getCore() {
    return this.getContent().getCore()
  }

  protected getSmith() {
    return this.getCore().getSmith()
  }
}

export default SenseContract
