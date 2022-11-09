class AddingColumnsInReserveDrop < ActiveRecord::Migration[6.1]
  def change
    add_column :reserve_drops, :min_bid_price, :decimal, :precision => 32, :scale => 12
    add_column :reserve_drops, :min_bid_erc20_token_id, :bigint
    add_column :reserve_drops, :starts_at, :datetime
  end
end