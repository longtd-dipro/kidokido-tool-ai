-- CreateTable
CREATE TABLE "disclaimers" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "disclaimers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "disclaimer_options" (
    "id" SERIAL NOT NULL,
    "disclaimer_id" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "disclaimer_options_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "disclaimer_options" ADD CONSTRAINT "disclaimer_options_disclaimer_id_fkey" FOREIGN KEY ("disclaimer_id") REFERENCES "disclaimers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
