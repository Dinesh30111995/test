  # frozen_string_literal: true

  # Admin User
  ETHEREUM_CHAIN_ID = Rails.env.development? ? 4 : 1
  BSC_CHAIN_ID = Rails.env.development? ? 97 : 56
  MATIC_CHAIN_ID = Rails.env.development? ? 80001 : 137

  AdminUser.find_or_create_by(email: 'ADMIN_EMAIL_HERE').update(password: 'ADMIN_PASSWORD_HERE', first_name: 'ADMIN_FIRSTNAME_HERE', last_name: 'ADMIN_LASTNAME_HERE', password_confirmation: 'ADMIN_PASSWORD_CONFIRMATION_HERE')

  Fee.find_or_create_by(fee_type: 'Buyer').update(per_mile: '2.5')
  Fee.find_or_create_by(fee_type: 'Seller').update(per_mile: '2.5')

  Category.unscoped.update(is_active: 0)
  ['Art', 'Music', 'Scripts', 'Books', 'Sticker Album', 'Ideas', 'Business Plan', 'Video/Spot'].each { |c| Category.unscoped.find_or_create_by(name: c).update(is_active: 1) }

  # network_id will depend on the hash of the Network.rb

  # Creating ERC20 Token List
  Erc20Token.unscoped.find_or_create_by(chain_id: ETHEREUM_CHAIN_ID, symbol: 'WETH', network_id: 1)
    .update(address: 'WETH_TOKEN_ADDRESS_HERE', name: 'Wrapped Ether', decimals: 18)
  Erc20Token.unscoped.find_or_create_by(chain_id: BSC_CHAIN_ID, symbol: 'WBNB', network_id: 2)
    .update(address: 'WBNB_TOKEN_ADDRESS_HERE', name: 'Wrapped BNB', decimals: 18)
  Erc20Token.unscoped.find_or_create_by(chain_id: MATIC_CHAIN_ID, symbol: 'WMATIC', network_id: 3)
    .update(address: 'WMATIC_TOKEN_ADDRESS_HERE', name: 'Wrapped Matic', decimals: 18)

  ### CREATING SHARED NFT CONTRACT ADDRESSES
  NftContract.unscoped.find_or_create_by(contract_type: 'nft721', symbol: 'Shared', network_id: 1)
    .update(name: 'NFT', address: '721_ETH_CONTRACT_ADDRESS_HERE')
  NftContract.unscoped.find_or_create_by(contract_type: 'nft1155', symbol: 'Shared', network_id: 1)
    .update(name: 'NFT', address: '1155_ETH_CONTRACT_ADDRESS_HERE')
  NftContract.unscoped.find_or_create_by(contract_type: 'nft721', symbol: 'Shared', network_id: 2)
    .update(name: 'NFT', address: '721_BSC_CONTRACT_ADDRESS_HERE')
  NftContract.unscoped.find_or_create_by(contract_type: 'nft1155', symbol: 'Shared', network_id: 2)
    .update(name: 'NFT', address: '1155_BSC_CONTRACT_ADDRESS_HERE')
  NftContract.unscoped.find_or_create_by(contract_type: 'nft721', symbol: 'Shared', network_id: 3)
    .update(name: 'NFT', address: '721_MATIC_CONTRACT_ADDRESS_HERE')
  NftContract.unscoped.find_or_create_by(contract_type: 'nft1155', symbol: 'Shared', network_id: 3)
    .update(name: 'NFT', address: '1155_MATIC_CONTRACT_ADDRESS_HERE')
