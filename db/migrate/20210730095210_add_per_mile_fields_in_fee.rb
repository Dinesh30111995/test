class AddPerMileFieldsInFee < ActiveRecord::Migration[6.1]
  def change
    rename_column :fees, :percentage, :per_mile
  end
end
