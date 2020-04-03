import {
  Prediction,
  PredictionSummary,
  getPredictionSummaryParams,
  BooleanPrediction
} from './types';

export const getPrediction = (value: number): Prediction => {
  if (value > 100)
    throw new Error('Value must be less than 100')

  if (value < 1)
    throw new Error('Value must be greater than 0')

  return {
    yes: value,
    no: 100 - value
  }
}

export const getPredictionSummary = (params: getPredictionSummaryParams): PredictionSummary => {
  const { value } = params
  const prediction = getPrediction(value)

  return {
    prediction
  }
}

// TODO: calculate global portfolio based on wallet amount
export const calcGlobalPortfolio = (summary: PredictionSummary): BooleanPrediction => {
  return summary.prediction
}