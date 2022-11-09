class Admin::ReserveDropsController < Admin::BaseController

  def index
    @reserve_drops = ReserveDrop.joins(:collection).where(collections: {published: true}).paginate(page: params[:page], per_page: 10)
  end

  def new
    per_page=25
    edtion_drops = EditionDrop.pluck(:collection_id)
    @collections = params[:query].present? ? Collection.search("*#{params[:query].strip}*").records : Collection.all
    @collections = @collections.where(:collection_type=>"single")
    @collections = @collections.where.not(id: edtion_drops).on_sale.by_published.not_timed_auctions.paginate(per_page: per_page, page: params[:page] || 1)
  end

  def add
    col_ids =  params[:reserve_drop][:collection_ids].split(',')
    existing_cols = ReserveDrop.where(:collection_id=>col_ids).count
    begin
      if col_ids.length > 0 and existing_cols == 0 and params[:reserve_drop][:expires_in].present? and params[:reserve_drop][:starts_at].present? and params[:reserve_drop][:min_bid_price].present?
        cols =col_ids.map {|ff| {:collection_id => ff, :expires_in => params[:reserve_drop][:expires_in] ,
          :created_at=>Time.now,:updated_at=>Time.now, :starts_at => params[:reserve_drop][:starts_at], :min_bid_price => params[:reserve_drop][:min_bid_price], :min_bid_erc20_token_id => params[:reserve_drop][:min_bid_erc20_token_id]}}
        bulk_insert = ReserveDrop.insert_all(cols)
      else
        bulk_insert = nil
      end
    rescue
      bulk_insert = nil
    end
    respond_to do |format|
      format.html { redirect_to :admin_reserve_drops, notice: bulk_insert ? 'Added successfully' : "The action is failed due to presence of duplicate collections or invalid entries."}
      format.json { head :no_content }
    end
  end

  def remove
  end

  def destroy
    reserve_drop = ReserveDrop.find(params[:id])
    reserve_drop.destroy

    respond_to do |format|
      format.html { redirect_to admin_reserve_drops_url, notice: "Reserve Drop was successfully destroyed." }
      format.json { head :no_content }
    end
  end

  private

  def reserve_drop_params
    params.require(:reserve_drop).permit(:collection_ids,:expires_in, :start_at, :min_bid_price, :min_bid_erc20_token_id)
  end
end
