CREATE UNIQUE INDEX "Coupon_title_unique"
ON "Coupon" ("title")
WHERE "deletedAt" IS NULL;