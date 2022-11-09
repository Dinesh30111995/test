class SessionsController < ApplicationController
  skip_before_action :authenticate_user, only: [:create, :valid_user]
  skip_before_action :is_approved

  def create
    destroy_session if ActiveModel::Type::Boolean.new.cast(params[:destroy_session])
    user = User.find_or_create_by(address: params[:address])
    default_address = Rails.application.credentials.config[:default_user_follow_address]
    
    if default_address.present? && default_address.downcase != params[:address].downcase
      default_follower = User.find_by_address(default_address)
      default_follower.present? ? user.followed_users.find_or_create_by({ followee_id: default_follower.id }) : ''
    end

    session[:user_id] = user.id if user.present?
    session[:wallet] = params[:wallet]
    session[:balance] = params[:balance]
    render json: user.as_json, message: "Successfully Logged in"
  end

  def destroy
    destroy_session
    render json: {}, message: "Successfully Session destroyed"
  end

  def destroy_session
    cookies["_rarible_session"] = nil
    cookies.delete "_rarible_session"
    User.current_user = nil
    reset_session
  end

  def valid_user
    user = User.find_by_address(params[:address])
    render json: {user_exists: user.present?}, message: "Successfully validated"
  end
end
