class AddColumnDeliveryEmailToCollections < ActiveRecord::Migration[6.1]
  def change
    add_column :collections, :delivery_email, :string
  end
end
