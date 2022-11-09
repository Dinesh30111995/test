class AddColumnPublishedToCollection < ActiveRecord::Migration[6.1]
  def change
    add_column :collections, :published, :boolean, default: false
  end
end
