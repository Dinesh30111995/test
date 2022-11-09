class Fee < ApplicationRecord
  validates_uniqueness_of  :fee_type, presence: true
  enum fee_type: ['Buyer', 'Seller', 'Platform']

  def self.default_service_fee
    service_fee = where(fee_type: :service_charge).first
    service_fee ? service_fee.per_mile : Rails.application.credentials.default_fees[:service_fee]
  end
end
