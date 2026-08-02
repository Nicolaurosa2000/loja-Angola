-- CreateTable
CREATE TABLE "user" (
    "id" VARCHAR(191) NOT NULL,
    "name" VARCHAR(191) NOT NULL,
    "email" VARCHAR(191) NOT NULL,
    "phone" VARCHAR(191),
    "password" VARCHAR(191) NOT NULL,
    "avatar" VARCHAR(191),
    "role" VARCHAR(191) NOT NULL DEFAULT 'CUSTOMER',
    "isactive" BOOLEAN NOT NULL DEFAULT true,
    "emailverifiedat" TIMESTAMP(3),
    "resettoken" VARCHAR(191),
    "resettokenexp" TIMESTAMP(3),
    "createdat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedat" TIMESTAMP(3) NOT NULL,
    "deletedat" TIMESTAMP(3),
    "trial453" CHAR(1),

    CONSTRAINT "pk_user" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role" (
    "id" VARCHAR(191) NOT NULL,
    "name" VARCHAR(191) NOT NULL,
    "description" VARCHAR(191),
    "createdat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedat" TIMESTAMP(3) NOT NULL,
    "deletedat" TIMESTAMP(3),
    "trial459" CHAR(1),

    CONSTRAINT "pk_role" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permission" (
    "id" VARCHAR(191) NOT NULL,
    "name" VARCHAR(191) NOT NULL,
    "description" VARCHAR(191),
    "resource" VARCHAR(191) NOT NULL,
    "action" VARCHAR(191) NOT NULL,
    "createdat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedat" TIMESTAMP(3) NOT NULL,
    "trial459" CHAR(1),

    CONSTRAINT "pk_permission" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "category" (
    "id" VARCHAR(191) NOT NULL,
    "name" VARCHAR(191) NOT NULL,
    "slug" VARCHAR(191) NOT NULL,
    "description" VARCHAR(191),
    "image" VARCHAR(191),
    "metatitle" VARCHAR(191),
    "metadescription" VARCHAR(191),
    "isactive" BOOLEAN NOT NULL DEFAULT true,
    "sortorder" INTEGER NOT NULL DEFAULT 0,
    "parentid" VARCHAR(191),
    "createdat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedat" TIMESTAMP(3) NOT NULL,
    "deletedat" TIMESTAMP(3),
    "trial456" CHAR(1),

    CONSTRAINT "pk_category" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "brand" (
    "id" VARCHAR(191) NOT NULL,
    "name" VARCHAR(191) NOT NULL,
    "slug" VARCHAR(191) NOT NULL,
    "description" VARCHAR(191),
    "logo" VARCHAR(191),
    "website" VARCHAR(191),
    "isactive" BOOLEAN NOT NULL DEFAULT true,
    "createdat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedat" TIMESTAMP(3) NOT NULL,
    "deletedat" TIMESTAMP(3),
    "trial456" CHAR(1),

    CONSTRAINT "pk_brand" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product" (
    "id" VARCHAR(191) NOT NULL,
    "name" VARCHAR(191) NOT NULL,
    "slug" VARCHAR(191) NOT NULL,
    "description" VARCHAR(191) NOT NULL,
    "fulldescription" VARCHAR(191),
    "price" DOUBLE PRECISION NOT NULL,
    "promotionalprice" DOUBLE PRECISION,
    "sku" VARCHAR(191) NOT NULL,
    "code" VARCHAR(191),
    "weight" DOUBLE PRECISION,
    "length" DOUBLE PRECISION,
    "width" DOUBLE PRECISION,
    "height" DOUBLE PRECISION,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "minstock" INTEGER NOT NULL DEFAULT 0,
    "isfeatured" BOOLEAN NOT NULL DEFAULT false,
    "isactive" BOOLEAN NOT NULL DEFAULT true,
    "status" VARCHAR(191) NOT NULL DEFAULT 'ACTIVE',
    "metatitle" VARCHAR(191),
    "metadescription" VARCHAR(191),
    "avgrating" DOUBLE PRECISION,
    "videourl" VARCHAR(191),
    "categoryid" VARCHAR(191),
    "brandid" VARCHAR(191),
    "createdat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedat" TIMESTAMP(3) NOT NULL,
    "deletedat" TIMESTAMP(3),
    "trial456" CHAR(1),

    CONSTRAINT "pk_product" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "address" (
    "id" VARCHAR(191) NOT NULL,
    "label" VARCHAR(191),
    "street" VARCHAR(191) NOT NULL,
    "number" VARCHAR(191),
    "complement" VARCHAR(191),
    "neighborhood" VARCHAR(191) NOT NULL,
    "city" VARCHAR(191) NOT NULL,
    "province" VARCHAR(191) NOT NULL,
    "zipcode" VARCHAR(191),
    "isdefault" BOOLEAN NOT NULL DEFAULT false,
    "userid" VARCHAR(191),
    "createdat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedat" TIMESTAMP(3) NOT NULL,
    "deletedat" TIMESTAMP(3),
    "trial453" CHAR(1),

    CONSTRAINT "pk_address" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auditlog" (
    "id" VARCHAR(191) NOT NULL,
    "action" VARCHAR(191) NOT NULL,
    "resource" VARCHAR(191) NOT NULL,
    "resourceid" VARCHAR(191),
    "details" VARCHAR(191),
    "ip" VARCHAR(191),
    "useragent" VARCHAR(191),
    "userid" VARCHAR(191),
    "createdat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "trial453" CHAR(1),

    CONSTRAINT "pk_auditlog" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "banner" (
    "id" VARCHAR(191) NOT NULL,
    "title" VARCHAR(191),
    "subtitle" VARCHAR(191),
    "image" VARCHAR(191) NOT NULL,
    "link" VARCHAR(191),
    "position" VARCHAR(191) NOT NULL DEFAULT 'HERO',
    "sortorder" INTEGER NOT NULL DEFAULT 0,
    "isactive" BOOLEAN NOT NULL DEFAULT true,
    "createdat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedat" TIMESTAMP(3) NOT NULL,
    "deletedat" TIMESTAMP(3),
    "trial456" CHAR(1),

    CONSTRAINT "pk_banner" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cart" (
    "id" VARCHAR(191) NOT NULL,
    "sessionid" VARCHAR(191),
    "userid" VARCHAR(191),
    "couponid" VARCHAR(191),
    "createdat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedat" TIMESTAMP(3) NOT NULL,
    "trial456" CHAR(1),

    CONSTRAINT "pk_cart" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cartitem" (
    "id" VARCHAR(191) NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "cartid" VARCHAR(191) NOT NULL,
    "productid" VARCHAR(191) NOT NULL,
    "createdat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedat" TIMESTAMP(3) NOT NULL,
    "trial456" CHAR(1),

    CONSTRAINT "pk_cartitem" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coupon" (
    "id" VARCHAR(191) NOT NULL,
    "code" VARCHAR(191) NOT NULL,
    "description" VARCHAR(191),
    "type" VARCHAR(191) NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "minordervalue" DOUBLE PRECISION,
    "maxuses" INTEGER,
    "usedcount" INTEGER NOT NULL DEFAULT 0,
    "maxusesperuser" INTEGER,
    "isactive" BOOLEAN NOT NULL DEFAULT true,
    "startsat" TIMESTAMP(3),
    "expiresat" TIMESTAMP(3),
    "createdat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedat" TIMESTAMP(3) NOT NULL,
    "deletedat" TIMESTAMP(3),
    "trial456" CHAR(1),

    CONSTRAINT "pk_coupon" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "couponusage" (
    "id" VARCHAR(191) NOT NULL,
    "couponid" VARCHAR(191) NOT NULL,
    "userid" VARCHAR(191) NOT NULL,
    "orderid" VARCHAR(191),
    "createdat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "trial456" CHAR(1),

    CONSTRAINT "pk_couponusage" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "newslettersubscriber" (
    "id" VARCHAR(191) NOT NULL,
    "email" VARCHAR(191) NOT NULL,
    "name" VARCHAR(191),
    "isactive" BOOLEAN NOT NULL DEFAULT true,
    "verifiedat" TIMESTAMP(3),
    "createdat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedat" TIMESTAMP(3) NOT NULL,
    "deletedat" TIMESTAMP(3),
    "trial456" CHAR(1),

    CONSTRAINT "pk_newslettersubscriber" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order" (
    "id" VARCHAR(191) NOT NULL,
    "ordernumber" VARCHAR(191),
    "userid" VARCHAR(191),
    "addressid" VARCHAR(191),
    "status" VARCHAR(191) NOT NULL DEFAULT 'PENDING',
    "subtotal" DOUBLE PRECISION NOT NULL,
    "discountamount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "shippingamount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total" DOUBLE PRECISION NOT NULL,
    "paymentmethod" VARCHAR(191),
    "paymentstatus" VARCHAR(191),
    "notes" VARCHAR(191),
    "trackingcode" VARCHAR(191),
    "paidat" TIMESTAMP(3),
    "cancelledat" TIMESTAMP(3),
    "deliveredat" TIMESTAMP(3),
    "createdat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedat" TIMESTAMP(3) NOT NULL,
    "deletedat" TIMESTAMP(3),
    "trial456" CHAR(1),

    CONSTRAINT "pk_order" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orderdiscount" (
    "id" VARCHAR(191) NOT NULL,
    "couponid" VARCHAR(191) NOT NULL,
    "orderid" VARCHAR(191) NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "createdat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "trial456" CHAR(1),

    CONSTRAINT "pk_orderdiscount" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orderitem" (
    "id" VARCHAR(191) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitprice" DOUBLE PRECISION NOT NULL,
    "totalprice" DOUBLE PRECISION NOT NULL,
    "productid" VARCHAR(191),
    "orderid" VARCHAR(191),
    "createdat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedat" TIMESTAMP(3) NOT NULL,
    "trial456" CHAR(1),

    CONSTRAINT "pk_orderitem" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "paymenttransaction" (
    "id" VARCHAR(191) NOT NULL,
    "orderid" VARCHAR(191),
    "method" VARCHAR(191) NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" VARCHAR(191) NOT NULL DEFAULT 'PENDING',
    "transactionid" VARCHAR(191),
    "gatewayresponse" VARCHAR(191),
    "paidat" TIMESTAMP(3),
    "createdat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedat" TIMESTAMP(3) NOT NULL,
    "trial459" CHAR(1),

    CONSTRAINT "pk_paymenttransaction" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "productimage" (
    "id" VARCHAR(191) NOT NULL,
    "url" VARCHAR(191) NOT NULL,
    "alt" VARCHAR(191),
    "sortorder" INTEGER NOT NULL DEFAULT 0,
    "iscover" BOOLEAN NOT NULL DEFAULT false,
    "productid" VARCHAR(191),
    "createdat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedat" TIMESTAMP(3) NOT NULL,
    "trial459" CHAR(1),

    CONSTRAINT "pk_productimage" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "productrelation" (
    "productaid" VARCHAR(191) NOT NULL,
    "productbid" VARCHAR(191) NOT NULL,
    "createdat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "trial459" CHAR(1),

    CONSTRAINT "pk_productrelation" PRIMARY KEY ("productaid","productbid")
);

-- CreateTable
CREATE TABLE "productreview" (
    "id" VARCHAR(191) NOT NULL,
    "rating" INTEGER NOT NULL,
    "title" VARCHAR(191),
    "comment" VARCHAR(191),
    "status" VARCHAR(191) NOT NULL DEFAULT 'PENDING',
    "userid" VARCHAR(191) NOT NULL,
    "productid" VARCHAR(191) NOT NULL,
    "createdat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedat" TIMESTAMP(3) NOT NULL,
    "deletedat" TIMESTAMP(3),
    "trial459" CHAR(1),

    CONSTRAINT "pk_productreview" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "producttag" (
    "id" VARCHAR(191) NOT NULL,
    "name" VARCHAR(191) NOT NULL,
    "productid" VARCHAR(191),
    "createdat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "trial459" CHAR(1),

    CONSTRAINT "pk_producttag" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rolepermission" (
    "roleid" VARCHAR(191) NOT NULL,
    "permissionid" VARCHAR(191) NOT NULL,
    "createdat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "trial459" CHAR(1),

    CONSTRAINT "pk_rolepermission" PRIMARY KEY ("roleid","permissionid")
);

-- CreateTable
CREATE TABLE "setting" (
    "id" VARCHAR(191) NOT NULL,
    "key" VARCHAR(191) NOT NULL,
    "value" VARCHAR(191) NOT NULL,
    "group" VARCHAR(191) NOT NULL DEFAULT 'general',
    "createdat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedat" TIMESTAMP(3) NOT NULL,
    "trial459" CHAR(1),

    CONSTRAINT "pk_setting" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "upload" (
    "id" VARCHAR(191) NOT NULL,
    "filename" VARCHAR(191) NOT NULL,
    "originalname" VARCHAR(191) NOT NULL,
    "mimetype" VARCHAR(191) NOT NULL,
    "size" INTEGER NOT NULL,
    "path" VARCHAR(191) NOT NULL,
    "url" VARCHAR(191) NOT NULL,
    "createdat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedat" TIMESTAMP(3) NOT NULL,
    "trial459" CHAR(1),

    CONSTRAINT "pk_upload" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "userroleassignment" (
    "userid" VARCHAR(191) NOT NULL,
    "roleid" VARCHAR(191) NOT NULL,
    "createdat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "trial459" CHAR(1),

    CONSTRAINT "pk_userroleassignment" PRIMARY KEY ("userid","roleid")
);

-- CreateTable
CREATE TABLE "wishlistitem" (
    "id" VARCHAR(191) NOT NULL,
    "userid" VARCHAR(191) NOT NULL,
    "productid" VARCHAR(191) NOT NULL,
    "createdat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "trial459" CHAR(1),

    CONSTRAINT "pk_wishlistitem" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "role_name_key" ON "role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "permission_name_key" ON "permission"("name");

-- CreateIndex
CREATE UNIQUE INDEX "category_slug_key" ON "category"("slug");

-- CreateIndex
CREATE INDEX "category_parentid_idx" ON "category"("parentid");

-- CreateIndex
CREATE UNIQUE INDEX "brand_name_key" ON "brand"("name");

-- CreateIndex
CREATE UNIQUE INDEX "brand_slug_key" ON "brand"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "product_slug_key" ON "product"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "product_sku_key" ON "product"("sku");

-- CreateIndex
CREATE INDEX "product_brandid_idx" ON "product"("brandid");

-- CreateIndex
CREATE INDEX "product_categoryid_idx" ON "product"("categoryid");

-- CreateIndex
CREATE INDEX "auditlog_action_idx" ON "auditlog"("action");

-- CreateIndex
CREATE INDEX "auditlog_resource_resourceid_idx" ON "auditlog"("resource", "resourceid");

-- CreateIndex
CREATE INDEX "auditlog_userid_idx" ON "auditlog"("userid");

-- CreateIndex
CREATE UNIQUE INDEX "cart_sessionid_key" ON "cart"("sessionid");

-- CreateIndex
CREATE UNIQUE INDEX "cart_userid_key" ON "cart"("userid");

-- CreateIndex
CREATE UNIQUE INDEX "coupon_code_key" ON "coupon"("code");

-- CreateIndex
CREATE UNIQUE INDEX "newslettersubscriber_email_key" ON "newslettersubscriber"("email");

-- CreateIndex
CREATE INDEX "order_status_idx" ON "order"("status");

-- CreateIndex
CREATE INDEX "order_userid_idx" ON "order"("userid");

-- CreateIndex
CREATE UNIQUE INDEX "setting_key_key" ON "setting"("key");

-- AddForeignKey
ALTER TABLE "category" ADD CONSTRAINT "category_parentid_fkey" FOREIGN KEY ("parentid") REFERENCES "category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product" ADD CONSTRAINT "product_brandid_fkey" FOREIGN KEY ("brandid") REFERENCES "brand"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product" ADD CONSTRAINT "product_categoryid_fkey" FOREIGN KEY ("categoryid") REFERENCES "category"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "address" ADD CONSTRAINT "address_userid_fkey" FOREIGN KEY ("userid") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auditlog" ADD CONSTRAINT "auditlog_userid_fkey" FOREIGN KEY ("userid") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart" ADD CONSTRAINT "cart_couponid_fkey" FOREIGN KEY ("couponid") REFERENCES "coupon"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart" ADD CONSTRAINT "cart_userid_fkey" FOREIGN KEY ("userid") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cartitem" ADD CONSTRAINT "cartitem_cartid_fkey" FOREIGN KEY ("cartid") REFERENCES "cart"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cartitem" ADD CONSTRAINT "cartitem_productid_fkey" FOREIGN KEY ("productid") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "couponusage" ADD CONSTRAINT "couponusage_couponid_fkey" FOREIGN KEY ("couponid") REFERENCES "coupon"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "couponusage" ADD CONSTRAINT "couponusage_orderid_fkey" FOREIGN KEY ("orderid") REFERENCES "order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "couponusage" ADD CONSTRAINT "couponusage_userid_fkey" FOREIGN KEY ("userid") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order" ADD CONSTRAINT "order_addressid_fkey" FOREIGN KEY ("addressid") REFERENCES "address"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order" ADD CONSTRAINT "order_userid_fkey" FOREIGN KEY ("userid") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orderdiscount" ADD CONSTRAINT "orderdiscount_couponid_fkey" FOREIGN KEY ("couponid") REFERENCES "coupon"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orderdiscount" ADD CONSTRAINT "orderdiscount_orderid_fkey" FOREIGN KEY ("orderid") REFERENCES "order"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orderitem" ADD CONSTRAINT "orderitem_orderid_fkey" FOREIGN KEY ("orderid") REFERENCES "order"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orderitem" ADD CONSTRAINT "orderitem_productid_fkey" FOREIGN KEY ("productid") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paymenttransaction" ADD CONSTRAINT "paymenttransaction_orderid_fkey" FOREIGN KEY ("orderid") REFERENCES "order"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productimage" ADD CONSTRAINT "productimage_productid_fkey" FOREIGN KEY ("productid") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productrelation" ADD CONSTRAINT "productrelation_productaid_fkey" FOREIGN KEY ("productaid") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productrelation" ADD CONSTRAINT "productrelation_productbid_fkey" FOREIGN KEY ("productbid") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productreview" ADD CONSTRAINT "productreview_productid_fkey" FOREIGN KEY ("productid") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productreview" ADD CONSTRAINT "productreview_userid_fkey" FOREIGN KEY ("userid") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "producttag" ADD CONSTRAINT "producttag_productid_fkey" FOREIGN KEY ("productid") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rolepermission" ADD CONSTRAINT "rolepermission_permissionid_fkey" FOREIGN KEY ("permissionid") REFERENCES "permission"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rolepermission" ADD CONSTRAINT "rolepermission_roleid_fkey" FOREIGN KEY ("roleid") REFERENCES "role"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "userroleassignment" ADD CONSTRAINT "userroleassignment_roleid_fkey" FOREIGN KEY ("roleid") REFERENCES "role"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "userroleassignment" ADD CONSTRAINT "userroleassignment_userid_fkey" FOREIGN KEY ("userid") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wishlistitem" ADD CONSTRAINT "wishlistitem_productid_fkey" FOREIGN KEY ("productid") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wishlistitem" ADD CONSTRAINT "wishlistitem_userid_fkey" FOREIGN KEY ("userid") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

