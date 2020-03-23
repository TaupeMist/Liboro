const chain = {
  contracts: {
    register: contract => {
      return {
        wallet: selectWallet => {
          return {
            buy: buyToken => {
              return {
                for: amount => {
                  return {
                    of: sellToken => {
                      console.log('chain.contracts.register.' + contract.id + '.wallet.' + selectWallet({ Fred: { id: 'Fred' } }).id + '.buy.' + buyToken + '.for.' + amount + '.of.' + sellToken) 
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}

chain.contracts.register({ id: 'balance' }).wallet(wallet => wallet.Fred).buy('token').for(50).of('usd')