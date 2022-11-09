class EditionDrop < ApplicationRecord
  belongs_to :collection
  validates_uniqueness_of :collection_id
end
