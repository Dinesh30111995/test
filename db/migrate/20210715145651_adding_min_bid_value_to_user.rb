class AddingMinBidValueToUser < ActiveRecord::Migration[6.1]
  def change
    add_column :collections, :min_bid_price, :decimal
    add_column :collections, :min_bid_erc20_token_id, :bigint
  end
end
