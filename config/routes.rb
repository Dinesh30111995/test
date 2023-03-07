Rails.application.routes.draw do

  resources :comments, except: %i[index update new edit show] do
    collection do
      post :like
      post :unlike
    end
  end

  resources :feed do
    collection do
      post :follow_unfollow
      get :load_more_button
      get :user_feed_load_more
      post :save_collection
      get :my_friends
      get :mentions
    end
  end

  namespace :admin do
    devise_for :admin_users, controllers: {
      sessions: 'admin/admin_users/sessions',
    }
    resources :users do
      collection do
        get :reports
      end

      member do
        get :collections
        get :approve
        get :deny
        get :enable
        get :verify
        put :update_collection
      end
    end
    resources :categories
    resources :fees
    resources :featured_users, except: %i[edit update]
    resources :featured_collections, except: %i[edit update]
    resources :edition_drops, except: [:edit, :update] do
      collection do
        post 'add'
      end
    end
    resources :reserve_drops, except: [:edit, :update] do
      collection do
        post 'add'
      end
    end
    resources :transactions, only: [:index]

    get 'dashboard', to: 'dashboard#index'
    get 'change_network', to: 'dashboard#change_network'
    root to: 'dashboard#index'
  end

  resources :users, except: %i[index create destroy] do
    collection do
      get :following
      get :follow
      get :unfollow
      get :load_tabs
      post :like
      post :unlike
      get :following_followers
      post :bid
      post :report
      post :create_contract
      post :moon_pay, path: 'moon-pay'
    end
  end
  resources :collections, only: %i[new show create] do
    member do
      get :remove_from_sale
      get :fetch_details
      get :fetch_transfer_user
      get :fetch_swap_details
      post :bid
      post :buy
      post :sell
      post :update_token_id
      post :change_price
      post :transfer_token
      post :sign_metadata_hash
      post :sign_metadata_with_creator
      post :sign_fixed_price
      post :approve
      post :owner_transfer
      post :burn
      post :swap_request
      post :approve_swap
      post :verify_swap
      post :reject_swap
      post :save_contract_nonce_value
      post :get_nonce_value
      post :save_nonce_value
      post :get_contract_sign_nonce
      post :delivery_details
    end
  end

  resources :sessions, only: %i[create destroy] do
    collection do
      get :valid_user
    end
  end
  resources :likes, only: %i[create update]
  resources :bids
  resources :fees

  ### CUSTOM ROUTES
  get 'dashboard', to: 'dashboard#index'
  # get 'category', to: 'dashboard#category'
  get 'top_buy_sell', to: 'dashboard#top_buyers_and_sellers'
  get 'my_items', to: 'users#my_items'
  get 'activities', to: 'activities#index'
  get 'load_more_activities', to: 'activities#load_more'
  get 'search', to: 'dashboard#search'
  get 'search/hash-tags/:hash_tag', to: 'dashboard#search_hash_tag', as: 'search_hash_tag'
  get 'edition_drops', to: 'dashboard#edition_drops'
  get 'reserve_drops', to: 'dashboard#reserve_drops'
  get 'notifications', to: 'dashboard#notifications'
  get 'contract_abi', to: 'dashboard#contract_abi'
  get 'category_filter', to: 'dashboard#set_categories_by_filter'
  get 'gas_price', to: 'dashboard#gas_price'
  get 'change_network', to: 'dashboard#change_network'

  ### STATIC PAGES
  get 'about', to: 'static#about'
  get 'airdrop', to: 'static#airdrop'
  get 'faq', to: 'static#faq'
  get 'terms_conditions', to: 'static#terms_conditions'
  get 'privacy', to: 'static#privacypolicy'
  get 'faq-detail', to: 'static#faq_detail'

  get 'feedstatic', to: 'static#feed'

  ### ROOT PAGE
  root to: "dashboard#index"

  ### THIRD-PARTY ROUTES
  require 'sidekiq/web'
  mount Sidekiq::Web => '/sidekiq'
end
