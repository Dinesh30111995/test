class AddDeliveryColumnsToCollection < ActiveRecord::Migration[6.1]
  def change
    add_column :collections, :delivery_on_purchase, :boolean, default: false
    add_column :collections, :delivery_details, :string
  end
end
