import {
  PredictionType,
  PredictionSummary,
  getPredictionSummaryParams,
  BooleanPrediction
} from '.';

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

export const getPredictionSummary = ({
  value,
  wallet
}: getPredictionSummaryParams): PredictionSummary => {
  const prediction = createPrediction(value)

  // TODO: calculate next balance
  const nextBalance = 80

  // TODO: calculate next credit
  const nextCredit = {
    yes: 20
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