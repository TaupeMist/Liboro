import {
  PredictionType,
  PredictionSummary,
  getPredictionSummaryParams,
  BooleanPrediction,
  WalletType,
  TokenType,
  TableType,
  CreditType,
  CreditBuybackSummary
} from '.';

import {
  format
} from '../contract'

export const createPrediction = (value: number): PredictionType => {
  if (value > 100)
    throw new Error('Value must be less than 100')

  if (value < 1)
    throw new Error('Value must be greater than 0')

  return {
    yes: value,
    no: 100 - value
  }
}

export const getTotal = (
  credit: WalletType['credit'],
  balance: WalletType['balance']
): WalletType['balance'] => {
  const yes = (credit.yes || 0) + (balance.yes || 0)
  const no = (credit.no || 0) + (balance.no || 0)

  return {
    yes,
    no
  }
}

export const getLowestToken = (total: WalletType['total']): TokenType | null => {
  if (total.yes === total.no) return null

  return total.yes > total.no ? 'no' : 'yes'
}

export const getHighestToken = (total: WalletType['total']): TokenType | null => {
  if (total.yes === total.no) return null

  return total.yes > total.no ? 'yes' : 'no'
}

export const getLowestPrediction = (value: number): TokenType | null => {
  if (value === 50) return null

  return value > 50 ? 'no' : 'yes'
}

export const getHighestPrediction = (value: number): TokenType | null => {
  if (value === 50) return null

  return value > 50 ? 'yes' : 'no'
}

export const getPredictionSummary = ({
  value,
  wallet
}: getPredictionSummaryParams): PredictionSummary => {
  const prediction = createPrediction(value)

  const nextBalance = {} as PredictionSummary['nextBalance']
  const nextCredit = {} as PredictionSummary['nextCredit']

  const { total } = wallet
  const lowestToken = getLowestToken(total)
  const highestToken = getHighestToken(total)
  const highestPrediction = getHighestPrediction(value)
  const lowestPrediction = getLowestPrediction(value)

  const isEqual = value === 50
  const wasEqual = lowestToken === highestToken

  /**
   * Equalise Prediction
   *
   * Total: yes: 60, no: 40
   * Prediction: yes: 50, no: 50
   * Result - Balance: yes: 40, no: 40
   * Result - Credit: yes: 20 (60 - 40)
   */
  if (isEqual) {
    nextBalance.yes = total[lowestToken || 'yes']
    nextBalance.no = total[lowestToken || 'yes']

    if (highestToken) {
      nextCredit[highestToken] = format(total[highestToken] - nextBalance[highestToken])
    }
  }

  /**
   * Reverse Prediction
   *
   * Total: yes: 40, no: 60
   * Prediction: yes: 60, no: 40
   * Result - Balance: yes: 40, no: 26.67 (40 / 60 * 40)
   * Result - Credit: no: 33.33 (60 - 26.67)
   */
  else if (highestPrediction === lowestToken) {
    nextBalance[lowestToken] = total[lowestToken]
    nextBalance[highestToken] = format(total[lowestToken] / total[highestToken] * total[lowestToken])

    nextCredit[highestToken] = format(total[highestToken] - nextBalance[highestToken])
  }

  /**
   * Expand Prediction
   *
   * Total: yes: 60, no: 40
   * Prediction: yes: 80, no: 20
   * Result - Balance: yes: 60, no: 15 (60 / (80 / 20))
   * Result - Credit: no: 25 (40 - 15)
   */
  else if (prediction[highestPrediction] > total[highestToken]) {
    nextBalance[highestToken] = total[highestToken]
    nextBalance[lowestToken] = format(total[highestToken] / (prediction[highestPrediction] / prediction[lowestPrediction]))

    nextCredit[lowestToken] = format(total[lowestToken] - nextBalance[lowestToken])
  }

  /**
   * Shrink Prediction
   *
   * Total: yes: 80, no: 20
   * Prediction: yes: 60, no: 40
   * Result - Balance: yes: 30 (60 / 40 * 20), no: 20
   * Result - Credit: yes: 50 (80 - 30)
   */
  else if (prediction[highestPrediction] < total[highestToken]) {
    nextBalance[lowestToken] = total[lowestToken]
    nextBalance[highestToken] = format(prediction[highestPrediction] / prediction[lowestPrediction] * total[lowestToken])

    nextCredit[highestToken] = format(total[highestToken] - nextBalance[highestToken])
  }

  /**
   * Unequalise Prediction
   *
   * Total: yes: 100, no: 100
   * Prediction: yes: 60, no: 40
   * Result - Balance: yes: 100, no: 66.6667 (40 / 60 * 100)
   * Result - Credit: no: 33.33 (100 - 66.6667)
   */
  else if (wasEqual && !isEqual) {
    nextBalance[highestPrediction] = total[highestPrediction]
    nextBalance[lowestPrediction] = format(prediction[lowestPrediction] / prediction[highestPrediction] * total[highestPrediction])

    const creditValue = format(total[highestPrediction] - nextBalance[lowestPrediction])
    if (creditValue !== 0)
      nextCredit[lowestPrediction] = format(total[highestPrediction] - nextBalance[lowestPrediction])
  }

  else {
    throw new Error('No calculation found')
  }

  return {
    prediction,
    nextBalance,
    nextCredit
  }
}

