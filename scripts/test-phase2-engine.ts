import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import { connectToDatabase } from "../lib/mongodb";
import Villa from "../models/Villa";
import Booking from "../models/Booking";
import BlockedDate from "../models/BlockedDate";
import { checkVillaAvailability } from "../lib/booking/availability";

// Read .env.local
const envLocalPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envLocalPath)) {
  const envConfig = fs.readFileSync(envLocalPath, "utf8");
  envConfig.split("\n").forEach((line) => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, "");
      if (process.env[key] === undefined) {
        process.env[key] = value;
      }
    }
  });
}

async function runPhase2EngineTests() {
  console.log("==================================================");
  console.log("  PHASE 2 BOOKING & AVAILABILITY ENGINE SUITE    ");
  console.log("==================================================\n");

  try {
    await connectToDatabase();
    console.log("✅ MongoDB connected successfully.\n");

    // 1. Get or create a test villa
    let villa = await Villa.findOne({ status: "ACTIVE" });
    if (!villa) {
      villa = await Villa.create({
        name: "Engine Test Sanctuary",
        slug: "engine-test-sanctuary",
        description: "Test sanctuary for Phase 2 verification",
        pricePerNight: 25000,
        maxGuests: 6,
        bedrooms: 3,
        bathrooms: 3,
        status: "ACTIVE",
      });
      console.log(`Created test villa: ${villa.name} (${villa._id})`);
    } else {
      console.log(`Using existing test villa: ${villa.name} (${villa._id})`);
    }

    const villaId = villa._id.toString();

    // Setup date strings (using future dates in 2028 to avoid conflicts)
    const testCheckInStr = "2028-10-10";
    const testCheckOutStr = "2028-10-15";
    const testCheckIn = new Date(`${testCheckInStr}T00:00:00.000Z`);
    const testCheckOut = new Date(`${testCheckOutStr}T00:00:00.000Z`);

    // Clean up any pre-existing test data for this date range
    await Booking.deleteMany({ villaId: villa._id, guestEmail: "phase2test@darangavilla.com" });
    await BlockedDate.deleteMany({ villaId: villa._id, reason: "Phase 2 Engine Test Block" });

    // 2. TEST: Initial availability check (Should be AVAILABLE)
    console.log("\n--- TEST 1: Initial Availability Check ---");
    const check1 = await checkVillaAvailability({
      villaId,
      checkIn: testCheckIn,
      checkOut: testCheckOut,
    });
    console.log(`Status: ${check1.available ? "AVAILABLE" : "UNAVAILABLE"}`);
    if (!check1.available) {
      throw new Error(`Expected dates to be available, but got: ${check1.error}`);
    }
    console.log("✅ Test 1 Passed: Villa is available for test date range.");

    // 3. TEST: Create Booking & Verify Overlap Rejection
    console.log("\n--- TEST 2: Booking Creation & Double-Booking Rejection ---");
    const booking1 = await Booking.create({
      villaId: villa._id,
      guestName: "Phase2 Tester",
      guestEmail: "phase2test@darangavilla.com",
      guestPhone: "+919999988888",
      checkIn: testCheckIn,
      checkOut: testCheckOut,
      guests: 4,
      totalAmount: 5 * villa.pricePerNight,
      source: "WEBSITE",
      status: "PENDING",
      paymentStatus: "UNPAID",
    });
    console.log(`Created test booking: ${booking1._id}`);

    // Verify availability after booking (Should be UNAVAILABLE)
    const check2 = await checkVillaAvailability({
      villaId,
      checkIn: testCheckIn,
      checkOut: testCheckOut,
    });
    console.log(`Availability check after booking: ${check2.available ? "AVAILABLE" : "UNAVAILABLE"}`);
    if (check2.available) {
      throw new Error("Expected dates to be unavailable after booking creation!");
    }
    console.log(`Reason: ${check2.error}`);

    // Attempt overlapping booking availability check (check-in 2028-10-12 to 2028-10-14)
    const overlapIn = new Date("2028-10-12T00:00:00.000Z");
    const overlapOut = new Date("2028-10-14T00:00:00.000Z");
    const checkOverlap = await checkVillaAvailability({
      villaId,
      checkIn: overlapIn,
      checkOut: overlapOut,
    });
    console.log(`Overlapping dates availability: ${checkOverlap.available ? "AVAILABLE" : "UNAVAILABLE"}`);
    if (checkOverlap.available) {
      throw new Error("Expected overlapping dates to be unavailable!");
    }
    console.log("✅ Test 2 Passed: Double-booking overlap correctly detected and rejected.");

    // 4. TEST: Admin Blocked Date Overlap Protection against Active Booking
    console.log("\n--- TEST 3: Admin Blocked Date Overlap Validation ---");
    // Query active bookings for overlap (simulating POST /api/admin/blocked-dates logic)
    const existingActiveBooking = await Booking.findOne({
      villaId: villa._id,
      status: { $in: ["PENDING", "CONFIRMED", "COMPLETED"] },
      $or: [
        { checkIn: { $lt: testCheckOut }, checkOut: { $gt: testCheckIn } },
      ],
    });

    if (existingActiveBooking) {
      console.log(`✅ Admin block overlap check correctly caught active booking: ${existingActiveBooking._id}`);
    } else {
      throw new Error("Expected admin block overlap check to detect active booking!");
    }

    // 5. TEST: Admin Blocked Date Creation & Deletion Lifecycle
    console.log("\n--- TEST 4: Admin Blocked Date Lifecycle ---");
    // Delete test booking first
    await Booking.deleteOne({ _id: booking1._id });
    console.log("Deleted test booking.");

    // Create Admin Blocked Date for non-overlapping dates
    const blockInStr = "2028-11-01";
    const blockOutStr = "2028-11-05";
    const blockIn = new Date(`${blockInStr}T00:00:00.000Z`);
    const blockOut = new Date(`${blockOutStr}T00:00:00.000Z`);

    const blockedRecord = await BlockedDate.create({
      villaId: villa._id,
      startDate: blockIn,
      endDate: blockOut,
      reason: "Phase 2 Engine Test Block",
    });
    console.log(`Created admin block: ${blockedRecord._id}`);

    // Check availability during blocked period
    const checkBlocked = await checkVillaAvailability({
      villaId,
      checkIn: blockIn,
      checkOut: blockOut,
    });
    console.log(`Availability during admin block: ${checkBlocked.available ? "AVAILABLE" : "UNAVAILABLE"}`);
    if (checkBlocked.available) {
      throw new Error("Expected dates to be unavailable during admin block!");
    }
    console.log(`Reason: ${checkBlocked.error}`);

    // Delete blocked record
    await BlockedDate.deleteOne({ _id: blockedRecord._id });
    console.log("Deleted admin block.");

    // Check availability again (Should be AVAILABLE)
    const checkUnblocked = await checkVillaAvailability({
      villaId,
      checkIn: blockIn,
      checkOut: blockOut,
    });
    if (!checkUnblocked.available) {
      throw new Error("Expected dates to become available after deleting admin block!");
    }
    console.log("✅ Test 4 Passed: Admin block created, enforced, and deleted cleanly.");

    console.log("\n==================================================");
    console.log("🎉 ALL PHASE 2 ENGINE TESTS PASSED SUCCESSFULLY!  ");
    console.log("==================================================\n");

  } catch (error) {
    console.error("\n❌ PHASE 2 ENGINE TEST FAILED:");
    console.error(error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
}

runPhase2EngineTests();
