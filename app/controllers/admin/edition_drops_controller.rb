class Admin::EditionDropsController < Admin::BaseController

  def index
    @edition_drops = EditionDrop.joins(:collection).where(collections: {published: true}).paginate(page: params[:page], per_page: 10)
  end

  def new
    per_page=25
    reserve_drops = ReserveDrop.pluck(:collection_id)
    @collections = params[:query].present? ? Collection.search("*#{params[:query].strip}*").records : Collection.all
    @collections = @collections.where(:collection_type=>"single")
    @collections = @collections.where.not(id: reserve_drops).on_instant_sale.by_published.not_timed_auctions.paginate(per_page: per_page, page: params[:page] || 1)
  end

  def add
    col_ids =  params[:edition_drop][:collection_ids].split(',')
    existing_cols = EditionDrop.where(:collection_id=>col_ids).count
    begin
      if col_ids.length > 0 and existing_cols == 0 and params[:edition_drop][:expires_in].present? and params[:edition_drop][:starts_at].present?
        cols =col_ids.map {|ff| {:collection_id => ff, :expires_in => params[:edition_drop][:expires_in] ,
          :created_at=>Time.now,:updated_at=>Time.now, :starts_at => params[:edition_drop][:starts_at]}}
        bulk_insert = EditionDrop.insert_all(cols)
      else
        bulk_insert = nil
      end
    rescue
      bulk_insert = nil
    end
    respond_to do |format|
      format.html { redirect_to :admin_edition_drops, notice:  bulk_insert ?  'Added successfully' : "The action is failed due to presence of duplicate collections or invalid entries." }
      format.json { head :no_content }
    end
  end

  def remove
  end

  def destroy
    edition_drop = EditionDrop.find(params[:id])
    edition_drop.destroy

    respond_to do |format|
      format.html { redirect_to admin_edition_drops_url, notice: "Edition Drop was successfully destroyed." }
      format.json { head :no_content }
    end
  end

  private

  def edition_drop_params
    params.require(:edition_drop).permit(:collection_ids,:expires_in,:start_at)
  end
end
