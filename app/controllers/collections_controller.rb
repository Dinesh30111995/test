class CollectionsController < ApplicationController
  skip_before_action :authenticate_user, only: [:show]
  before_action :is_approved, only: [:show]
  # before_action :set_collection, only: [:show, :bid, :execute_max_bid, :remove_from_sale, :execute_bid, :buy]
  before_action :set_collection, except: [:new, :create, :update_token_id, :sign_metadata_hash]

  skip_before_action :verify_authenticity_token


  def new
    @collection_type = params[:type]
    if params[:nft]
      begin
        asset_response = JSON.parse(URI.open(Rails.application.credentials.config[:opensea_url] + "/api/v1/asset/#{params[:contract_address]}/#{params[:token]}").read)
        if asset_response["top_ownerships"]
          contract_symbol = asset_response["asset_contract"]["symbol"]
          contract_type = (contract_symbol.include?("NFT1155") || contract_symbol.include?("NFT721")) ? "Shared" : "Own"
          num_of_copy = asset_response["top_ownerships"].find { |resp| resp["owner"]["address"].downcase == current_user.address.downcase }.try(:fetch, "quantity")
          data = JSON.parse(URI.open(params[:nft]).read)
          @nft = {
            title: data["name"],
            description: data["description"],
            metadata: params[:nft],
            token: params[:token],
            contract_type: contract_type,
            num_copies: num_of_copy,
            contract_address: params[:contract_address]
          }
          OpenURI::Buffer.send :remove_const, 'StringMax' if OpenURI::Buffer.const_defined?('StringMax')
          OpenURI::Buffer.const_set 'StringMax', 0
          if data.has_key?("image")
            file = URI.open(data["image"])
            @nft.merge!({
              url: data["image"],
              file_path: file.path,
              file_type: file.content_type
            })
          elsif data.has_key?("animation_url")
            file = URI.open("https://ipfs.io/ipfs/" + data["animation_url"].split("://")[1])
            @nft.merge!({
              url: "https://ipfs.io/ipfs/" + data["animation_url"].split("://")[1],
              file_path: file.path,
              file_type: file.content_type,
              preview_url: "https://ipfs.io/ipfs/" + data["image_url"].split("://")[1]
            })
          elsif data.has_key?("image_url")
            file = URI.open("https://ipfs.io/ipfs/" + data["image_url"].split("://")[1])
            @nft.merge!({
              url: "https://ipfs.io/ipfs/" + data["image_url"].split("://")[1],
              file_path: file.path,
              file_type: file.content_type
            })
          end
        else
          raise "Unable to fetch the asset details"
        end
     rescue Exception => e
        Rails.logger.warn "################## Exception while reading Opensea Collection file ##################"
        redirect_to user_path(id: current_user.address, tab: 'nft_collections')
      end
    end
  end

  def show
    @tab = params[:tab]
    @activities = PaperTrail::Version.where(item_type: "Collection", item_id: @collection.id).order("created_at desc")
    @max_bid = @collection.max_bid
    set_collection_gon
  end

  def create
    begin
      # ActiveRecord::Base.transaction do
        @collection = Collection.new(collection_params.except(:source, :nft_link, :token, :total_copies, :contract_address, :contract_type))
        @collection.state = :pending
       if collection_params[:source] == "opensea"
          data = JSON.parse(URI.open(collection_params[:nft_link]).read)
          OpenURI::Buffer.send :remove_const, 'StringMax' if OpenURI::Buffer.const_defined?('StringMax')
          OpenURI::Buffer.const_set 'StringMax', 0
          if data.has_key?("animation_url")
            file = URI.open("https://ipfs.io/ipfs/" + data["animation_url"].split("://")[1])
          elsif data.has_key?("image_url")
            file = URI.open("https://ipfs.io/ipfs/" + data["image_url"].split("://")[1])
          else
            file = URI.open(data["image"])
          end
          @collection.name = data["name"]
          unless @collection.nft_contract.address == collection_params[:contract_address]
            @collection.nft_contract = NftContract.find_or_create_by(contract_type: @collection.nft_contract.contract_type, symbol: collection_params[:contract_type], address: collection_params[:contract_address])
          end
          @collection.royalty = 0
          @collection.token = collection_params[:token]
          @collection.no_of_copies = collection_params[:total_copies]
          @collection.owned_tokens = collection_params[:no_of_copies].present? ? collection_params[:no_of_copies] : collection_params[:total_copies]
          @collection.description = data["description"]
          @collection.attachment.attach(io: file, filename: data["name"], content_type: file.content_type)
          # for music and video if no cover added then we add default banner image as cover
          if ['audio/mp3', 'audio/webm', 'audio/mpeg', 'video/mp4', 'video/webm'].include?(file.content_type) && !@collection.cover.present?
            if data.has_key?("animation_url")
              preview_file = URI.open("https://ipfs.io/ipfs/" + data["image_url"].split("://")[1])
              @collection.cover.attach(io: preview_file, filename: data["name"], content_type: preview_file.content_type)
            else
              @collection.cover.attach(io: File.open('app/assets/images/banner-1.png'), filename: 'banner-1.png')
            end
          end
        else
          @collection.owned_tokens = @collection.no_of_copies
        end
        @collection.network_id = Current.network.id
        # ITS A RAND STRING FOR IDENTIFIYING THE COLLECTION. NOT CONTRACT ADDRESS
        @collection.address = Collection.generate_uniq_token
        @collection.creator_id = current_user.id
        @collection.owner_id = current_user.id
        @collection.data = JSON.parse(collection_params[:data]) if collection_params[:data].present?
        if @collection.valid?
          @collection.save
          @metadata_hash = Api::Pinata.new.upload(@collection)
          # PaperTrail.request(enabled: false) { @collection.approve! }
        else
          @errors = @collection.errors.full_messages
        end
      # end
    rescue Exception => e
      Rails.logger.warn "################## Exception while creating collection ##################"
      Rails.logger.warn "ERROR: #{e.message}, PARAMS: #{params.inspect}"
      Rails.logger.warn $!.backtrace[0..20].join("\n")
      @errors = e.message
    end
  end

  def bid
    begin
      if @collection.max_bid.present?
        collection_max_bid = @collection.max_bid.amount
      else
        collection_max_bid = @collection.min_bid_price_val
      end
      bidding_amount = bid_params[:details][:amount]

      if collection_max_bid
        if collection_max_bid < bidding_amount.to_d
          @collection.place_bid(bid_params)
        elsif @collection.max_bid.blank? and (collection_max_bid >= bidding_amount.to_d )
          @collection.place_bid(bid_params)
        else
          raise StandardError.new "Not more than the current maximum bid"
        end
      else
        @collection.place_bid(bid_params)
      end
    rescue Exception => e
      Rails.logger.warn "################## Exception while creating BID ##################"
      Rails.logger.warn "ERROR: #{e.message}, PARAMS: #{params.inspect}"
      Rails.logger.warn $!.backtrace[0..20].join("\n")
      @errors = e.message
    end
  end

  def swap_request
    begin
      Swap.create!(swap_params)
    rescue Exception => e
      Rails.logger.warn "################## Exception while creating SWAP ##################"
      Rails.logger.warn "ERROR: #{e.message}, PARAMS: #{params.inspect}"
      Rails.logger.warn $!.backtrace[0..20].join("\n")
      @errors = e.message
    end
  end

  def approve_swap
    begin
      ActiveRecord::Base.transaction do
        @redirect_address = @collection.approve_swap(params[:swap_id], params[:transaction_hash]) if @collection.is_owner?(current_user)
      end
    rescue Exception => e
      Rails.logger.warn "################## Exception while swapping collection ##################"
      Rails.logger.warn "ERROR: #{e.message}, PARAMS: #{params.inspect}"
      Rails.logger.warn $!.backtrace[0..20].join("\n")
      @errors = e.message
    end
  end

  def verify_swap
    begin
      swap = Swap.find params[:swap_id]
      owner_collection = Collection.where(owner_id: swap.owner_id, id: swap.owner_collection_id).first
      requestor_collection = Collection.where(owner_id: swap.requestor_id, id: swap.requestor_collection_id).first
      if owner_collection.nil? || requestor_collection.nil? || owner_collection.owned_tokens < swap.owner_quantity || requestor_collection.owned_tokens < swap.requestor_quantity
        swap.expire_swap!
        render json: { :success => false, :errors => ["The swap request is expired."] }
      else
        render json: { :success => true }
      end
    rescue Exception => e
      Rails.logger.warn "################## Exception while swapping collection ##################"
      Rails.logger.warn "ERROR: #{e.message}, PARAMS: #{params.inspect}"
      Rails.logger.warn $!.backtrace[0..20].join("\n")
      @errors = e.message
    end
  end

  def reject_swap
    begin
      swap = Swap.find_by(id: params[:swap_id], owner_collection_id: @collection.id)
      swap.reject_swap!
    rescue Exception => e
      Rails.logger.warn "################## Exception while swapping collection ##################"
      Rails.logger.warn "ERROR: #{e.message}, PARAMS: #{params.inspect}"
      Rails.logger.warn $!.backtrace[0..20].join("\n")
      @errors = e.message
    end
  end

  def fetch_swap_details
    swap = Swap.find_by(id: params[:swap_id], owner_collection_id: @collection.id)
    render json: {data: swap.details}
  end

  def remove_from_sale
    if @collection.is_owner?(current_user)
      @collection.remove_from_sale
      @collection.cancel_bids
    end
    redirect_to collection_path(@collection.address)
  end

  def sell
    if @collection.is_lazy_minted? && params[:tokenId].to_i!=0#After getting sold, the owner will mint with creators name and transfer
      @collection.update(token: params[:tokenId].to_i) #Double validation because tokenId cant be 0
    end
    begin
      ActiveRecord::Base.transaction do
        lazy_minted = lazy_mint_token_update
        @redirect_address = @collection.execute_bid(params[:address], params[:bid_id], params[:transaction_hash], lazy_minted) if @collection.is_owner?(current_user)
      end
    rescue Exception => e
      Rails.logger.warn "################## Exception while selling collection ##################"
      Rails.logger.warn "ERROR: #{e.message}, PARAMS: #{params.inspect}"
      Rails.logger.warn $!.backtrace[0..20].join("\n")
      @errors = e.message
    end
  end

  def buy
    if @collection.is_lazy_minted? #After getting sold, the owner will mint with creators name and transfer
      @collection.update(token: params[:tokenId].to_i) if params[:tokenId].to_i!=0 #Double validation because tokenId cant be 0
    end
    begin
      ActiveRecord::Base.transaction do
        @redirect_address = @collection.direct_buy(current_user, params[:quantity].to_i, params[:transaction_hash])
      end
    rescue Exception => e
      Rails.logger.warn "################## Exception while buying collection ##################"
      Rails.logger.warn "ERROR: #{e.message}, PARAMS: #{params.inspect}"
      Rails.logger.warn $!.backtrace[0..20].join("\n")
      @errors = e.message
    end
  end

  def update_token_id
    collection = current_user.collections.unscoped.where(address: params[:collectionId]).take
    collection.approve! unless collection.instant_sale_price.present?
    collection.update(token: params[:tokenId].to_i, transaction_hash: params[:tx_id])
  end

  def change_price
    @collection.assign_attributes(change_price_params)
    @collection.save
  end

  def burn
    if @collection.multiple?
      all_collections = Collection.where(nft_contract_id: @collection.nft_contract_id, token: @collection.token)
      #Using UPDATE_ALL to FORCE-skip cases where no_of_copies > owned_tokens for a brief moment 
      all_collections.update_all(:no_of_copies => @collection.no_of_copies - params[:supply].to_i)
      if @collection.owned_tokens == params[:supply].to_i #User has 2 actions, BURN ALL vs BURN some!
        @collection.burn! if @collection.may_burn?
      else
        @collection.update(:owned_tokens => @collection.owned_tokens - params[:supply].to_i)
      end 
    else   
      @collection.burn! if @collection.may_burn?
    end
  end

  def transfer_token
    new_owner = User.find_by_address(params[:user_id])
    if new_owner.present?
      @collection.hand_over_to_owner(new_owner.id)
    else
      @errors = [t("collections.show.invalid_user")]
    end
  end

  def sign_metadata_hash
    sign = if params[:contract_address].present?
      collection = current_user.collections.unscoped.where(address: params[:id]).first
      nonce = DateTime.now.strftime('%Q').to_i
      obj = Utils::Web3.new
      obj.sign_metadata_hash(params[:contract_address], current_user.address, collection.metadata_hash, nonce)
    else
      ""
    end
    render json: sign.present? ? sign.merge("nonce" => nonce) : {}
  end

  def sign_metadata_with_creator
    sign = if params[:address].present?
        account = User.where(address: params[:address]).first
        find_collection = account.collections.where(metadata_hash: params[:tokenURI]).exists?
        if(find_collection)
          nonce = DateTime.now.strftime('%Q').to_i
          obj = Utils::Web3.new
          obj.sign_metadata_hash(params[:trade_address], account.address, params[:tokenURI], nonce)
        else 
          ""
        end
    else
      ""
    end
    render json: sign.present? ? sign.merge("nonce" => nonce) : {}
  end

  def fetch_details
    render json: {data: @collection.fetch_details(params[:bid_id], params[:erc20_address])}
  end

  def fetch_transfer_user
    user = User.validate_user(params[:address])
    if user && user.is_approved? && user.is_active?
      render json: {address: user.address}
    else
      render json: {error: 'User not found or not activated yet. Please provide address of the user registered in the application'}
    end

  end

  def sign_fixed_price
    collection = current_user.collections.unscoped.where(address: params[:id]).take
    collection.approve! if collection.pending?
    collection.update(sign_instant_sale_price: params[:sign])
  end

  def approve
    collection = current_user.collections.unscoped.where(address: params[:id]).take
    if collection.metadata_hash.present?
      collection.approve! if collection.pending?
    end
  end

  def owner_transfer
    collection = current_user.collections.where(address: params[:id]).take
    recipient_user = User.where(address: params[:recipient_address]).first
    if collection.multiple?
      collection.hand_over_to_owner(recipient_user.id, params[:transaction_hash], params[:supply].to_i)
    else 
      collection.hand_over_to_owner(recipient_user.id, params[:transaction_hash], collection.owned_tokens)
    end
  end

  def save_contract_nonce_value
    if params.dig("signature").present?
      contract_nonce = ContractNonceVerify.create(contract_sign_address: params.dig("signature", "sign"), contract_sign_nonce: params.dig("signature", "nonce"), user_address: current_user.address)
    end
  end

  def get_nonce_value
    render json: {nonce: DateTime.now.strftime('%Q').to_i}
  end

  def save_nonce_value
    if params[:sign].present?
      contract_nonce = ContractNonceVerify.create(contract_sign_address: params[:sign], contract_sign_nonce: params[:nonce], user_address: current_user.address)
    end
  end

  def get_contract_sign_nonce
    contract_nonce = ContractNonceVerify.find_by(contract_sign_address: params[:sign])
    nonce = contract_nonce.present? ? {nonce: contract_nonce.contract_sign_nonce.to_i} : {}
    render json: nonce
  end

  def delivery_details
    @collection.assign_attributes(delivery_params)
    @collection.save
    redirect_to collection_path(@collection.address)
  end

  def update_collection
    collection = Collection.find(params[:id])
    collection.update(published: params[:published])
    message = "Collection was successfully #{collection.published ? 'published' : 'unpublished'}."
    respond_to do |format|
      format.html { redirect_to collections_admin_user_path(collection.owner.id), notice: message }
      format.json { head :no_content }
    end
  end

  private

  # Collection param from React  
  # def collection_params
  #   params.permit(:name, :description, :collection_address, :put_on_sale, :instant_sale_price, :unlock_on_purchase,
  #     :collection_category, :no_of_copies, :attachment)
  # end

  def lazy_mint_token_update
    # After getting sold, the owner will mint with creators name and transfer
    lazy_minted = @collection.is_lazy_minted?
    @collection.update(token: params[:tokenId].to_i) if lazy_minted #&& params[:tokenId]&.to_i != 0
    lazy_minted
    # Double validation because tokenId cant be 0
  end

  def collection_params
    params['collection']['category'] = params['collection']['category'].present? ? params['collection']['category'].split(",") : []
    params['collection']['nft_contract_id'] = NftContract.get_shared_id(params[:collection][:collection_type]) if params['chooseCollection'] == 'nft'
    params['collection']['erc20_token_id'] = Erc20Token.where(address: params[:collection][:currency]).first&.id if params[:collection][:currency].present?
    params.require(:collection).permit(:name, :description, :collection_address, :put_on_sale, :instant_sale_enabled, :instant_sale_price, :unlock_on_purchase,
                               :minimum_bid, :min_bid_erc20_token_id, :bid_time, :bid_time_opt, :bid_id, :no_of_copies, :attachment, :cover, :data, :collection_type, :royalty, :nft_contract_id, :unlock_description,
                               :erc20_token_id, :timed_auction_enabled, :delivery_on_purchase, :delivery_details, :delivery_email, :start_time, :end_time,
                               :instant_sale_enabled, :source, :nft_link, :token, :total_copies, :contract_address, :contract_type, :imported, category: [])
  end

  def change_price_params
    params[:collection][:put_on_sale] = false if params[:collection][:put_on_sale].nil?
    params[:collection][:unlock_on_purchase] = false if params[:collection][:unlock_on_purchase].nil?
    params[:collection][:delivery_on_purchase] = false if params[:collection][:delivery_on_purchase].nil?
    if params[:collection][:clear_delivery_details].present?
      params[:collection][:delivery_details] = ''
      params[:collection][:delivery_email] = ''
    end
    unless params[:collection][:instant_sale_enabled]
      params[:collection][:instant_sale_enabled] = false
      params[:collection][:instant_sale_price] = nil
    end
    params.require(:collection).permit(:put_on_sale, :instant_sale_enabled, :instant_sale_price, :unlock_on_purchase, :unlock_description, :erc20_token_id, :delivery_on_purchase, :delivery_details, :delivery_email)
  end

  def bid_params
    params[:user_id] = current_user.id
    params.permit(:sign, :quantity, :user_id, details: {})
  end

  def set_collection
    @collection = Collection.unscoped.comments_with_user.find_by(address: params[:id])
    redirect_to root_path unless @collection.present?
  end

  def set_gon
    gon.collection_data = @collection.gon_data
  end

  def set_collection_gon
    gon.collection_data = @collection.gon_data
    if @collection.max_bid.present?
      gon.collection_max_bid = @collection.max_bid.amount
      gon.is_bids_exists = true
    else
      gon.collection_max_bid = @collection.min_bid_price_val
      gon.is_bids_exists = false
    end
  end

  def swap_params
    params[:requestor_id] = current_user.id
    params[:owner_collection_id] = @collection.id
    params[:owner_id] = @collection.owner_id
    params.permit(:requestor_id, :owner_id, :owner_collection_id, :requestor_collection_id, :requestor_quantity, :owner_quantity, :signature, :transaction_hash)
  end

  def delivery_params
    params.permit(:delivery_details, :delivery_email)
  end
end
























