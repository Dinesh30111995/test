class ReserveDrop < ApplicationRecord
  belongs_to :collection
  validates_uniqueness_of :collection_id
  default_scope -> { joins(:collection).where('collections.network_id': Current.network.id) }
  belongs_to :min_bid_erc20_token, optional: true, class_name: 'Erc20Token'
end
