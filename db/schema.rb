# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 2022_01_28_082007) do

  create_table "active_storage_attachments", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "name", null: false
    t.string "record_type", null: false
    t.bigint "record_id", null: false
    t.bigint "blob_id", null: false
    t.datetime "created_at", null: false
    t.index ["blob_id"], name: "index_active_storage_attachments_on_blob_id"
    t.index ["record_type", "record_id", "name", "blob_id"], name: "index_active_storage_attachments_uniqueness", unique: true
  end

  create_table "active_storage_blobs", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "key", null: false
    t.string "filename", null: false
    t.string "content_type"
    t.text "metadata"
    t.string "service_name", null: false
    t.bigint "byte_size", null: false
    t.string "checksum", null: false
    t.datetime "created_at", null: false
    t.index ["key"], name: "index_active_storage_blobs_on_key", unique: true
  end

  create_table "active_storage_variant_records", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.string "variation_digest", null: false
    t.index ["blob_id", "variation_digest"], name: "index_active_storage_variant_records_uniqueness", unique: true
  end

  create_table "admin_users", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.string "first_name"
    t.string "last_name"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["email"], name: "index_admin_users_on_email", unique: true
    t.index ["reset_password_token"], name: "index_admin_users_on_reset_password_token", unique: true
  end

  create_table "bids", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.integer "user_id"
    t.integer "collection_id"
    t.datetime "register_date"
    t.boolean "is_active"
    t.integer "state"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.integer "owner_id"
    t.string "sign"
    t.decimal "amount", precision: 32, scale: 16
    t.integer "erc20_token_id"
    t.integer "quantity", default: 1
    t.decimal "amount_with_fee", precision: 32, scale: 16
  end

  create_table "categories", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "name"
    t.boolean "is_active", default: true
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
  end

  create_table "collection_hash_tags", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.bigint "collection_id", null: false
    t.bigint "hash_tag_id", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["collection_id"], name: "index_collection_hash_tags_on_collection_id"
    t.index ["hash_tag_id"], name: "index_collection_hash_tags_on_hash_tag_id"
  end

  create_table "collection_saves", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.bigint "collection_id", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["collection_id"], name: "index_collection_saves_on_collection_id"
    t.index ["user_id"], name: "index_collection_saves_on_user_id"
  end

  create_table "collections", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "address", null: false
    t.string "name"
    t.text "description"
    t.boolean "put_on_sale"
    t.decimal "instant_sale_price", precision: 32, scale: 16
    t.boolean "unlock_on_purchase", default: false
    t.integer "collection_type"
    t.string "category"
    t.integer "position", default: 1
    t.integer "no_of_copies", default: 1
    t.string "image_hash"
    t.string "metadata_hash"
    t.bigint "creator_id"
    t.bigint "owner_id"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.json "config"
    t.json "data"
    t.decimal "royalty", precision: 10, default: "0"
    t.boolean "is_active", default: true
    t.string "token"
    t.integer "state"
    t.bigint "nft_contract_id"
    t.string "sign_instant_sale_price"
    t.string "unlock_description"
    t.integer "owned_tokens"
    t.bigint "erc20_token_id"
    t.boolean "instant_sale_enabled", default: false
    t.decimal "min_bid_price", precision: 10
    t.bigint "min_bid_erc20_token_id"
    t.string "transaction_hash"
    t.boolean "timed_auction_enabled", default: false
    t.decimal "minimum_bid", precision: 32, scale: 16
    t.integer "bid_time"
    t.integer "bid_time_opt"
    t.datetime "start_time"
    t.datetime "end_time"
    t.integer "network_id"
    t.boolean "delivery_on_purchase", default: false
    t.string "delivery_details"
    t.index ["creator_id"], name: "index_collections_on_creator_id"
    t.index ["erc20_token_id"], name: "index_collections_on_erc20_token_id"
    t.index ["nft_contract_id"], name: "index_collections_on_nft_contract_id"
    t.index ["owner_id"], name: "index_collections_on_owner_id"
  end

  create_table "comment_likes", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.bigint "comment_id", null: false
    t.bigint "user_id", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["comment_id"], name: "index_comment_likes_on_comment_id"
    t.index ["user_id"], name: "index_comment_likes_on_user_id"
  end

  create_table "comments", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.text "message"
    t.bigint "user_id", null: false
    t.bigint "collection_id", null: false
    t.bigint "parent_id"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["collection_id"], name: "index_comments_on_collection_id"
    t.index ["parent_id"], name: "index_comments_on_parent_id"
    t.index ["user_id"], name: "index_comments_on_user_id"
  end

  create_table "contract_nonce_verifies", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "contract_sign_address"
    t.string "contract_sign_nonce"
    t.integer "network_id"
    t.string "user_address"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
  end

  create_table "edition_drops", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.bigint "collection_id", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.datetime "starts_at"
    t.datetime "expires_in"
    t.index ["collection_id"], name: "index_edition_drops_on_collection_id"
  end

  create_table "erc20_tokens", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "address"
    t.string "chain_id"
    t.string "name"
    t.string "symbol"
    t.integer "decimals"
    t.boolean "active", default: true
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.integer "network_id"
  end

  create_table "featured_collections", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.bigint "collection_id", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["collection_id"], name: "index_featured_collections_on_collection_id"
  end

  create_table "featured_users", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["user_id"], name: "index_featured_users_on_user_id"
  end

  create_table "fees", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "name"
    t.string "price"
    t.string "per_mile"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.integer "fee_type"
  end

  create_table "follows", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.integer "follower_id", null: false
    t.integer "followee_id", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
  end

  create_table "hash_tags", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "name"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
  end

  create_table "likes", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.bigint "collection_id", null: false
    t.bigint "user_id", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["collection_id"], name: "index_likes_on_collection_id"
    t.index ["user_id"], name: "index_likes_on_user_id"
  end

  create_table "nft_contracts", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "name"
    t.string "symbol"
    t.string "address"
    t.integer "contract_type"
    t.bigint "owner_id"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.integer "network_id"
    t.index ["owner_id"], name: "index_nft_contracts_on_owner_id"
  end

  create_table "notifications", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.bigint "from_user_id"
    t.bigint "to_user_id"
    t.text "message"
    t.text "redirect_path"
    t.boolean "is_read", default: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.text "image_url"
    t.integer "network_id"
    t.index ["from_user_id"], name: "index_notifications_on_from_user_id"
    t.index ["to_user_id"], name: "index_notifications_on_to_user_id"
  end

  create_table "report_users", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.text "message"
    t.bigint "created_by_id", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["created_by_id"], name: "index_report_users_on_created_by_id"
    t.index ["user_id"], name: "index_report_users_on_user_id"
  end

  create_table "reserve_drops", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.bigint "collection_id", null: false
    t.datetime "expires_in"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.decimal "min_bid_price", precision: 32, scale: 12
    t.bigint "min_bid_erc20_token_id"
    t.datetime "starts_at"
    t.index ["collection_id"], name: "index_reserve_drops_on_collection_id"
  end

  create_table "swaps", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.integer "requestor_id"
    t.integer "owner_id"
    t.integer "requestor_collection_id"
    t.integer "owner_collection_id"
    t.integer "requestor_quantity", default: 1
    t.integer "owner_quantity", default: 1
    t.integer "state"
    t.string "signature"
    t.string "transaction_hash"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
  end

  create_table "transactions", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.integer "buyer_id"
    t.integer "seller_id"
    t.integer "collection_id"
    t.string "currency"
    t.string "currency_type"
    t.integer "channel"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.integer "network_id"
  end

  create_table "users", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "address"
    t.boolean "is_verified"
    t.string "name"
    t.text "bio"
    t.string "twitter_link"
    t.string "personal_url"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.boolean "is_active", default: true
    t.boolean "is_approved", default: false
  end

  create_table "versions", charset: "utf8mb4", collation: "utf8mb4_general_ci", force: :cascade do |t|
    t.string "item_type", limit: 191, null: false
    t.bigint "item_id", null: false
    t.string "event", null: false
    t.string "whodunnit"
    t.text "object", size: :long
    t.datetime "created_at"
    t.datetime "fractional seconds precision"
    t.text "object_changes", size: :long
    t.index ["item_type", "item_id"], name: "index_versions_on_item_type_and_item_id"
  end

  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id"
  add_foreign_key "active_storage_variant_records", "active_storage_blobs", column: "blob_id"
  add_foreign_key "collection_hash_tags", "collections"
  add_foreign_key "collection_hash_tags", "hash_tags"
  add_foreign_key "collection_saves", "collections"
  add_foreign_key "collection_saves", "users"
  add_foreign_key "collections", "erc20_tokens"
  add_foreign_key "collections", "nft_contracts"
  add_foreign_key "collections", "users", column: "creator_id"
  add_foreign_key "collections", "users", column: "owner_id"
  add_foreign_key "comment_likes", "comments"
  add_foreign_key "comment_likes", "users"
  add_foreign_key "comments", "collections"
  add_foreign_key "comments", "users"
  add_foreign_key "edition_drops", "collections"
  add_foreign_key "featured_collections", "collections"
  add_foreign_key "featured_users", "users"
  add_foreign_key "likes", "collections"
  add_foreign_key "likes", "users"
  add_foreign_key "nft_contracts", "users", column: "owner_id"
  add_foreign_key "notifications", "users", column: "from_user_id"
  add_foreign_key "notifications", "users", column: "to_user_id"
  add_foreign_key "report_users", "users"
  add_foreign_key "report_users", "users", column: "created_by_id"
  add_foreign_key "reserve_drops", "collections"
end
