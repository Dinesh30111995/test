class UsersController < ApplicationController
  before_action :authenticate_user, except: [:show]
  before_action :is_approved, except: [:show]
  before_action :set_user, only: [:show, :follow, :unfollow, :like, :unlike, :report, :load_tabs, :following_followers]

  def my_items
    @user = current_user
    user_feed
    build_data
    render "show"
  end

  def show
    user_feed
    build_data
  end

  def build_data
    @reportees = @user.reports.pluck(:created_by_id)
    @page_no = params[:page_no] || 1
    @tab = params[:tab]
    @data = @user.get_collections(@tab, params[:filters], @page_no, current_user.address)
    @followers_count = @user.followers.count
    @followees_count = @user.followees.count
    like_collection_order
  end

  def following_followers
    @tab = params[:tab]
    @users = @user.get_collections(@tab, params[:filters], params[:page] || 1)
    html = render_to_string partial: 'follow_following.html', locals: { users: @users }
    page = params[:page] || 1
    page_present = @users.next_page.present?
    next_page = following_followers_users_path(page: @users.current_page + 1, id: @user.address, tab: @tab)
    render json: { html: html, page: page, page_present: page_present, next_page: next_page }
  end

  def edit
  end

  def update
    current_user.assign_attributes(user_params)
    if current_user.valid?
      current_user.save
    else
      @error = [current_user.errors.full_messages].compact
    end
  end

  def follow
    Follow.find_or_create_by({follower_id: current_user.id, followee_id: @user.id})
    redirect_to user_path(@user.address), notice: 'Following successful'
  end

  def unfollow
    follow = Follow.where({follower_id: current_user.id, followee_id: @user.id}).first
    follow.destroy if follow.present?
    redirect_to user_path(@user.address), notice: 'Unfollowed successful'
  end

  def like
    render json: {success: @user.like_collection(params)}
  end

  def unlike
    render json: {success:  @user.unlike_collection(params)}
  end

  def report
    reportees = @user.reports.pluck(:created_by_id)
    unless reportees.include?(current_user.id)
      @user.reports.create({message: params[:message], created_by: current_user})
    end
    redirect_to user_path(@user.address)
  end

  def following
  end

  def create_contract
    @nft_contract = current_user.nft_contracts.create(name: params[:name], symbol: params[:symbol], address: params[:contract_address], contract_type: params[:contract_type], network_id: Current.network.id)
    collection = current_user.collections.unscoped.where(address: params[:collection_id]).first
    collection.update_attribute('nft_contract_id', @nft_contract.id) if collection
  end

  def load_tabs
    @page_no = params[:page_no] || 1
    @tab = params[:tab]
    @data = @user.get_collections(@tab, params[:filters], @page_no, current_user.address)
    @followers_count = @user.followers.count
    @followees_count = @user.followees.count
    like_collection_order
  end

  def moon_pay
    moon_pay = OpenStruct.new Rails.application.credentials[:moon_pay]
    host = moon_pay.host
    hash = { 
      apiKey: moon_pay.public_key,
      currencyCode: moon_pay.currency_code,
      walletAddress: current_user.address,
      redirectURL: moon_pay.redirect_url
    }
    query = '?' + hash.to_query
    binary = OpenSSL::HMAC.digest('sha256', moon_pay.secret_key, query)
    base = Base64.encode64(binary)
    url_encoded = CGI.escape base
    @link = CGI::unescapeHTML host + query + "&signature=" + url_encoded
  end

  private


  def like_collection_order
    @liked = @user.likes.order(created_at: :desc).includes(:collection).map(&:collection)
    # .sort_by(&:created_at).reverse
  end

  def user_feed
    @collections = Collection
                     .user_feed(@user.id)
                     .paginate(page: params[:page] || 1, per_page: 10)
    all_currency_price
  end

  def user_params
    params.require(:user).permit(:name, :bio, :attachment, :twitter_link, :personal_url, :banner)
  end

  def set_user
    @user = User.find_by(address: params[:id])
    redirect_to root_path unless @user.present?
  end
end
