class CreateSwapsTable < ActiveRecord::Migration[6.1]
  def change
    create_table :swaps do |t|
      t.integer :requestor_id
      t.integer :owner_id
      t.integer :requestor_collection_id
      t.integer :owner_collection_id
      t.integer :requestor_quantity, default: 1
      t.integer :owner_quantity, default: 1
      t.integer :state
      t.string :signature
      t.string :transaction_hash

      t.timestamps
    end
  end
end
