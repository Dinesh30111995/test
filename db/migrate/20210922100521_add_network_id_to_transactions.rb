# frozen_string_literal: true

class AddNetworkIdToTransactions < ActiveRecord::Migration[6.1]
  def change
    add_column :transactions, :network_id, :integer
  end
end
