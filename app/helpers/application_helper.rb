module ApplicationHelper
  def build_filter_path(activity_type, filters, current_filter, options={})
    new_filters = filters.clone || []
    final_filters = new_filters.include?(current_filter) ? new_filters.filter { |x| x != current_filter } : new_filters << current_filter
    if activity_type == "following"
      activities_path(activity_type: "following", filters: final_filters.uniq)
    elsif activity_type == "activity"
      activities_path(activity_type: "activity", filters: final_filters.uniq)
    elsif activity_type == "my_activity"
      if current_user&.address == options[:user_id]
        my_items_path(activity_type: "activity", filters: final_filters.uniq, tab: options[:tab], id: options[:user_id])
      else
        user_path(activity_type: "activity", filters: final_filters.uniq, tab: options[:tab], id: options[:user_id])
      end
    else
      activities_path(filters: final_filters.uniq)
    end
  end

  def is_filter_active(filters, current_filter)
    filters = filters || []
    'active' if filters.include?(current_filter)
  end

  def amt_with_service_fee(value)
    eval(value) + service_fee_for_value(value)
  end

  def service_fee_for_value(amt)
    return 0 unless amt.present?

    eval("#{amt} * #{service_fee} / 100").round(5) rescue 0
  end

  def service_fee_value(amt, service_fee)
    return 0 unless amt.present?
    BigDecimal.new(eval("#{amt} * #{service_fee} / 100").to_s) rescue 0
  end

  def toastr_flash(script = true)
    flash_messages = []
    flash.each do |type, message|
      message = message.join('<br/>') if message.is_a?(Array)
      type = 'success' if type == 'notice'
      type = 'error' if type == 'alert'
      toastr_flash = "toastr.#{type}(\"#{message}\", '', { closeButton: true, progressBar: true })"
      toastr_flash = "<script>#{toastr_flash}</script>" if script
      flash_messages << toastr_flash.html_safe if message
    end
    flash_messages.join("\n").html_safe
  end

  def custom_error_flash error, type = 'info', script = false
    message = error.is_a?(Array) ? error.join('<br/>') : error
    flash_messages = "toastr.#{type}(\"#{j(message)}\")"
    flash_messages = "<script type='text/javascript'>#{j(flash_messages)};</script>" if script
    flash_messages.html_safe
  end

  def collection_type_img collection
    collection.single? ? 'single_nft' : 'multiple_nft'
  end

  def current_url
    url_for :only_path => false
  end

  def collection_type contract_type='multiple'
    network_symbol = Rails.application.credentials.send(Current.network.short_name)[:stdToken]
    contract_type == 'multiple' ? "#{network_symbol}-1155" : "#{network_symbol}-721"
  end

  def boolean_str(value)
    value ? 'Yes' : 'No'
  end

  def number_to_kmb(number)
    number_to_human(number, format: '%n%u', units: { :thousand => 'K', :million => 'M', :billion => 'B' })
  end

  def markdown(text)
    renderer = Redcarpet::Render::SmartyHTML.new(filter_html: true, 
                                                 hard_wrap: true, 
                                                 prettify: true, link_attributes: { target: '_blank' })
    markdown = Redcarpet::Markdown.new(renderer, markdown_layout)
    markdown.render(sanitize(text)).html_safe
  end
  
  def markdown_layout
    { autolink: true, space_after_headers: true, no_intra_emphasis: true,
      tables: true, strikethrough: true, highlight: true, quote: true,
      fenced_code_blocks: true, disable_indented_code_blocks: true,
      lax_spacing: true }
  end
end
