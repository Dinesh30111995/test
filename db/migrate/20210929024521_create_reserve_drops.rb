class CreateReserveDrops < ActiveRecord::Migration[6.1]
  def change
    create_table :reserve_drops do |t|
      t.references :collection, null: false, foreign_key: true
      t.datetime :expires_in
      t.timestamps
    end
  end
end