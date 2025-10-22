-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "google_id" TEXT NOT NULL,
    "profile_picture" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "last_login" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cities" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'Brasil',
    "slug" TEXT NOT NULL,
    "latitude" DECIMAL(10,8),
    "longitude" DECIMAL(11,8),
    "request_count" INTEGER NOT NULL DEFAULT 0,
    "is_popular" BOOLEAN NOT NULL DEFAULT false,
    "last_updated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "search_history" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "city_id" TEXT NOT NULL,
    "travel_start_date" DATE,
    "travel_end_date" DATE,
    "search_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip_address" TEXT,
    "user_agent" TEXT,

    CONSTRAINT "search_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "city_costs" (
    "id" TEXT NOT NULL,
    "city_id" TEXT NOT NULL,
    "transport_bus_min" DECIMAL(10,2),
    "transport_bus_max" DECIMAL(10,2),
    "transport_flight_min" DECIMAL(10,2),
    "transport_flight_max" DECIMAL(10,2),
    "accommodation_budget_min" DECIMAL(10,2),
    "accommodation_budget_max" DECIMAL(10,2),
    "accommodation_mid_min" DECIMAL(10,2),
    "accommodation_mid_max" DECIMAL(10,2),
    "accommodation_luxury_min" DECIMAL(10,2),
    "accommodation_luxury_max" DECIMAL(10,2),
    "food_budget_daily" DECIMAL(10,2),
    "food_mid_daily" DECIMAL(10,2),
    "currency" VARCHAR(3) NOT NULL DEFAULT 'BRL',
    "last_updated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source" TEXT,
    "notes" TEXT,

    CONSTRAINT "city_costs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "affiliate_clicks" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "city_id" TEXT NOT NULL,
    "partner" VARCHAR(100) NOT NULL,
    "partner_url" TEXT NOT NULL,
    "clicked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "converted" BOOLEAN NOT NULL DEFAULT false,
    "conversion_date" TIMESTAMP(3),
    "conversion_value" DECIMAL(10,2),
    "commission_earned" DECIMAL(10,2),
    "session_id" TEXT,
    "referrer" TEXT,

    CONSTRAINT "affiliate_clicks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_usage_logs" (
    "id" TEXT NOT NULL,
    "api_name" VARCHAR(100) NOT NULL,
    "endpoint" VARCHAR(255),
    "request_cost" DECIMAL(10,6),
    "tokens_used" INTEGER,
    "response_time_ms" INTEGER,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "city_id" TEXT,

    CONSTRAINT "api_usage_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_google_id_key" ON "users"("google_id");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_google_id_idx" ON "users"("google_id");

-- CreateIndex
CREATE UNIQUE INDEX "cities_slug_key" ON "cities"("slug");

-- CreateIndex
CREATE INDEX "cities_slug_idx" ON "cities"("slug");

-- CreateIndex
CREATE INDEX "cities_request_count_idx" ON "cities"("request_count" DESC);

-- CreateIndex
CREATE INDEX "cities_country_state_idx" ON "cities"("country", "state");

-- CreateIndex
CREATE INDEX "search_history_user_id_idx" ON "search_history"("user_id");

-- CreateIndex
CREATE INDEX "search_history_city_id_idx" ON "search_history"("city_id");

-- CreateIndex
CREATE INDEX "search_history_search_date_idx" ON "search_history"("search_date" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "city_costs_city_id_key" ON "city_costs"("city_id");

-- CreateIndex
CREATE INDEX "city_costs_city_id_idx" ON "city_costs"("city_id");

-- CreateIndex
CREATE INDEX "affiliate_clicks_user_id_idx" ON "affiliate_clicks"("user_id");

-- CreateIndex
CREATE INDEX "affiliate_clicks_city_id_idx" ON "affiliate_clicks"("city_id");

-- CreateIndex
CREATE INDEX "affiliate_clicks_partner_idx" ON "affiliate_clicks"("partner");

-- CreateIndex
CREATE INDEX "affiliate_clicks_converted_idx" ON "affiliate_clicks"("converted");

-- CreateIndex
CREATE INDEX "affiliate_clicks_clicked_at_idx" ON "affiliate_clicks"("clicked_at" DESC);

-- CreateIndex
CREATE INDEX "api_usage_logs_api_name_idx" ON "api_usage_logs"("api_name");

-- CreateIndex
CREATE INDEX "api_usage_logs_created_at_idx" ON "api_usage_logs"("created_at" DESC);

-- AddForeignKey
ALTER TABLE "search_history" ADD CONSTRAINT "search_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "search_history" ADD CONSTRAINT "search_history_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "cities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "city_costs" ADD CONSTRAINT "city_costs_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "cities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "affiliate_clicks" ADD CONSTRAINT "affiliate_clicks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "affiliate_clicks" ADD CONSTRAINT "affiliate_clicks_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "cities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "api_usage_logs" ADD CONSTRAINT "api_usage_logs_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "cities"("id") ON DELETE SET NULL ON UPDATE CASCADE;
