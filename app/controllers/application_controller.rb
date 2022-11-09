class ApplicationController < ActionController::Base
  before_action :set_network
  prepend_before_action :authenticate_user
  before_action :is_approved
  before_action :set_locale
  before_action :set_base_gon
  before_action :set_token_address
  # before_action :authenticate_user, except: [:show]

  helper_method :current_user, :current_balance, :service_fee, :gon, :all_currency_price
  DEFAULT_NETWORK_CHAIN_ID = 4


  private

  def current_user
    return if session[:user_id].blank?

    @current_user ||= User.find_by(id: session[:user_id])
    User.current_user = @current_user
  end

  def current_balance
    @current_balance ||= session[:balance]
  end

  def service_fee
    Fee.default_service_fee
  end

  def set_network
    network = Network.find_by(chain_id: cookies[:chain_id].to_i)
    if network.nil?
      network = Network.find_by(chain_id: DEFAULT_NETWORK_CHAIN_ID)
      cookies[:chain_id] = network.chain_id
    end
    Current.network = network
  end

  def set_locale
    if params[:locale] || cookies['locale'].nil?
      I18n.locale = params[:locale] || I18n.default_locale
      cookies['locale'] = I18n.locale
    else
      I18n.locale = cookies['locale']
    end
    @locale = I18n.locale 
  end

  def authenticate_user
    redirect_to root_path, alert: 'Please connect your wallet to proceed.' unless current_user
  end

  def is_approved
    redirect_to root_path, alert: 'Pending for admin approval.' unless current_user&.is_approved
  end

  def set_base_gon
    gon.session = current_user.present?
  end

  def set_token_address
    gon.transferProxyContractAddress = Settings.send("#{Current.network.short_name}").transferProxyContractAddress;
    gon.tokenAddress = Settings.send("#{Current.network.short_name}").tokenAddress;
    gon.tradeContractAddress = Settings.send("#{Current.network.short_name}").tradeContractAddress;
    gon.tokenURIPrefix = Settings.send("#{Current.network.short_name}").tokenURIPrefix;
    gon.tokenSymbol = Settings.send("#{Current.network.short_name}").tokenSymbol;
  end

  def all_currency_price
    @token_prices = Rails.cache.fetch '#all_currency_price', expires_in: 1.minutes do
      Api::Etherscan.get_all_price
    end
  end
end
