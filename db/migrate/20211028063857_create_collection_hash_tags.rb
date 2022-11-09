class CreateCollectionHashTags < ActiveRecord::Migration[6.1]
  def change
    create_table :collection_hash_tags do |t|
      t.references :collection, null: false, foreign_key: true
      t.references :hash_tag, null: false, foreign_key: true

      t.timestamps
    end
  end
end
