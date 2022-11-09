class CreateCollectionSaves < ActiveRecord::Migration[6.1]
  def change
    create_table :collection_saves do |t|
      t.references :user, null: false, foreign_key: true
      t.references :collection, null: false, foreign_key: true

      t.timestamps
    end
  end
end
