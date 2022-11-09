class RenameCommentColumnToMessage < ActiveRecord::Migration[6.1]
  def change
    change_table :comments do |t|
      t.rename :comment, :message
    end

  end
end
