# frozen_string_literal: true
class Transaction < ApplicationRecord
  self.per_page = 10

  belongs_to :seller, class_name: 'User'
  belongs_to :buyer, class_name: 'User'
  belongs_to :collection
  default_scope -> { where(network_id: Current.network.id) }

  enum channel: {
    bid: 1,
    direct: 2,
    swap: 3
  }
end
