class HashTag < ApplicationRecord
    has_many :collection_hash_tags
    has_many :collections, through: :collection_hash_tags

    def self.create_hash_tags(text, collection_id)
        text.to_s.scan(/#\w+/).uniq.each do |name|
            find_or_create_by(name: name.gsub("#", ""))
                .collection_hash_tags
                .create(collection_id: collection_id)
            
            text = markdown_string text, name 
        end
        text
    end

    def self.markdown_string(text, hash_tag)
        url = Rails.application.routes.url_helpers.search_hash_tag_path hash_tag.gsub("#", "")
        text.gsub(/#{hash_tag}/i, "[**#{hash_tag}**](#{url})")
    end
end