// TODO: calculate global portfolio based on wallet amount
export const calcGlobalPortfolio = (summary: PredictionSummary): BooleanPrediction => {
  return summary.prediction
}

export const calcBalance = (amount: number, wallet: WalletType): TableType['Balance'] => {
  return {
    yes: format(wallet.balance.yes + (amount * (wallet.portfolio.yes / 100))),
    no: format(wallet.balance.no + (amount * (wallet.portfolio.no / 100)))
  }
}

export const getCreditBuyable = (credit: CreditType, prediction: PredictionType): CreditType => {
  const creditBuyable: CreditType = {}

  if (credit.yes) {
    creditBuyable.yes = format((prediction.no / prediction.yes) * credit.yes)
  } else if (credit.no) {
    creditBuyable.no = format((prediction.yes / prediction.no) * credit.no)
  }

  return creditBuyable
}

export const calcRemainder = (amount: number, { creditBuyable }: WalletType): number => {
  if (!creditBuyable.yes && !creditBuyable.no) return amount

  const result = amount - (creditBuyable.yes || creditBuyable.no)

  return result > 0 ? format(result) : 0
}

export const getCreditBuybackSummary = (amount: number, wallet: WalletType): CreditBuybackSummary => {
  const remainder = calcRemainder(amount, wallet)

  const buyable = format(amount - remainder)

  const mintable: CreditBuybackSummary['mintable'] = {
    id: wallet.creditBuyable.yes > 0 ? 'no' : 'yes',
    value: amount > buyable ? buyable : amount
  }

  const prediction = wallet.portfolio

  const nextBalance = { ...wallet.balance }
  const nextCredit = { ...wallet.credit }

  if (mintable.id === 'no') {
    const buyback = format(prediction.yes / prediction.no * mintable.value)

    nextBalance.yes = format(nextBalance.yes + buyback)
    nextBalance.no = format(nextBalance.no + mintable.value)

    nextCredit.yes = format(nextCredit.yes - buyback)
    if (nextCredit.yes === 0) delete nextCredit.yes
  } else if (mintable.id === 'yes') {
    const buyback = format(prediction.no / prediction.yes * mintable.value)

    nextBalance.yes = format(nextBalance.yes + mintable.value)
    nextBalance.no = format(nextBalance.no + buyback)

    nextCredit.no = format(nextCredit.no - buyback)
    if (nextCredit.no === 0) delete nextCredit.no
  }

  return {
    remainder,
    nextBalance,
    nextCredit,
    mintable: mintable.value > 0 ? mintable : null,
  }
}