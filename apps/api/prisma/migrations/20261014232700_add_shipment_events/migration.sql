-- CreateTable
CREATE TABLE "ShipmentEvent" (
    "id" TEXT NOT NULL,
    "shipmentId" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL,
    "note" TEXT,
    "actorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShipmentEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ShipmentEvent_shipmentId_createdAt_idx" ON "ShipmentEvent"("shipmentId", "createdAt");

-- AddForeignKey
ALTER TABLE "ShipmentEvent" ADD CONSTRAINT "ShipmentEvent_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES "Shipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
