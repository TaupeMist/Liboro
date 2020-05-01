import 'mocha'
import { expect } from 'chai'

import { createPrediction } from './utils';

context('Prediction', () => {
  describe('create', () => {
    it('should throw when value is less than 100', () => {
      const getPredictionWithInvalidValue = () => {
        return createPrediction(0)
      }

      expect(getPredictionWithInvalidValue).to.throw()
    })

    it('should throw when value is greater than 100', () => {
      const getPredictionWithInvalidValue = () => {
        return createPrediction(101)
      }

      expect(getPredictionWithInvalidValue).to.throw()
    })

    it('should not throw when value is correct', () => {
      const getPredictionWithLowValue = () => {
        return createPrediction(1)
      }

      expect(getPredictionWithLowValue).to.not.throw()

      const getPredictionWithHighValue = () => {
        return createPrediction(100)
      }

      expect(getPredictionWithHighValue).to.not.throw()
    })

    it('can return correct value', () => {
      expect(createPrediction(50)).to.deep.equal({
        yes: 50,
        no: 50
      })

      expect(createPrediction(20)).to.deep.equal({
        yes: 20,
        no: 80
      })

      expect(createPrediction(87)).to.deep.equal({
        yes: 87,
        no: 13
      })
    })
  })

  describe('prediction summary', () => {})
})
