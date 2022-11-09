module FeedHelper
  def attachment_type(collection)
    attachment = collection.attachment
    if %w[audio/mp3 audio/webm audio/mpeg].include?(attachment.content_type)
      'audio'
    elsif %w[video/mp4 video/webm].include?(attachment.content_type)
      'video'
    elsif %w[application/pdf].include?(attachment.content_type)
      'pdf'
    else
      'image'
    end
  end
end
