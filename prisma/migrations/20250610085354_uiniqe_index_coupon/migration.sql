CREATE UNIQUE INDEX "Coupon_code_unique"
ON "Coupon" ("code")
WHERE "deletedAt" IS NULL;