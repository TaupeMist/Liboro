import { Prediction } from "./types";

export const getPrediction = (value: number): Prediction => {
  if (value > 100)
    throw new Error('Value must be less than 100')

  if (value < 1)
    throw new Error('Value must be greater than 0')

  return {
    yes: {
      value
    },
    no: {
      value: 100 - value
    }
  }
}
