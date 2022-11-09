# frozen_string_literal: true

class Network < ActiveHash::Base
  self.data = [
    { id: 1, name: 'Ethereum Rinkeby', short_name: 'rinkeby', chain_id: 4, scan: 'Etherscan'  },
    { id: 2, name: 'BSC Testnet', short_name: 'bsc-test', chain_id: 97, scan: 'Bscscan' },
    { id: 3, name: 'Matic Testnet', short_name: 'matic-test', chain_id: 80_001, scan: 'Polygon scan' }
  ]

  def ethereum_network?
    id == 1
  end
end