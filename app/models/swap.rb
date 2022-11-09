class Swap < ApplicationRecord
  include AASM

  belongs_to :requestor, class_name: 'User', foreign_key: 'requestor_id'
  belongs_to :owner, class_name: 'User', foreign_key: 'owner_id'
  belongs_to :owner_collection, class_name: 'Collection', foreign_key: 'owner_collection_id'
  belongs_to :requestor_collection, class_name: 'Collection', foreign_key: 'requestor_collection_id'

  has_paper_trail on: [:create, :update]

  validates :requestor_id, :owner_id, :requestor_collection_id, :owner_collection_id, :state, presence: true

  scope :active_swap, -> { where.not(state: [:rejected,:expired]) }
  scope :by_desc, lambda { order('created_at desc') }
  after_create :send_new_notification

  enum state: {
      pending: 1,
      approved: 2,
      rejected: 3,
      expired: 4
    }

  aasm column: :state, enum: true, whiny_transitions: false do
    state :pending, initial: true, if: :is_eligible_for_bid?
    state :approved
    state :rejected
    state :expired

    event :approve_swap, after: :send_approve_notification do
      transitions from: :pending, to: :approved
    end

    event :reject_swap, after: :send_reject_notification do
      transitions from: :pending, to: :rejected
    end

    event :expire_swap, after: :send_expire_notification do
      transitions from: :pending, to: :expired
    end
  end

  def details
    {requestor_contract_address: requestor_collection.nft_contract.address, requestor_token_id: requestor_collection.token, owner_contract_address: owner_collection.nft_contract.address, owner_token_id: owner_collection.token, requestor_quantity: requestor_quantity, owner_quantity: owner_quantity, signature: signature, requestor_address: requestor.address, owner_address: owner.address, asset_type: owner_collection.nft_contract.contract_asset_type}
  end

  def send_new_notification
    Notification.notify_new_swap(self)
  end

  def send_approve_notification
    Notification.notify_approve_swap(self)
  end

  def send_reject_notification
    Notification.notify_reject_swap(self)
  end

  def send_expire_notification
    Notification.notify_expire_swap(self)
  end
end