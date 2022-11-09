# frozen_string_literal: true

class Comment < ApplicationRecord
  belongs_to :user
  belongs_to :collection
  # belongs_to :parent, class_name: 'Comment', validate: false
  has_many :comment_likes, counter_cache: true
  scope :user_with_likes, -> { includes(%i[user comment_likes]) }

  after_create :add_mentions
  after_create :create_hash_tags

  def create_hash_tags
    update!(message: ActionView::Base.full_sanitizer.sanitize(HashTag.create_hash_tags(message, collection_id)))
  end

  def add_mentions
    Mention.create_from_text(self)
  end
  
  def self.comments_row(collection)
    collection
      .comments
      .filter { |d| d.parent_id.nil? }
    # .sort_by(&:id)
  end

  def self.comment_sub_row(comments, parent_id)
    comments.filter { |d| d.parent_id == parent_id }
  end
end
