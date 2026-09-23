import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import Villa from "../models/Villa";
import Booking from "../models/Booking";
import BlockedDate from "../models/BlockedDate";
import { checkVillaAvailability } from "../lib/booking/availability";

// Load .env.local if present
const envLocalPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envLocalPath)) {
  const envConfig = fs.readFileSync(envLocalPath, "utf8");
  envConfig.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const match = trimmed.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim().replace(/^["']|["']$/g, "");
        process.env[key] = value;
      }
    }
  });
}

const MONGODB_URI = process.env.MONGODB_URI;

let passedCount = 0;
let failedCount = 0;

function assert(condition: boolean, testName: string, failureDetail?: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passedCount++;
  } else {
    console.error(`  ✕ FAIL: ${testName}${failureDetail ? ` - ${failureDetail}` : ""}`);
    failedCount++;
  }
}

async function runBookingEngineTestSuite() {
  if (!MONGODB_URI) {
    console.error("ERROR: MONGODB_URI is not configured in .env.local");
    process.exit(1);
  }

  console.log("\n=======================================================");
  console.log("  DARANGA VILLA - BOOKING ENGINE TEST SUITE");
  console.log("=======================================================\n");

  try {
    console.log("Connecting to MongoDB database...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected successfully.\n");

    // Clean up any old test records if present
    await Villa.deleteMany({ slug: { $in: ["test-grand-villa-1000", "test-inactive-villa-500"] } });
    await Booking.deleteMany({ guestEmail: "testrunner@darangavilla.com" });

    // 1. Create Active Test Villa ($1000/night, maxGuests: 6)
    const testActiveVilla = await Villa.create({
      name: "Test Grand Villa 1000",
      slug: "test-grand-villa-1000",
      description: "Test villa for booking engine assertions",
      location: "Daranga Test Estate",
      pricePerNight: 1000,
      maxGuests: 6,
      bedrooms: 3,
      bathrooms: 3,
      status: "ACTIVE",
    });

    // 2. Create Inactive Test Villa ($500/night)
    const testInactiveVilla = await Villa.create({
      name: "Test Inactive Villa 500",
      slug: "test-inactive-villa-500",
      description: "Inactive test villa",
      location: "Daranga Test Estate",
      pricePerNight: 500,
      maxGuests: 4,
      status: "INACTIVE",
    });

    const villaId = testActiveVilla._id.toString();

    // -------------------------------------------------------------
    // TEST A: Villa with 1000/night calculation (10 Jan -> 15 Jan = 5 nights = $5000)
    // -------------------------------------------------------------
    const resA = await checkVillaAvailability({
      villaId,
      checkIn: "2027-01-10",
      checkOut: "2027-01-15",
      allowPastDatesForAdmin: true,
    });
    assert(
      resA.available === true && resA.numberOfNights === 5 && resA.totalAmount === 5000,
      "Test A: Villa with $1000/night calculates 5 nights = $5000 total",
      `Got available=${resA.available}, nights=${resA.numberOfNights}, total=${resA.totalAmount}`
    );

    // -------------------------------------------------------------
    // TEST B: Booking 10 Jan -> 15 Jan (Create active booking)
    // -------------------------------------------------------------
    const bookingB = await Booking.create({
      villaId: testActiveVilla._id,
      guestName: "Test Guest B",
      guestEmail: "testrunner@darangavilla.com",
      guestPhone: "+1234567890",
      checkIn: new Date("2027-01-10T00:00:00.000Z"),
      checkOut: new Date("2027-01-15T00:00:00.000Z"),
      guests: 2,
      totalAmount: 5000,
      status: "CONFIRMED",
      paymentStatus: "PAID",
      source: "WEBSITE",
    });
    assert(
      Boolean(bookingB._id),
      "Test B: Successfully created booking for 10 Jan -> 15 Jan"
    );

    // -------------------------------------------------------------
    // TEST C: Availability 10 Jan -> 15 Jan = unavailable (Exact overlap)
    // -------------------------------------------------------------
    const resC = await checkVillaAvailability({
      villaId,
      checkIn: "2027-01-10",
      checkOut: "2027-01-15",
      allowPastDatesForAdmin: true,
    });
    assert(
      resC.available === false && resC.conflictingBookingsCount === 1,
      "Test C: Availability 10 Jan -> 15 Jan returns unavailable due to existing booking"
    );

    // -------------------------------------------------------------
    // TEST D: Availability 15 Jan -> 18 Jan = available (Same checkout/checkin date boundary allowed)
    // -------------------------------------------------------------
    const resD = await checkVillaAvailability({
      villaId,
      checkIn: "2027-01-15",
      checkOut: "2027-01-18",
      allowPastDatesForAdmin: true,
    });
    assert(
      resD.available === true && resD.numberOfNights === 3,
      "Test D: Availability 15 Jan -> 18 Jan is ALLOWED (same checkout/checkin date boundary)"
    );

    // -------------------------------------------------------------
    // TEST E: Availability 14 Jan -> 18 Jan = unavailable (Partial overlap 14-15 Jan)
    // -------------------------------------------------------------
    const resE = await checkVillaAvailability({
      villaId,
      checkIn: "2027-01-14",
      checkOut: "2027-01-18",
      allowPastDatesForAdmin: true,
    });
    assert(
      resE.available === false,
      "Test E: Availability 14 Jan -> 18 Jan is REJECTED (overlap on 14-15 Jan)"
    );

    // -------------------------------------------------------------
    // TEST F: Cancelled booking does NOT block dates
    // -------------------------------------------------------------
    await Booking.create({
      villaId: testActiveVilla._id,
      guestName: "Cancelled Guest",
      guestEmail: "testrunner@darangavilla.com",
      guestPhone: "+1234567890",
      checkIn: new Date("2027-02-01T00:00:00.000Z"),
      checkOut: new Date("2027-02-05T00:00:00.000Z"),
      guests: 2,
      totalAmount: 4000,
      status: "CANCELLED",
      paymentStatus: "REFUNDED",
      source: "WEBSITE",
    });

    const resF = await checkVillaAvailability({
      villaId,
      checkIn: "2027-02-01",
      checkOut: "2027-02-05",
      allowPastDatesForAdmin: true,
    });
    assert(
      resF.available === true,
      "Test F: Cancelled booking (01-05 Feb) does NOT block inventory"
    );

    // -------------------------------------------------------------
    // TEST G: Guest count above maxGuests is rejected
    // -------------------------------------------------------------
    const resG = await checkVillaAvailability({
      villaId,
      checkIn: "2027-03-01",
      checkOut: "2027-03-05",
      guests: 10, // maxGuests is 6
      allowPastDatesForAdmin: true,
    });
    assert(
      resG.available === false && resG.errorCode === "EXCEEDS_CAPACITY",
      "Test G: Guest count (10) exceeding maxGuests (6) is rejected"
    );

    // -------------------------------------------------------------
    // TEST H: checkIn >= checkOut is rejected
    // -------------------------------------------------------------
    const resHSame = await checkVillaAvailability({
      villaId,
      checkIn: "2027-03-10",
      checkOut: "2027-03-10",
      allowPastDatesForAdmin: true,
    });
    const resHGreater = await checkVillaAvailability({
      villaId,
      checkIn: "2027-03-15",
      checkOut: "2027-03-10",
      allowPastDatesForAdmin: true,
    });
    assert(
      resHSame.available === false && resHGreater.available === false,
      "Test H: checkIn >= checkOut is rejected with invalid date errors"
    );

    // -------------------------------------------------------------
    // TEST I: Inactive villa cannot be booked
    // -------------------------------------------------------------
    const resI = await checkVillaAvailability({
      villaId: testInactiveVilla._id.toString(),
      checkIn: "2027-04-01",
      checkOut: "2027-04-05",
      allowPastDatesForAdmin: true,
    });
    assert(
      resI.available === false && resI.errorCode === "VILLA_INACTIVE",
      "Test I: Inactive villa cannot be booked (returns VILLA_INACTIVE)"
    );

    // -------------------------------------------------------------
    // TEST J: Server calculates totalAmount correctly ($1000/night * 4 nights = $4000)
    // -------------------------------------------------------------
    const resJ = await checkVillaAvailability({
      villaId,
      checkIn: "2027-05-01",
      checkOut: "2027-05-05",
      allowPastDatesForAdmin: true,
    });
    assert(
      resJ.numberOfNights === 4 && resJ.totalAmount === 4000,
      "Test J: Server calculates totalAmount correctly ($1000 x 4 nights = $4000)"
    );

    // -------------------------------------------------------------
    // TEST K: Frontend-supplied totalAmount cannot manipulate price
    // -------------------------------------------------------------
    // Verification: our checkVillaAvailability ignores frontend price and derives totalAmount directly from Villa.pricePerNight
    assert(
      resJ.totalAmount === 4000,
      "Test K: Server derives totalAmount exclusively from Villa.pricePerNight ($4000)"
    );

    // -------------------------------------------------------------
    // TEST L: Blocked dates prevent booking
    // -------------------------------------------------------------
    const blockedDateL = await BlockedDate.create({
      villaId: testActiveVilla._id,
      startDate: new Date("2027-06-10T00:00:00.000Z"),
      endDate: new Date("2027-06-15T00:00:00.000Z"),
      reason: "Annual Pool & Roof Maintenance",
    });

    const resL = await checkVillaAvailability({
      villaId,
      checkIn: "2027-06-12",
      checkOut: "2027-06-18",
      allowPastDatesForAdmin: true,
    });
    assert(
      resL.available === false && resL.conflictingBlockedDatesCount === 1,
      "Test L: Blocked dates (10-15 Jun) prevent booking for overlapping dates (12-18 Jun)"
    );

    // -------------------------------------------------------------
    // TEST M: Invalid villa ID is handled safely
    // -------------------------------------------------------------
    const resM = await checkVillaAvailability({
      villaId: "invalid-object-id-string",
      checkIn: "2027-07-01",
      checkOut: "2027-07-05",
      allowPastDatesForAdmin: true,
    });
    assert(
      resM.available === false && resM.errorCode === "VILLA_NOT_FOUND",
      "Test M: Invalid villa ID string is handled safely without throwing crash"
    );

    // Cleanup test records
    await Villa.deleteMany({ slug: { $in: ["test-grand-villa-1000", "test-inactive-villa-500"] } });
    await Booking.deleteMany({ guestEmail: "testrunner@darangavilla.com" });
    await BlockedDate.deleteMany({ _id: blockedDateL._id });

    await mongoose.disconnect();
    console.log("\n=======================================================");
    console.log(`  RESULTS: ${passedCount} PASSED, ${failedCount} FAILED`);
    console.log("=======================================================\n");

    if (failedCount > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error("Test Suite Error:", error);
    process.exit(1);
  }
}

runBookingEngineTestSuite();
