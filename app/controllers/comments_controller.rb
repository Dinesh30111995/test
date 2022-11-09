# frozen_string_literal: true

class CommentsController < ApplicationController
  before_action :set_comment, only: %i[show edit update]

  # GET /comments or /comments.jsonp
  # def index
  #   @comments = Comment.all
  # end

  # GET /comments/1 or /comments/1.json
  # def show; end

  # GET /comments/new
  # def new
  #   @comment = Comment.new
  # end

  # GET /comments/1/edit
  # def edit; end

  # POST /comments or /comments.json
  def create
    data = comment_params
    collection = Collection.find_by_address(data[:collection])
    if (data[:parent_id].present? && fetch_comment(data[:parent_id]).nil?) || collection.nil?
      return respond_to do |format|
        error format
      end
    end

    data[:collection_id] = collection.id
    @comment = Comment.new(data.permit(:message, :collection_id, :parent_id, :user_id))

    respond_to do |format|
      if @comment.save
        notify(collection)
        @comment.user = current_user
        @comment.comment_likes = CommentLike.where(comment_id: @comment.id).all
        html = render_to_string partial: 'comments/comment_reply_row', locals: {
          comment: @comment,
          collection: collection,
        }

        format.json do
          render json: {
            html: html,
            count: collection.comments.count
          }
        end
      else
        error format
      end
    end
  end

  # PATCH/PUT /comments/1 or /comments/1.json
  # def update
  #   respond_to do |format|
  #     if @comment.update(comment_params)
  #       format.html { redirect_to @comment, notice: 'Comment was successfully updated.' }
  #       format.json { render :show, status: :ok, location: @comment }
  #     else
  #       format.html { render :edit, status: :unprocessable_entity }
  #       format.json { render json: @comment.errors, status: :unprocessable_entity }
  #     end
  #   end
  # end

  # DELETE /comments/1 or /comments/1.json
  def destroy
    user = current_user
    id = params[:id]
    comment = Comment.where({ id: id, user_id: user.id }).first

    if comment.nil?
      return respond_to do |format|
        format.html { redirect_to comments_url, notice: 'unable to delete.' }
        format.json { render json: { status: 0, text: 'unable to delete.' } }
      end
    end
    comment.destroy
    recursive_delete id
    comment_count = Comment.where({ collection_id: comment.collection_id }).count
    respond_to do |format|
      format.html { redirect_to comments_url, notice: 'Comment was successfully deleted.' }
      format.json { render json: { status: 1, text: 'Comment was successfully deleted.', count: comment_count } }
    end
  end

  def recursive_delete(id)
    comments = Comment.select(:id).where({ parent_id: id }).all
    
    if comments.present?
      Comment.where({ parent_id: id }).delete_all
      comments.each do |comment|
        recursive_delete comment.id
      end
    end
  end

  def like
    comments = Comment.find(params[:comment_id])
    return un_authorized_user if comments.blank?

    status = CommentLike.find_or_create_by(
      user_id: current_user.id,
      comment_id: params[:comment_id]
    )

    render json: { success: status.present? }
  end

  def unlike
    CommentLike.destroy_by(user_id: current_user.id, comment_id: params[:comment_id])
  end

  private

  def un_authorized_user
    render json: 'Unauthorized', status: 403
  end

  def notify(collection)
    return if collection.owner_id == current_user.id

    message = I18n.t(
      'notifications.commented',
      user_name: current_user.full_name,
      collection_name: collection.name
    )
    image_url = Notification.collection_image_url(collection)
    param = {
      from_user: current_user.id,
      to_user: collection.owner_id,
      message: message,
      path: "/collections/#{collection.address}",
      image_url: image_url
    }
    Notification.create_notification param
  end

  # Use callbacks to share common setup or constraints between actions.
  def set_comment
    @comment = fetch_comment
  end

  def fetch_comment(id = nil)
    id = params[:id] || id
    Comment.find(id)
  end

  def error(format)
    format.html { render :new, status: :unprocessable_entity }
    format.json { render json: @comment.errors, status: :unprocessable_entity }
  end

  # Only allow a list of trusted parameters through.
  def comment_params
    # :user_id
    params.require(:comment)
          .permit(:message, :collection, :parent_id)
          .merge(user_id: current_user.id)
  end
end
