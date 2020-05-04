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

  public content: string

  public interact(wallet: chain.WalletType): this {
    this.ensureDeployed()

    const user = this.getUser(wallet)
    console.log('interact:user', user)

    // TODO: mint interaction points based on the user's liboropoints

    return this
  }

  protected getUser = (wallet: chain.WalletType) => {
    const contentContract = this.chain.getContract(this.content) as content.ContentContract

    return contentContract.getCore().getUser(wallet)
  }
}

export default SenseContract
