class Collection < ApplicationRecord
  include Searchable
  include AASM

  # enum category: [:art, :animation, :audio, :video]
  enum collection_type: [:single, :multiple]
  enum state: {pending: 1, approved: 2, burned: 3, feed: 4}
  enum bid_time_opt: [:days, :hours, :minutes]
  enum unlockable_component_type: %i[no_unlockable physical_unlockable]

  self.per_page = 20

  FILE_EXTENSIONS = %w(png webp gif mp3 mp4).freeze
  CATEGORY_MAPPINGS = {art: ["png", "webp"], animation: ["gif"], audio: ["mp3"], video: ["mp4"]}.freeze
  IMAGE_SIZE = {thumb: {resize_to_limit: [500, 500]}, banner: {resize_to_limit: [500, 500]}}

  serialize :data, JSON
  serialize :category, Array

  belongs_to :creator, class_name: 'User', foreign_key: 'creator_id'
  belongs_to :owner, class_name: 'User', foreign_key: 'owner_id'
  belongs_to :nft_contract, optional: true
  belongs_to :erc20_token, optional: true
  belongs_to :min_bid_erc20_token, optional: true, class_name: 'Erc20Token'
  has_one_attached :attachment, dependent: :destroy
  has_one_attached :cover, dependent: :destroy
  has_many :bids
  has_many :transactions
  has_many :likes, dependent: :destroy, counter_cache: true
  has_many :comments, counter_cache: true
  has_many :collection_hash_tags
  has_many :hash_tags, through: :collection_hash_tags
  has_one :edition_drop
  has_one :reserve_drop
  has_many :owner_swaps, foreign_key: :owner_collection_id, class_name: 'Swap'
  has_many :requestor_swaps, foreign_key: :requestor_collection_id, class_name: 'Swap'

  has_paper_trail

  default_scope { where(is_active: true) }
  default_scope { where(state: :approved) }
  default_scope -> { order('created_at desc') }
  default_scope -> { where(network_id: Current.network.id) }
  scope :by_creator, lambda { |user| where(creator: user) }
  scope :on_sale, -> { where(put_on_sale: true) }
  scope :on_instant_sale, -> { where(instant_sale_enabled: true) }
  scope :other_author_nfts, lambda { |user| where("owner_id != ?", user.id) }
  scope :lazy_minted, -> {where.not(nft_contract_id: nil).where(token: nil)}
  scope :minted, -> {where.not(token: nil)}
  scope :top_bids, lambda{|days| joins(:bids).order('count(bids.collection_id) DESC').group('bids.collection_id').where('bids.created_at > ?', Time.now-(days.to_i.days)).where("bids.state"=>:pending)}
  scope :comments_with_user, -> { includes(comments: %i[user comment_likes]) }
  scope :not_timed_auctions, -> { where(timed_auction_enabled: false) }
  scope :feed_query, lambda {
    unscoped
      .where(is_active: true)
      .where(network_id: Current.network.id)
      .where(state: %i[approved feed])
      .order('created_at desc')
      .includes(:erc20_token, :likes, owner: [:collection_save, attachment_attachment: :blob ])
      .comments_with_user
      .with_attached_attachment
  }
  scope :optimize_card, lambda {
    includes(:likes, :erc20_token, creator: [attachment_attachment: :blob], owner: [attachment_attachment: :blob])
  }
  scope :user_feed, ->(user_id) { feed_query.where(creator_id: user_id) }
  scope :timed_auction, -> {where(timed_auction_enabled: true).where.not(start_time:nil)}
  store :config, accessors: [:size, :width]
  store :data, accessors: [:highest_bid, :expire_bid_days]
  scope :by_published, -> { where(published: true)}
  scope :not_published, -> { where(published: false)}

  validates :name, :description, :category, :attachment, presence: true
  validates :name, length: {maximum: 100}
  validates :description, length: {maximum: 1000}

  # before_create :validate_and_assign_owned_token
  # before_save :validate_quantity
  after_validation :common_validation
  before_save :update_put_on_sale
  after_save :initiate_notification
  after_create :create_hash_tags
  after_save :notify_delivery_deails

  def create_hash_tags
    update!(description: ActionView::Base.full_sanitizer.sanitize(HashTag.create_hash_tags(description, id)))
  end

  aasm column: :state, enum: true, whiny_transitions: false do
    state :pending, initial: true
    state :approved
    state :burned
    state :feed

    event :approve do
      transitions from: :pending, to: :approved
    end

    event :burn, after: :send_burn_notification do
      transitions from: :approved, to: :burned, after: :remove_from_featured
    end
  end

  settings number_of_shards:1 do
    mapping dynamic:'false' do
      #indexes :id, type: :index
      indexes :name
      indexes :description
      indexes :category, type: :keyword
      indexes :collection_type, type: :keyword
      indexes :no_of_copies
      indexes :creator_name
      indexes :owner_name
    end
  end

  def send_burn_notification
    Notification.notify_burn_token(self)
  end
  def is_lazy_minted?
    return is_active? && nft_contract_id!=nil && token==nil
  end

  def min_bid_price_and_symbol
    if self.is_in_reserve_drop?
      if self.max_bid&.amount && self.max_bid&.amount > self.reserve_drop.min_bid_price
        self.max_bid&.amount.to_s + ' ' + self.max_bid&.crypto_currency_type
      else
        self.reserve_drop.min_bid_price.to_s + ' ' + self.reserve_drop.min_bid_erc20_token&.symbol
      end
    else
      self.min_bid_price.to_s  + ' ' + self.min_bid_erc20_token.symbol
    end
  end

  def min_bid_price_val
    return self.reserve_drop.min_bid_price if self.is_in_reserve_drop?

    self.min_bid_price.present? ? self.min_bid_price : self.minimum_bid
  end

  def is_in_reserve_drop?
    ((res_drop = self.reserve_drop) and DateTime.now.between?(Time.parse(res_drop.starts_at.strftime("%y-%m-%d %H:%M:%S")), Time.parse(res_drop.expires_in.strftime("%y-%m-%d %H:%M:%S")))) rescue false
  end

  def is_in_edition_drop?
    ((res_drop = self.edition_drop) and DateTime.now.between?(res_drop.starts_at, res_drop.expires_in)) rescue false
  end

  def is_eligible_for_swap?
    !(is_in_edition_drop? or is_in_reserve_drop? or is_lazy_minted? or timed_auction_enabled?)
  end

  def title
    "#{name.camelcase} #{'/' if total_editions.present?} #{total_editions}"
  end

  def remove_from_featured
    FeaturedCollection.where(collection_id: id).delete_all
  end

  def title_desc
    price, currency = sale_price
    fiat_price = sale_price_to_fiat(price, currency)
    "#{price} #{currency} #{'<span class=\'para-color\'>($ ' + fiat_price.to_s + ')</span>' if fiat_price > 0}".html_safe
  end

  def sale_price
    return [instant_sale_price.to_s, instant_currency_symbol] if instant_sale_enabled && !is_in_reserve_drop?
    return [max_bid.amount, max_bid.crypto_currency_type] if max_bid
    return ['Minimum Bid : '+min_bid_price.to_s, min_bid_erc20_token&.symbol] if put_on_sale? && min_bid_price
    return ['No active bids yet.'] if put_on_sale?
    return ['Not for sale.']
  end

  # CURRENTLY ITS FOR BNB/WBNB. FOR OTHER FIAT NEED TO INTEGRATE COINGECKO OR COINMARKETCAP APIS
  def sale_price_to_fiat price, currency='eth'
    return 0 unless currency
    usd_price = Rails.cache.fetch "#{currency}_price", expires_in: 10.seconds do
      Api::Etherscan.usd_price(currency.downcase)
    end
    return (price.to_f * usd_price).round(2)
  end

  def collection_info
    "<p class='para-color'>Collection (#{nft_contract&.contract_type&.upcase})</p><h4 data-toggle='tooltip' data-placement='top' title=\"#{nft_contract&.address}\">#{nft_contract&.masked_address}</h4>".html_safe
  end

  def total_editions
    return nil if no_of_copies == 1
    "#{owned_tokens.to_i} of #{no_of_copies}"
  end

  def creator_name
     self.creator.name
  end

  def owner_name
    self.owner.name
  end

  def place_bid(bidding_params)
    details = bidding_params[:details]
    erc20_token = Erc20Token.where(address: details[:payment_token_address]).first
    raise "Bids below min amount won’t be allowed." if timed_auction_enabled && details[:amount].to_f < minimum_bid.to_f
    minimum_accept = self.minimum_bid_accept
    if minimum_accept!=false
      minimum_accept_in_fiat = self.sale_price_to_fiat(minimum_accept[0],minimum_accept[1])
      bidding_amount_in_fiat = self.sale_price_to_fiat(details[:amount], erc20_token&.symbol)
      if bidding_amount_in_fiat < minimum_accept_in_fiat
        raise "Bids need to be more than minimum bid amount"
      end
    end
    self.bids.create(sign: bidding_params[:sign], amount: details[:amount], amount_with_fee: details[:amount_with_fee], state: :pending, owner_id: self.owner_id,
                     user_id: bidding_params[:user_id], erc20_token_id: erc20_token&.id, quantity: details[:quantity])
    self.extend_reserve_drop
  end

  def extend_reserve_drop
    if (reserve_drop = self.reserve_drop )
      if (reserve_drop.expires_in - Time.now) < 15.minutes
        reserve_drop.update(:expires_in => reserve_drop.expires_in + 15.minutes)
      end
    end
  end

  def approve_swap(swap_id, transaction_hash)
    swap = Swap.find swap_id
    requestor_collection = swap.requestor_collection
    swap.transaction_hash = transaction_hash
    if requestor_collection && swap.approve_swap!
      self.hand_over_to_owner(swap.requestor_id, transaction_hash, swap.owner_quantity)
      hash = {seller_id: swap.owner_id, buyer_id: swap.requestor_id, channel: :swap}
      self.add_transaction(hash)
      requestor_collection.hand_over_to_owner(swap.owner_id, transaction_hash, swap.requestor_quantity)
      hash = {seller_id: swap.requestor_id, buyer_id: swap.owner_id, channel: :swap}
      self.cancel_swaps
      requestor_collection.add_transaction(hash)
    end
  end

  def execute_bid(buyer_address, bid_id, receipt, lazy_minted)
    user = User.where(address: buyer_address).first
    bid = bids.where(id: bid_id, user_id: user.id).first
    if self.put_on_sale && bid.execute_bidding && bid.save!
      hash = {seller_id: self.owner_id, buyer_id: bid.user_id, currency: bid.crypto_currency, currency_type: bid.crypto_currency_type, channel: :bid}
      self.hand_over_to_owner(bid.user_id, receipt, bid.quantity, lazy_minted)
      self.add_transaction(hash)
    end
  end

  #TODO: FOR CASES LIKE 1155, BID APPROVED FOR ONLY 10, THE REAL COLLECTION SHOULD BE CLOSED FOR SELLING TOO. NEED TO CHCK FOR MULTIPLE CASES
  def hand_over_to_owner(new_owner_id, transaction_hash, quantity=1, lazy_minted = nil, burn_transfer=false)
    hash = {
      owner_id: new_owner_id,
      put_on_sale: false,
      instant_sale_price: nil,
      min_bid_price: nil,
      instant_sale_enabled: false,
      timed_auction_enabled: false,
      minimum_bid: nil,
      min_bid_erc20_token_id: nil,
      bid_time: nil,
      bid_time_opt: nil,
      start_time: nil,
      end_time: nil,
      published: false
    }
    redirect_address = address
    if multiple? && owned_tokens > 1
      final_qty = owned_tokens - quantity
      if final_qty == 0
        self.update(hash)
      elsif final_qty > 0
        collection = Collection.where(owner_id: new_owner_id, nft_contract_id: nft_contract_id, token: token).first
        if collection && !burn_transfer
      	  collection.assign_attributes({owned_tokens: (collection.owned_tokens + quantity)})
        else
          collection = self.dup.tap do |destination_package|
            destination_package.attachment.attach(self.attachment.blob)
            destination_package.cover.attach(self.cover.blob) if self.cover.blob
          end
          collection.assign_attributes(hash.merge({address: self.class.generate_uniq_token, owned_tokens: quantity}))
        end
        collection.save
        quantity_remains = {
          owned_tokens: final_qty,
          put_on_sale: false,
          instant_sale_price: nil,
          instant_sale_enabled: false,
          transaction_hash: transaction_hash,
          min_bid_price: nil,
          published: false
        }
        quantity_remains.merge!({no_of_copies: no_of_copies - quantity}) if burn_transfer
        self.update(quantity_remains)
        redirect_address = collection.address
      end
    else
      self.update(hash.merge({transaction_hash: transaction_hash}))
    end
    self.cancel_bids
    self.cancel_swaps
    self.remove_from_sale
    return redirect_address
  end

  def max_bid
    self.bids.pending.order('bids.amount desc').first if self.put_on_sale
  end

  def min_bid
    self.bids.pending.order('bids.amount asc').first if self.put_on_sale
  end

  def cancel_bids
    self.bids.where(state: :pending).update_all(state: :expired)
    # self.bids.where(state: :pending).each { |bid| bid.update(state: :expired) }
  end

  def cancel_swaps
    self.owner_swaps.active_swap.each{|sw| sw.expire_swap! }
  end

  def direct_buy(buyer, quantity, transaction_hash)
    redirect_address = self.hand_over_to_owner(buyer.id, transaction_hash, quantity)
    self.add_transaction({seller_id: self.owner_id, buyer_id: buyer.id, currency: self.instant_sale_price,
                          currency_type: instant_currency_symbol, channel: :direct})
    return redirect_address
  end

  def is_owner?(user)
    self.owner == user
  end

  def get_attachment(user, is_background = false)
    # if unlock_on_purchase?
    #   user.present? && user&.id == owner_id ? attachment_with_variant(:thumb) : "#{is_background ? '/assets/dummy-image.jpg' : '/assets/dummy-image.jpg'}"
    # else
      attachment_with_variant(:thumb)
    # end
  end

  def can_view_unlock_content? current_user_id=nil
    owner_id == current_user_id && unlock_on_purchase && unlock_description.present?
  end

  def self.generate_uniq_token
    rand_token = ""
    loop do
      rand_token = SecureRandom.hex
      collections = Collection.where(token: rand_token)
      break if collections.blank?
    end
    rand_token
  end

  def add_transaction(hash)
    hash[:network_id] = Current.network.id
    self.transactions.create(hash)
  end

  def remove_from_sale
    self.put_on_sale = false
    remove_timed_auction
    if self.save
      self.edition_drop.destroy if self.edition_drop
      self.reserve_drop.destroy if self.reserve_drop
    end
  end

  def remove_timed_auction
    self.timed_auction_enabled = false
    self.minimum_bid = nil
    self.bid_time = nil
    self.bid_time_opt = nil
    self.start_time = nil
    self.end_time = nil
  end

  def self.is_valid_activity(activity)
    ["state", "put_on_sale", "instant_sale_price"].any? { |x| activity.changeset.keys.include? x }
  end

  # CONVERT TO INTEGER (* 10) BY ROUND OFF BY 1 DECIMAL
  def royalty_fee
    (royalty.to_f.round(1) * 10).to_i
  end

  def self.get_with_sort_option(sort_by = nil)
    collections = by_published.on_sale
    return collections.order('created_at desc') if sort_by.blank?

    if sort_by == "liked"
      collections.where("id in (?)", joins(:likes).group(:id).order("count(collections.id) desc").pluck(:id))
    else
      collections.where("instant_sale_price is not null").order("instant_sale_price #{sort_by == 'lowest' ? 'asc' : 'desc'}")
    end
  end

  def self.search(query)
    search_fields = %w(address name description)
    query_string=  {
        'query': {
            'bool': {
                'must': {
                    'multi_match': {
                        'query': query,
                        'fields': search_fields,
                        'type': 'phrase_prefix'
                    }
                },
                'filter': {
                    'term': {
                        'published': true
                    }
                }
            }
        }
    }
    __elasticsearch__.search(query_string)
  end

  def get_collections
    if single?
      [self]
    else
      Collection.where(nft_contract_id: nft_contract_id, token: token)
    end
  end

  def fetch_details(bid_id, erc20_address)
    pay_token = Erc20Token.where(address: erc20_address).first
    trade_address = Settings.send("#{Current.network.short_name}").tradeContractAddress
    bid_detail = bids.where(id: bid_id).first if bid_id.present?
    details = { collection_id: self.address, owner_address: owner.address, unit_price: instant_sale_price,
                asset_type: nft_contract.contract_asset_type, asset_address: nft_contract.address, shared: shared?,
                seller_sign: sign_instant_sale_price, contract_type: contract_type, owned_tokens: owned_tokens, total: no_of_copies }
    if is_lazy_minted?
      details = details.merge(token_id: 0, type: collection_type, token_uri: metadata_hash, royalty: royalty)
    else 
      details = details.merge(token_id: token)
    end 
    details = details.merge(pay_token_address: pay_token.address, pay_token_decimal: pay_token.decimals) if pay_token
    details = details.merge(trade_address: trade_address) if trade_address
    details = details.merge(buyer_address: bid_detail.user.address, amount: bid_detail.amount, amount_with_fee: bid_detail.amount_with_fee,
                            quantity: bid_detail.quantity, buyer_sign: bid_detail.sign, bid_id: bid_detail.id) if bid_detail
    return details
  end

  def change_ownership recipient_user
    self.update({owner_id: recipient_user, put_on_sale: false, instant_sale_price: nil})
  end

  def gon_data
    { service_fee: Fee.default_service_fee,
      contract_address: nft_contract&.address,
      contract_type: nft_contract&.contract_type,
      contract_shared: shared?,
      instant_sale_price: instant_sale_price,
      put_on_sale: put_on_sale,
      collection_id: address,
      imported: imported
    }
  end

  def attachment_with_variant(size = nil)
    return attachment if attachment.content_type == "application/pdf"
    size.present? && IMAGE_SIZE[size].present? && attachment.content_type != "image/gif" && attachment.content_type != "audio/mpeg" && attachment.content_type != "video/mp4" ? attachment.variant(IMAGE_SIZE[size]) : attachment
  end

  def comment_row
    Comment.comments_row self
  end

  def comment_sub_row(parent_id)
    Comment.comment_sub_row self.comments, parent_id
  end

  def collection_saved?(current_user)
    current_user&.collection_save&.filter { |d| d.collection_id == id }&.present?
  end

  # To help with front-end validation, store equivalent value for all Erc20Token(in database) in MAP  Eg return {'eth': 0.05, 'fiat': 400}
  def minimum_bid_accept
    if reserve_drop.present?
      amount = reserve_drop.min_bid_price.to_f
      currency = reserve_drop.min_bid_erc20_token.symbol
      address = reserve_drop.min_bid_erc20_token.address
    else
      if self.minimum_bid.present?
        amount = self.minimum_bid
        currency = self.min_bid_erc20_token.symbol
        address = self.min_bid_erc20_token.address
      else
        return false
      end
    end
    return [amount,currency, address]
  end

  def set_timed_auction
    # Extending Auction time by 10mins if Bid gets placed in the last 10mins
    update(end_time: end_time + 10.minutes) if end_time.blank? == false &&  end_time - Time.now < 10.minutes
    update(start_time: Time.now, end_time: Time.now + eval("#{bid_time}.#{bid_time_opt}")) if start_time.blank?
  end

  def allowed_for_instant_buy?
    return !(timed_auction_enabled && end_time.present? && Time.now > end_time) if instant_sale_price?

    return false
  end

  def is_in_timed_auction?
    (timed_auction_enabled && end_time.present? && Time.now > end_time)
  end

  def allowed_for_bid?
    put_on_sale && (!is_in_timed_auction? && !is_in_edition_drop?)
  end

  def auction_further?
    return start_time&.future? && put_on_sale? if timed_auction_enabled?

    false
  end

  def auction_running?
    return start_time&.past? && end_time&.future? && put_on_sale? if timed_auction_enabled?

    false
  end

  def auction_enabled?
    return auction_running? if timed_auction_enabled?

    put_on_sale?
  end

  def auction_timing
    start_time&.future? ? start_time : end_time
  end

  def auction_ended?
    return end_time&.past? && put_on_sale? if timed_auction_enabled?

    false
  end

  def can_view_delivery_details? current_user_id=nil
    # prev_owner_id = self.transactions.last.seller_id rescue nil
    previous_owner.id == current_user_id && delivery_on_purchase && (delivery_details.present? || delivery_email.present?)
  end

  def isLiked?(user_id)
    likes.pluck(:user_id).include?(user_id)
  end

  def unlockable_component?
    unlock_on_purchase? && (digital_unlockable? || physical_unlockable?)
  end

  def physical_unlockable?
    unlockable_component_type == "physical_unlockable"
  end

  def notify_delivery_deails
    return if delivery_email.blank? && delivery_details.blank?

     Notification.notify_nft_delivery_details(self, previous_owner)
  end

  def previous_owner
    owner_id_changed? ? owner_id_before_last_save : creator
  end

  private

  def common_validation
    return if errors.present?
    self.errors.add(:minimum_bid,'cant be more than instant selling price') if self.minimum_bid.present? && self.instant_sale_price.present? && self.instant_sale_price < self.minimum_bid
    self.errors.add(:royalty, "should be between 0 to 50") if royalty.present? && !royalty.between?(0, 50)
    self.errors.add(:data, "should not be blank") if validate_data
    self.errors.add(:base, "Owned tokens can't be greater than no of copies") if owned_tokens.to_i > no_of_copies.to_i
    self.errors.add(:instant_sale_price, "should be valid") if instant_sale_price.present? && instant_sale_price.to_f <= 0
    if timed_auction_enabled
      time_in_days = bid_time
      case bid_time_opt
      when "hours"
        time_in_days = (bid_time.to_f / 24)
      when "minutes"
        time_in_days = (bid_time.to_f / (24*60))
      end
      self.errors.add(:bid_time, "can't be more than 15 days") if time_in_days.to_f > 15.to_f
    end
  end

  def validate_data
    is_blank = false
    data.each{|k, v| is_blank = true if k.blank? || v.blank?}
    return is_blank
  end

  def update_put_on_sale
    if !self.put_on_sale? && self.put_on_sale_changed?
      self.instant_sale_enabled = false
      self.instant_sale_price = nil
      self.sign_instant_sale_price = nil
    elsif self.put_on_sale? && self.put_on_sale_changed?
      self.reserve_drop.destroy if self.reserve_drop
    end
  end

  def initiate_notification
    Notification.notify_put_on_sale(self) if saved_change_to_put_on_sale? && put_on_sale
    Notification.notify_price_update(self) if saved_change_to_instant_sale_price? && instant_sale_price.to_f > 0

    if saved_change_to_owner_id?
      Notification.notify_ownership_transfer(self, saved_changes['owner_id'].first)
      Notification.notify_nft_sold(self, saved_changes['owner_id'].first)
    end
  end

  delegate :shared?, to: :nft_contract, allow_nil: true
  delegate :contract_type, to: :nft_contract, allow_nil: true
  delegate :symbol, to: :erc20_token, prefix: :instant_currency, allow_nil: true
  delegate :address, to: :erc20_token, prefix: :instant_currency, allow_nil: true
end
