# frozen_string_literal: true

class FeedController < ApplicationController
  # skip_before_action :authenticate_user, only: [:index]
  # skip_before_action :is_approved, only: [:index]
  before_action :set_user, only: [:follow_unfollow]
  before_action :set_collection, only: %i[index load_more_button]

  def index
    @categories = Category.all
  end

  def load_more_button
    type = params[:type]
    html = render_to_string partial: 'feed/asset_card_list'
    page = params[:page]
    page_present = @collections.next_page.present?
    next_page = load_more_button_feed_index_path(page: @collections.current_page + 1)
    render json: { html: html, page: page, page_present: page_present, next_page: next_page, type: type }
  end

  def create
    @collection = Collection.new(collection_params)
    @collection.creator_id = current_user.id
    @collection.owner_id = current_user.id
    @collection.address = Collection.generate_uniq_token
    @collection.state = :feed
    if @collection.valid?
      @collection.save
    else
      @errors = @collection.errors.full_messages
    end
  rescue Exception => e
    Rails.logger.warn '################## Exception while creating collection feed ##################'
    Rails.logger.warn "ERROR: #{e.message}, PARAMS: #{params.inspect}"
    Rails.logger.warn $ERROR_INFO.backtrace[0..20].join("\n")
    @errors = e.message
  end

  def follow_unfollow
    @card = params[:card] ||= false
    follow = Follow.where({ follower_id: current_user.id, followee_id: @user.id }).first
    if follow.present?
      follow.delete
      @status = 0
    else
      Follow.find_or_create_by({ follower_id: current_user.id, followee_id: @user.id })
      @status = 1
    end
  end

  def my_friends
    @users = current_user.followers.includes(attachment_attachment: :blob)
                         .paginate(page: params[:page])
    html = render_to_string partial: 'feed/user_list'
    page = params[:page]
    page_present = @users.next_page.present?
    next_page = my_friends_feed_index_path(page: @users.current_page + 1)
    render json: { html: html, page: page, page_present: page_present, next_page: next_page }
  end

  def user_feed_load_more
    user = User.find_by(address: params[:address])
    redirect_to root_path unless user.present?
    @collections = Collection.user_feed(user.id).paginate(page: params[:page] || 1, per_page: 10)
    all_currency_price
    load_more_button
  end

  def save_collection
    collection = Collection.find_by_address(params[:address])
    return '' if collection.nil?

    collection_save = CollectionSave.where(collection_id: collection.id, user_id: current_user.id).first
    if collection_save.nil?
      current_user.collection_save.create(collection_id: collection.id)
    else
      current_user.collection_save.where(collection_id: collection.id).destroy_all
    end
    render json: {
      status: collection_save.nil?,
      status_text: collection_save.nil? ? 'Collection Saved successfully' : 'Collection deleted successfully'
    }
  end

  def mentions
    respond_to do |format|
      query = params[:query] ||= ''
      format.json { render json: Mention.all(query) }
    end
  end

  private

  def set_collection
    type = params[:type]
    @collections = Collection.feed_query
    if type == 'favorites'
      @collections = @collections.where(id: current_user.likes.pluck(:collection_id))
    else
      @collections = @collections.where(owner_id: current_user.followees.pluck(:id))
    end
    @collections = @collections.paginate(page: params[:page] || 1, per_page: 10)

    all_currency_price
  end

  def set_user
    @user = User.find_by(address: params[:id])
    redirect_to root_path unless @user.present?
  end

  def collection_params
    params['collection']['category'] = ['feed']
    params.require(:collection)
          .permit(:name, :description, :attachment, :cover, :data, category: [])
  end
end
