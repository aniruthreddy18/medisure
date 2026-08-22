-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "tokenNumber" INTEGER;

-- AlterTable
ALTER TABLE "DoctorSchedule" ADD COLUMN     "capacityPerHour" INTEGER NOT NULL DEFAULT 10,
ALTER COLUMN "slotMinutes" SET DEFAULT 60;
