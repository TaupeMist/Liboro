export type CreatePrediction = {
  value: number
}

export type BooleanVote = {
  value: number
}

export type BooleanPrediction = {
  yes: BooleanVote,
  no: BooleanVote
}

export type Prediction = BooleanPrediction
