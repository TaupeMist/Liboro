import 'mocha'
import { expect } from 'chai'

import { getPrediction } from './utils';

context('Prediction', () => {
  describe('getPrediction', () => {
    it('should throw when value is less than 100', () => {
      const getPredictionWithInvalidValue = () => {
        return getPrediction(0)
      }

      expect(getPredictionWithInvalidValue).to.throw()
    })

    it('should throw when value is greater than 100', () => {
      const getPredictionWithInvalidValue = () => {
        return getPrediction(101)
      }

      expect(getPredictionWithInvalidValue).to.throw()
    })

    it('should not throw when value is correct', () => {
      const getPredictionWithLowValue = () => {
        return getPrediction(1)
      }

      expect(getPredictionWithLowValue).to.not.throw()

      const getPredictionWithHighValue = () => {
        return getPrediction(100)
      }

      expect(getPredictionWithHighValue).to.not.throw()
    })

    it('can return correct value', () => {
      expect(getPrediction(50)).to.deep.equal({
        yes: {
          value: 50
        },
        no: {
          value: 50
        }
      })

      expect(getPrediction(20)).to.deep.equal({
        yes: {
          value: 20
        },
        no: {
          value: 80
        }
      })

      expect(getPrediction(87)).to.deep.equal({
        yes: {
          value: 87
        },
        no: {
          value: 13
        }
      })
    })
  })
})
