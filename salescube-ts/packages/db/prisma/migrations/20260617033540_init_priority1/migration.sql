-- CreateEnum
CREATE TYPE "SalesType" AS ENUM ('SALES', 'NEWS', 'WEB');

-- CreateEnum
CREATE TYPE "SlipStatus" AS ENUM ('DRAFT', 'FINALIZED', 'CLOSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('DRAFT', 'ISSUED', 'PARTIALLY_PAID', 'PAID', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TaxShift" AS ENUM ('INCLUDED', 'EXCLUDED');

-- CreateEnum
CREATE TYPE "Fraction" AS ENUM ('FLOOR', 'CEIL', 'ROUND');

-- CreateEnum
CREATE TYPE "PaybackCycle" AS ENUM ('CURRENT_MONTH', 'NEXT_MONTH', 'AFTER_NEXT_MONTH', 'MONTHS_3');

-- CreateEnum
CREATE TYPE "DepositMethod" AS ENUM ('CASH', 'TRANSFER', 'CHECK', 'AUTO_DEBIT', 'CARD', 'OTHER');

-- CreateEnum
CREATE TYPE "TaxCategory" AS ENUM ('STANDARD', 'REDUCED', 'EXEMPT');

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "name_kana" TEXT,
    "password_hash" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "department_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "department" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "parent_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permission" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_role" (
    "user_id" TEXT NOT NULL,
    "role_id" TEXT NOT NULL,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_role_pkey" PRIMARY KEY ("user_id","role_id")
);

-- CreateTable
CREATE TABLE "role_permission" (
    "role_id" TEXT NOT NULL,
    "permission_id" TEXT NOT NULL,

    CONSTRAINT "role_permission_pkey" PRIMARY KEY ("role_id","permission_id")
);

-- CreateTable
CREATE TABLE "customer" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "name_kana" TEXT,
    "abbr" TEXT,
    "office_name" TEXT,
    "office_name_kana" TEXT,
    "department_name" TEXT,
    "zip_code" TEXT,
    "address1" TEXT,
    "address2" TEXT,
    "contact_name" TEXT,
    "contact_name_kana" TEXT,
    "contact_salutation" TEXT,
    "contact_title" TEXT,
    "phone" TEXT,
    "fax" TEXT,
    "email" TEXT,
    "url" TEXT,
    "business_category" TEXT,
    "rank_category" TEXT,
    "tax_shift" "TaxShift" NOT NULL DEFAULT 'EXCLUDED',
    "tax_fraction" "Fraction" NOT NULL DEFAULT 'FLOOR',
    "price_fraction" "Fraction" NOT NULL DEFAULT 'FLOOR',
    "cutoff_group" TEXT,
    "cutoff_day" INTEGER,
    "payback_cycle" "PaybackCycle" NOT NULL DEFAULT 'NEXT_MONTH',
    "discount_rate" DECIMAL(8,6),
    "credit_limit" DECIMAL(18,4),
    "bank_code" TEXT,
    "bank_name" TEXT,
    "bank_branch_name" TEXT,
    "bank_account_type" TEXT,
    "bank_account_no" TEXT,
    "bank_account_holder" TEXT,
    "first_sales_date" TIMESTAMP(3),
    "last_sales_date" TIMESTAMP(3),
    "in_charge_user_id" TEXT,
    "remarks" TEXT,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supplier" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "name_kana" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "address1" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "supplier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "name_kana" TEXT,
    "jan_code" TEXT,
    "sales_type" "SalesType" NOT NULL DEFAULT 'SALES',
    "tax_category" "TaxCategory" NOT NULL DEFAULT 'STANDARD',
    "unit" TEXT,
    "pack_quantity" INTEGER,
    "cost_price" DECIMAL(18,4),
    "retail_price" DECIMAL(18,4),
    "web_price" DECIMAL(18,4),
    "weight_gram" DOUBLE PRECISION,
    "width_mm" DOUBLE PRECISION,
    "height_mm" DOUBLE PRECISION,
    "depth_mm" DOUBLE PRECISION,
    "safety_stock" INTEGER,
    "max_stock" INTEGER,
    "lead_time_days" INTEGER,
    "fraction" "Fraction" NOT NULL DEFAULT 'FLOOR',
    "supplier_id" TEXT,
    "category1" TEXT,
    "category2" TEXT,
    "category3" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "discard_date" TIMESTAMP(3),
    "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_price_history" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "price_type" TEXT NOT NULL,
    "price" DECIMAL(18,4) NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT,

    CONSTRAINT "product_price_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tax_rate" (
    "id" TEXT NOT NULL,
    "category" "TaxCategory" NOT NULL,
    "rate" DECIMAL(8,6) NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tax_rate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales_order" (
    "id" TEXT NOT NULL,
    "order_no" TEXT NOT NULL,
    "status" "SlipStatus" NOT NULL DEFAULT 'DRAFT',
    "sales_type" "SalesType" NOT NULL DEFAULT 'SALES',
    "customer_id" TEXT NOT NULL,
    "customer_name_snapshot" TEXT NOT NULL,
    "customer_code_snapshot" TEXT NOT NULL,
    "in_charge_user_id" TEXT,
    "in_charge_name" TEXT,
    "order_date" DATE NOT NULL,
    "delivery_date" DATE,
    "cutoff_date" DATE,
    "delivery_name" TEXT,
    "delivery_zip_code" TEXT,
    "delivery_address_1" TEXT,
    "delivery_address_2" TEXT,
    "delivery_phone" TEXT,
    "tax_shift" "TaxShift" NOT NULL DEFAULT 'EXCLUDED',
    "tax_fraction" "Fraction" NOT NULL DEFAULT 'FLOOR',
    "price_fraction" "Fraction" NOT NULL DEFAULT 'FLOOR',
    "subtotal" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "tax_amount" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "total_amount" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "gross_margin" DECIMAL(18,4),
    "remarks" TEXT,
    "invoice_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,
    "finalized_at" TIMESTAMP(3),
    "cancelled_at" TIMESTAMP(3),

    CONSTRAINT "sales_order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales_order_line" (
    "id" TEXT NOT NULL,
    "sales_order_id" TEXT NOT NULL,
    "line_no" INTEGER NOT NULL,
    "product_id" TEXT,
    "product_code" TEXT,
    "product_name" TEXT NOT NULL,
    "description" TEXT,
    "quantity" DECIMAL(18,4) NOT NULL,
    "unit" TEXT,
    "unit_price" DECIMAL(18,4) NOT NULL,
    "unit_cost" DECIMAL(18,4),
    "tax_category" "TaxCategory" NOT NULL DEFAULT 'STANDARD',
    "tax_rate" DECIMAL(8,6) NOT NULL,
    "line_subtotal" DECIMAL(18,4) NOT NULL,
    "line_tax" DECIMAL(18,4) NOT NULL,
    "line_total" DECIMAL(18,4) NOT NULL,
    "remarks" TEXT,

    CONSTRAINT "sales_order_line_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoice" (
    "id" TEXT NOT NULL,
    "invoice_no" TEXT NOT NULL,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'DRAFT',
    "customer_id" TEXT NOT NULL,
    "customer_code_snapshot" TEXT NOT NULL,
    "customer_name_snapshot" TEXT NOT NULL,
    "bill_year" INTEGER NOT NULL,
    "bill_month" INTEGER NOT NULL,
    "cutoff_date" DATE NOT NULL,
    "issue_date" DATE,
    "due_date" DATE,
    "cutoff_group" TEXT,
    "tax_shift" "TaxShift" NOT NULL DEFAULT 'EXCLUDED',
    "opening_balance" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "received_amount" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "adjustment_amount" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "sales_amount" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "tax_amount" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "discount_amount" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "closing_balance" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "slip_count" INTEGER NOT NULL DEFAULT 0,
    "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,
    "issued_at" TIMESTAMP(3),
    "closed_at" TIMESTAMP(3),
    "cancelled_at" TIMESTAMP(3),

    CONSTRAINT "invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoice_line" (
    "id" TEXT NOT NULL,
    "invoice_id" TEXT NOT NULL,
    "line_no" INTEGER NOT NULL,
    "sales_order_id" TEXT,
    "description" TEXT NOT NULL,
    "quantity" DECIMAL(18,4) NOT NULL,
    "unit_price" DECIMAL(18,4) NOT NULL,
    "tax_category" "TaxCategory" NOT NULL DEFAULT 'STANDARD',
    "tax_rate" DECIMAL(8,6) NOT NULL,
    "line_subtotal" DECIMAL(18,4) NOT NULL,
    "line_tax" DECIMAL(18,4) NOT NULL,
    "line_total" DECIMAL(18,4) NOT NULL,

    CONSTRAINT "invoice_line_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deposit" (
    "id" TEXT NOT NULL,
    "deposit_no" TEXT NOT NULL,
    "status" "SlipStatus" NOT NULL DEFAULT 'DRAFT',
    "customer_id" TEXT NOT NULL,
    "customer_code_snapshot" TEXT NOT NULL,
    "customer_name_snapshot" TEXT NOT NULL,
    "deposit_date" DATE NOT NULL,
    "method" "DepositMethod" NOT NULL DEFAULT 'TRANSFER',
    "total_amount" DECIMAL(18,4) NOT NULL,
    "allocated_amount" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "unallocated_amount" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "bank_code" TEXT,
    "bank_name" TEXT,
    "abstract" TEXT,
    "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,
    "closed_at" TIMESTAMP(3),
    "cancelled_at" TIMESTAMP(3),

    CONSTRAINT "deposit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deposit_line" (
    "id" TEXT NOT NULL,
    "deposit_id" TEXT NOT NULL,
    "line_no" INTEGER NOT NULL,
    "amount" DECIMAL(18,4) NOT NULL,
    "remarks" TEXT,

    CONSTRAINT "deposit_line_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_allocation" (
    "id" TEXT NOT NULL,
    "deposit_id" TEXT NOT NULL,
    "invoice_id" TEXT NOT NULL,
    "amount" DECIMAL(18,4) NOT NULL,
    "allocated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "allocated_by" TEXT,
    "remarks" TEXT,

    CONSTRAINT "payment_allocation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_code_key" ON "user"("code");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE INDEX "user_email_idx" ON "user"("email");

-- CreateIndex
CREATE INDEX "user_code_idx" ON "user"("code");

-- CreateIndex
CREATE UNIQUE INDEX "department_code_key" ON "department"("code");

-- CreateIndex
CREATE UNIQUE INDEX "role_code_key" ON "role"("code");

-- CreateIndex
CREATE UNIQUE INDEX "permission_code_key" ON "permission"("code");

-- CreateIndex
CREATE UNIQUE INDEX "customer_code_key" ON "customer"("code");

-- CreateIndex
CREATE INDEX "customer_name_idx" ON "customer"("name");

-- CreateIndex
CREATE INDEX "customer_name_kana_idx" ON "customer"("name_kana");

-- CreateIndex
CREATE INDEX "customer_code_idx" ON "customer"("code");

-- CreateIndex
CREATE UNIQUE INDEX "supplier_code_key" ON "supplier"("code");

-- CreateIndex
CREATE UNIQUE INDEX "product_code_key" ON "product"("code");

-- CreateIndex
CREATE INDEX "product_name_idx" ON "product"("name");

-- CreateIndex
CREATE INDEX "product_code_idx" ON "product"("code");

-- CreateIndex
CREATE INDEX "product_jan_code_idx" ON "product"("jan_code");

-- CreateIndex
CREATE INDEX "product_price_history_product_id_price_type_start_date_idx" ON "product_price_history"("product_id", "price_type", "start_date");

-- CreateIndex
CREATE UNIQUE INDEX "tax_rate_category_key" ON "tax_rate"("category");

-- CreateIndex
CREATE INDEX "tax_rate_category_start_date_idx" ON "tax_rate"("category", "start_date");

-- CreateIndex
CREATE UNIQUE INDEX "sales_order_order_no_key" ON "sales_order"("order_no");

-- CreateIndex
CREATE INDEX "sales_order_customer_id_order_date_idx" ON "sales_order"("customer_id", "order_date");

-- CreateIndex
CREATE INDEX "sales_order_status_idx" ON "sales_order"("status");

-- CreateIndex
CREATE INDEX "sales_order_order_date_idx" ON "sales_order"("order_date");

-- CreateIndex
CREATE INDEX "sales_order_line_product_id_idx" ON "sales_order_line"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "sales_order_line_sales_order_id_line_no_key" ON "sales_order_line"("sales_order_id", "line_no");

-- CreateIndex
CREATE UNIQUE INDEX "invoice_invoice_no_key" ON "invoice"("invoice_no");

-- CreateIndex
CREATE INDEX "invoice_status_idx" ON "invoice"("status");

-- CreateIndex
CREATE INDEX "invoice_cutoff_date_idx" ON "invoice"("cutoff_date");

-- CreateIndex
CREATE UNIQUE INDEX "invoice_customer_id_bill_year_bill_month_cutoff_group_key" ON "invoice"("customer_id", "bill_year", "bill_month", "cutoff_group");

-- CreateIndex
CREATE UNIQUE INDEX "invoice_line_invoice_id_line_no_key" ON "invoice_line"("invoice_id", "line_no");

-- CreateIndex
CREATE UNIQUE INDEX "deposit_deposit_no_key" ON "deposit"("deposit_no");

-- CreateIndex
CREATE INDEX "deposit_customer_id_deposit_date_idx" ON "deposit"("customer_id", "deposit_date");

-- CreateIndex
CREATE INDEX "deposit_deposit_date_idx" ON "deposit"("deposit_date");

-- CreateIndex
CREATE UNIQUE INDEX "deposit_line_deposit_id_line_no_key" ON "deposit_line"("deposit_id", "line_no");

-- CreateIndex
CREATE INDEX "payment_allocation_invoice_id_idx" ON "payment_allocation"("invoice_id");

-- CreateIndex
CREATE UNIQUE INDEX "payment_allocation_deposit_id_invoice_id_key" ON "payment_allocation"("deposit_id", "invoice_id");

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "department" ADD CONSTRAINT "department_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_role" ADD CONSTRAINT "user_role_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_role" ADD CONSTRAINT "user_role_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permission" ADD CONSTRAINT "role_permission_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permission" ADD CONSTRAINT "role_permission_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer" ADD CONSTRAINT "customer_in_charge_user_id_fkey" FOREIGN KEY ("in_charge_user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product" ADD CONSTRAINT "product_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "supplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_price_history" ADD CONSTRAINT "product_price_history_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_order" ADD CONSTRAINT "sales_order_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_order" ADD CONSTRAINT "sales_order_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_order_line" ADD CONSTRAINT "sales_order_line_sales_order_id_fkey" FOREIGN KEY ("sales_order_id") REFERENCES "sales_order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_order_line" ADD CONSTRAINT "sales_order_line_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice" ADD CONSTRAINT "invoice_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_line" ADD CONSTRAINT "invoice_line_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_line" ADD CONSTRAINT "invoice_line_sales_order_id_fkey" FOREIGN KEY ("sales_order_id") REFERENCES "sales_order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deposit" ADD CONSTRAINT "deposit_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deposit_line" ADD CONSTRAINT "deposit_line_deposit_id_fkey" FOREIGN KEY ("deposit_id") REFERENCES "deposit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_allocation" ADD CONSTRAINT "payment_allocation_deposit_id_fkey" FOREIGN KEY ("deposit_id") REFERENCES "deposit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_allocation" ADD CONSTRAINT "payment_allocation_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;
