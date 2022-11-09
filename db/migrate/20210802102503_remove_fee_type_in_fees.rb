class RemoveFeeTypeInFees < ActiveRecord::Migration[6.1]
  def change
    remove_column :fees, :fee_type
  end
end
