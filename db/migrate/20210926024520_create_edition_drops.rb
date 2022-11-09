class CreateEditionDrops < ActiveRecord::Migration[6.1]
  def change
    create_table :edition_drops do |t|
      t.references :collection, null: false, foreign_key: true

      t.timestamps
    end
  end
end
