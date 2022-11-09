class Mention    
    def self.all(letters = nil)
      return Mention.none unless letters.present?
      users = User.limit(10).where("name like ? OR address like ?", "#{letters}%", "#{letters}%").compact
      users.map do |user|
        { name: user.full_name }
      end
    end
  
    def self.create_from_text(comment)
        message = comment.message
        addresses = Nokogiri::HTML(message).search('user').uniq.map do |match|
            { 
                name: match.text.delete('@'), 
                address: match[:value], 
                text: match.to_s 
            }            
        end.compact

        users = User.where(address: addresses.pluck(:address)).all
        addresses.each do |mention_data|
            user = users.filter { |d| d.address == addresses.first[:address] }.first
            if user.present?
                message = markdown_string(message, mention_data[:text], mention_data[:name], user)
            end
        end
        comment.update!(message: ActionView::Base.full_sanitizer.sanitize(message))
    end
  
    def self.markdown_string(comment, replace_text, mention_name, user)
        url = Rails.application.routes.url_helpers.user_path user.address
        comment.gsub(/#{replace_text}/i, "[**@#{mention_name}**](#{url})")
    end
end
