-- CreateEnum
CREATE TYPE "CategoryType" AS ENUM ('ROOM', 'PUBLIC', 'SERVICE');

-- CreateEnum
CREATE TYPE "CouponStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'EXPIRED', 'RELEASED');

-- CreateEnum
CREATE TYPE "HTTPMethod" AS ENUM ('GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD');

-- CreateEnum
CREATE TYPE "HotelStatus" AS ENUM ('PENDING', 'ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "HotelType" AS ENUM ('HOTEL', 'HOSTEL', 'APARTMENT', 'GUESTHOUSE', 'HOMESTAY', 'VILLA', 'RESORT');

-- CreateEnum
CREATE TYPE "NotifyType" AS ENUM ('REFUND', 'DEMAND', 'INFORM');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'FAILED', 'CANCELED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "PartnerStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('BANKING', 'PAY_AT_HOTEL');

-- CreateEnum
CREATE TYPE "PolicyType" AS ENUM ('NON_REFUNDABLE', 'FREE_CANCELLATION', 'PAY_AT_HOTEL');

-- CreateEnum
CREATE TYPE "RefundStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "RoomBedType" AS ENUM ('KING', 'QUEEN', 'DOUBLE', 'TWIN', 'SINGLE', 'BUNK');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('IN', 'OUT');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "VerificationCodeType" AS ENUM ('REGISTER', 'FORGOT_PASSWORD', 'VERIFY');

-- CreateTable
CREATE TABLE "Amenity" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "category" "CategoryType" NOT NULL,
    "createdAt" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Amenity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Coupon" (
    "id" SERIAL NOT NULL,
    "applierId" INTEGER,
    "title" VARCHAR(100) NOT NULL,
    "description" VARCHAR(255) NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "amount" INTEGER NOT NULL,
    "percentage" REAL DEFAULT 0,
    "sharePercentage" REAL DEFAULT 0,
    "usedCount" INTEGER DEFAULT 0,
    "status" "CouponStatus" DEFAULT 'PENDING',
    "createdById" INTEGER,
    "updatedById" INTEGER,
    "deletedAt" TIMESTAMP(6),
    "createdAt" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Coupon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" SERIAL NOT NULL,
    "fullName" VARCHAR(255) NOT NULL,
    "phoneNumber" VARCHAR(20) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Device" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "userAgent" TEXT NOT NULL,
    "browser" VARCHAR(50),
    "os" VARCHAR(50),
    "deviceType" VARCHAR(50),
    "isActive" BOOLEAN DEFAULT true,
    "lastActive" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Device_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Hotel" (
    "id" SERIAL NOT NULL,
    "partnerId" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "hotelPhoneNumber" VARCHAR(20) NOT NULL,
    "type" "HotelType" NOT NULL,
    "reputationCore" REAL DEFAULT 100,
    "rating" REAL DEFAULT 0,
    "vat" REAL NOT NULL,
    "address" TEXT NOT NULL,
    "provinceCode" INTEGER NOT NULL,
    "districtCode" INTEGER NOT NULL,
    "wardCode" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "images" TEXT[],
    "status" "HotelStatus" DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Hotel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notify" (
    "id" SERIAL NOT NULL,
    "recipientId" INTEGER NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "type" "NotifyType" NOT NULL,
    "message" TEXT NOT NULL,
    "createdById" INTEGER NOT NULL,
    "readAt" TIMESTAMP(6),
    "createdAt" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notify_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ObjectAmenity" (
    "id" SERIAL NOT NULL,
    "objectId" INTEGER NOT NULL,
    "amenityId" INTEGER NOT NULL,

    CONSTRAINT "ObjectAmenity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "customerId" INTEGER NOT NULL,
    "hotelId" INTEGER NOT NULL,
    "roomId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "checkinDate" TIMESTAMP(6) NOT NULL,
    "checkoutDate" TIMESTAMP(6) NOT NULL,
    "basePrice" REAL NOT NULL,
    "pointDiscount" REAL NOT NULL,
    "couponId" INTEGER,
    "discountId" INTEGER,
    "vatAmount" REAL NOT NULL,
    "totalPrice" REAL NOT NULL,
    "serviceFeeAmount" REAL NOT NULL,
    "commissionAmount" REAL NOT NULL,
    "status" "OrderStatus" DEFAULT 'PENDING',
    "paymentType" "PaymentType" NOT NULL,
    "notes" TEXT,
    "arrivalTime" TIMESTAMP(6),
    "checkoutTime" TIMESTAMP(6),
    "createdAt" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Partner" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "fullName" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phoneNumber" VARCHAR(20) NOT NULL,
    "idCard" VARCHAR(50) NOT NULL,
    "birth" TIMESTAMP(6) NOT NULL,
    "gender" VARCHAR(10) NOT NULL,
    "address" TEXT NOT NULL,
    "provinceCode" INTEGER NOT NULL,
    "districtCode" INTEGER NOT NULL,
    "wardCode" INTEGER NOT NULL,
    "companyName" VARCHAR(255) NOT NULL,
    "accountNumber" VARCHAR(100) NOT NULL,
    "bankAccount" VARCHAR(100) NOT NULL,
    "bankName" VARCHAR(255) NOT NULL,
    "commissionRate" REAL DEFAULT 0.15,
    "status" "PartnerStatus" DEFAULT 'PENDING',
    "createdById" INTEGER,
    "createdAt" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Partner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "path" VARCHAR(255) NOT NULL,
    "method" "HTTPMethod" NOT NULL,
    "createdAt" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PermissionToRole" (
    "id" SERIAL NOT NULL,
    "roleId" INTEGER NOT NULL,
    "permissionId" INTEGER NOT NULL,

    CONSTRAINT "PermissionToRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Promotion" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "percentage" REAL DEFAULT 0,
    "sharePercentage" REAL DEFAULT 0,
    "validFrom" DATE NOT NULL,
    "validUntil" DATE NOT NULL,
    "createdById" INTEGER NOT NULL,
    "deletedAt" TIMESTAMP(6),
    "createdAt" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Promotion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "token" VARCHAR(255) NOT NULL,
    "userId" INTEGER NOT NULL,
    "deviceId" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(6) NOT NULL,
    "createdAt" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("token")
);

