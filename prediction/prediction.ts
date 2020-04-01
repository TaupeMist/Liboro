import {
  Contract
} from '../contract'

export class PredictionContract extends Contract {
  public constructor(readonly id: string) { super(id) }
}

export default PredictionContract
