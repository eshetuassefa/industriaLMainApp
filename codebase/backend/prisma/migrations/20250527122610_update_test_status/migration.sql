-- CreateEnum
CREATE TYPE "TestStatus_new" AS ENUM ('REQUESTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'PENDING');

-- AlterTable
ALTER TABLE "TestRequest" 
    ALTER COLUMN "status" DROP DEFAULT,
    ALTER COLUMN "status" TYPE "TestStatus_new" USING ("status"::text::"TestStatus_new"),
    ALTER COLUMN "status" SET DEFAULT 'REQUESTED'::"TestStatus_new";

ALTER TABLE "RadiologyRequest" 
    ALTER COLUMN "status" DROP DEFAULT,
    ALTER COLUMN "status" TYPE "TestStatus_new" USING ("status"::text::"TestStatus_new"),
    ALTER COLUMN "status" SET DEFAULT 'REQUESTED'::"TestStatus_new";

-- DropEnum
DROP TYPE "TestStatus";

-- RenameEnum
ALTER TYPE "TestStatus_new" RENAME TO "TestStatus"; 