-- CreateTable
CREATE TABLE "Refund" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "amount" REAL NOT NULL,
    "reason" TEXT,
    "status" "RefundStatus" DEFAULT 'PENDING',
    "createdById" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Refund_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "hotelId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "image" TEXT,
    "rating" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Room" (
    "id" SERIAL NOT NULL,
    "hotelId" INTEGER NOT NULL,
    "roomTypeId" INTEGER NOT NULL,
    "price" REAL NOT NULL,
    "quantity" INTEGER NOT NULL,
    "rangeLimitDate" INTEGER DEFAULT 0,
    "policy" "PolicyType" DEFAULT 'NON_REFUNDABLE',
    "notePolicy" TEXT,
    "deletedAt" TIMESTAMP(6),
    "createdAt" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoomAvailability" (
    "id" SERIAL NOT NULL,
    "roomId" INTEGER NOT NULL,
    "availableRooms" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RoomAvailability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoomBed" (
    "id" SERIAL NOT NULL,
    "roomBedType" "RoomBedType" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RoomBed_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoomBlock" (
    "id" SERIAL NOT NULL,
    "roomId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "startDate" TIMESTAMP(6) NOT NULL,
    "endDate" TIMESTAMP(6) NOT NULL,
    "createdAt" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RoomBlock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoomType" (
    "id" SERIAL NOT NULL,
    "hotelId" INTEGER NOT NULL,
    "roomType" VARCHAR(100) NOT NULL,
    "adults" INTEGER NOT NULL,
    "child" INTEGER DEFAULT 0,
    "roomBedId" INTEGER NOT NULL,
    "area" INTEGER NOT NULL,
    "serviceFeeRate" REAL NOT NULL,
    "description" TEXT NOT NULL,
    "images" TEXT[],
    "deletedAt" TIMESTAMP(6),
    "createdAt" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RoomType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" SERIAL NOT NULL,
    "gateway" VARCHAR(100) NOT NULL,
    "transactionDate" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "accountNumber" VARCHAR(255),
    "subAccount" VARCHAR(255),
    "amount" INTEGER DEFAULT 0,
    "type" "TransactionType" NOT NULL,
    "accumulated" INTEGER,
    "code" VARCHAR(255),
    "transactionContent" TEXT,
    "referenceNumber" VARCHAR(255),
    "body" TEXT,
    "createdAt" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "fullName" VARCHAR(255),
    "phoneNumber" VARCHAR(20),
    "avatar" TEXT,
    "totpSecret" VARCHAR(255),
    "uriSecret" VARCHAR(255),
    "address" TEXT,
    "gender" VARCHAR(10),
    "birthday" DATE,
    "earnPoint" REAL DEFAULT 0,
    "accountNumber" VARCHAR(100),
    "bankAccount" VARCHAR(100),
    "bankName" VARCHAR(255),
    "roleId" INTEGER NOT NULL,
    "status" "UserStatus" DEFAULT 'ACTIVE',
    "createdById" INTEGER,
    "createdAt" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationCode" (
    "id" SERIAL NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "code" VARCHAR(10) NOT NULL,
    "type" "VerificationCodeType" NOT NULL,
    "expiresAt" TIMESTAMP(6) NOT NULL,
    "createdAt" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VerificationCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Wishlist" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "hotelId" INTEGER NOT NULL,

    CONSTRAINT "Wishlist_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Amenity_name_key" ON "Amenity"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Hotel_partnerId_key" ON "Hotel"("partnerId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_customerId_key" ON "Order"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "Partner_userId_key" ON "Partner"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Partner_email_key" ON "Partner"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Partner_idCard_key" ON "Partner"("idCard");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_name_key" ON "Permission"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Review_orderId_key" ON "Review"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Coupon" ADD CONSTRAINT "Coupon_applierId_fkey" FOREIGN KEY ("applierId") REFERENCES "Partner"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Coupon" ADD CONSTRAINT "Coupon_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Coupon" ADD CONSTRAINT "Coupon_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Device" ADD CONSTRAINT "Device_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Hotel" ADD CONSTRAINT "Hotel_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Notify" ADD CONSTRAINT "Notify_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Notify" ADD CONSTRAINT "Notify_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ObjectAmenity" ADD CONSTRAINT "ObjectAmenity_amenityId_fkey" FOREIGN KEY ("amenityId") REFERENCES "Amenity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ObjectAmenity" ADD CONSTRAINT "ObjectAmenity_objectId_fkey" FOREIGN KEY ("objectId") REFERENCES "RoomType"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ObjectAmenity" ADD CONSTRAINT "ObjectAmenity_objectId_fkey1" FOREIGN KEY ("objectId") REFERENCES "Hotel"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "Coupon"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_discountId_fkey" FOREIGN KEY ("discountId") REFERENCES "Promotion"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "Hotel"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Partner" ADD CONSTRAINT "Partner_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "PermissionToRole" ADD CONSTRAINT "PermissionToRole_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "PermissionToRole" ADD CONSTRAINT "PermissionToRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Promotion" ADD CONSTRAINT "Promotion_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Refund" ADD CONSTRAINT "Refund_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "Hotel"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "Hotel"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_roomTypeId_fkey" FOREIGN KEY ("roomTypeId") REFERENCES "RoomType"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "RoomAvailability" ADD CONSTRAINT "RoomAvailability_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "RoomBlock" ADD CONSTRAINT "RoomBlock_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "RoomType" ADD CONSTRAINT "RoomType_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "Hotel"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "RoomType" ADD CONSTRAINT "RoomType_roomBedId_fkey" FOREIGN KEY ("roomBedId") REFERENCES "RoomBed"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Wishlist" ADD CONSTRAINT "Wishlist_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "Hotel"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Wishlist" ADD CONSTRAINT "Wishlist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

