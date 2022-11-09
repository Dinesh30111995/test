class AddingColumnsInEditionDrop < ActiveRecord::Migration[6.1]
  def change
    add_column :edition_drops, :starts_at, :datetime
    add_column :edition_drops, :expires_in, :datetime
  end
end
