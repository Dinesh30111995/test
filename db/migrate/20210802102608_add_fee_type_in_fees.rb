class AddFeeTypeInFees < ActiveRecord::Migration[6.1]
  def change
    add_column :fees, :fee_type, :integer
  end
end
