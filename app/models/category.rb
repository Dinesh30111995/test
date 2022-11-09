class Category < ApplicationRecord
  default_scope -> { where(is_active: true) } 
  has_one_attached :attachment, dependent: :destroy
  IMAGE_SIZE = {icon:  {resize: "50x50"}, thumb: {resize: "100x100"}, banner: {resize: "400x400"}}

  def attachment_with_variant(size = nil)
    size.present? && IMAGE_SIZE[size].present? && attachment.content_type != "image/gif" ? attachment.variant(IMAGE_SIZE[size]) : attachment
  end
end
