class DashboardController < ApplicationController
  skip_before_action :authenticate_user
  skip_before_action :is_approved

  def index
    # set_categories_by_filter
    @collections = set_categories_by_filter
    @likes = current_user ? current_user.likes.pluck(:collection_id) : []
    @hot_bids = Collection.top_bids(30).with_attached_attachment
    # @featured_users = FeaturedUser.limit(5).map(&:user)
    @featured_collections = FeaturedCollection.limit(5).map(&:collection).compact
    @edition_drops = Collection.joins(:edition_drop).on_sale.where("edition_drops.starts_at <=? and edition_drops.expires_in>=?",Time.now.utc,Time.now.utc).where("edition_drops.collection_id = collections.id").limit(4)
    @reserve_drops = Collection.joins(:reserve_drop).on_sale.where("reserve_drops.starts_at <=? and reserve_drops.expires_in>=?",Time.now.strftime('%Y-%m-%d %H:%M:%S'),Time.now.strftime('%Y-%m-%d %H:%M:%S')).where("reserve_drops.collection_id = collections.id").limit(4)
    # @hot_collections = Collection.group(:owner).count
    top_buyers_and_sellers
  end

  def category
    @collections = set_categories_by_filter
    @isCategory = true
    @category_collections = nil
  end

  def set_categories_by_filter
    params[:page_no] ||= 1
    @category_collections = params[:query].present? ? Collection.search("*#{params[:query].strip}*").records : Collection.all
    @category_collections = @category_collections.where("created_at > ?", Time.now - 2.days) if params[:newest].present?
    @category_collections = @category_collections.comments_with_user.get_with_sort_option(params[:sort_by])
    @category_collections = @category_collections.where("category like ?", "%#{params[:category]}%") if params[:category].present?
    @category_collections = @category_collections.on_sale.by_published.with_attached_attachment.paginate(page: params[:page] || 1, per_page: 12)
  end

  def top_buyers_and_sellers
    @top_sellers = User.top_seller(params[:days]).with_attached_attachment
    @top_buyers = User.top_buyer(params[:days]).with_attached_attachment
  end

  def search
    if params[:tab] =='users'
      @users = User.search("*#{params[:query]}*").records
    else
      @searching = params[:query].present?
      @users = User.where("name LIKE ? OR address LIKE ?", "%#{params[:query]}%", "%#{params[:query]}%").records if params[:query].present?
      @featured_collections = FeaturedCollection.joins(collection: :owner).where(collections: {published: true}).limit(5).map(&:collection).compact
      params[:page_no] ||= 1
      @collections = params[:query].present? ? Collection.search("*#{params[:query].strip}*").records : Collection
      @collections = @collections.on_sale.by_published.with_attached_attachment.optimize_card.paginate(page: params[:page] || 1,per_page: 20)
    end
  end
  
  def search_hash_tag
    @hash = params[:hash_tag]
    @collections = Collection
      .joins(:hash_tags)
      .left_joins(:likes)
      .group(:id)
      .where(hash_tags: { name: @hash })
      .with_attached_attachment
      .optimize_card
      .reorder('')
      .order('COUNT(likes.id) DESC')
      .all
    redirect_to root_path unless @collections.present?
  end

  def edition_drops
    @collections = Collection.joins(:edition_drop).where("edition_drops.starts_at <=? and edition_drops.expires_in>=?",Time.now.strftime("%Y-%m-%d %H:%M:%S"),Time.now.strftime("%Y-%m-%d %H:%M:%S")).where("edition_drops.collection_id = collections.id")
  end

  def reserve_drops
    @collections = Collection.joins(:reserve_drop).where("reserve_drops.starts_at <=? and reserve_drops.expires_in>=?",Time.now,Time.now).where("reserve_drops.collection_id = collections.id")
  end

  def notifications
    Notification.unread(current_user).update_all(is_read: true) if Notification.unread(current_user).present?
    @notifications = current_user.notifications
  end

  def contract_abi
    shared = ActiveModel::Type::Boolean.new.cast(params[:shared])
    abi = if params[:contract_address].present? && params[:type] == 'erc20'
            Utils::Abi.weth
          # elsif params[:contract_address].present? && (params[:type] == 'erc20')
            # { abi: Api::Etherscan.new.contract_abi(params[:contract_address]), bytecode: '' }
          elsif params[:contract_address].present? && (params[:type] == 'trade')
            Utils::Abi.trade
          elsif(shared)
            if params[:type] == 'nft721'
              Utils::Abi.shared_nft721
            elsif params[:type] == 'nft1155'
              Utils::Abi.shared_nft1155
            end
          elsif(!shared)
            if params[:type] == 'nft721'
              Utils::Abi.nft721
            elsif params[:type] == 'nft1155'
              Utils::Abi.nft1155
            end
          else
            {}
          end
    render json: {compiled_contract_details: abi}
  end

  def gas_price
    gas_price = Api::Gasprice.gas_price
    render json: {gas_price: gas_price}
  end

  def change_network
    network = Network.find_by(chain_id: params[:chain_id].to_i)
    redirect_to root_path, alert: "Invalid network selected" and return if network.nil?  
    cookies[:chain_id] = network.chain_id
    redirect_to root_path
  end
end
