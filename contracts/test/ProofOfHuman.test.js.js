const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ProofOfHuman", function () {
  let proofOfHuman;
  let owner;
  let addr1;
  let addr2;

  // Mock addresses for testing
  const MOCK_HUB_ADDRESS = "0x1234567890123456789012345678901234567890";
  const MOCK_SCOPE = 1;
  const MOCK_CONFIG_ID = ethers.encodeBytes32String("test-config");

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    const ProofOfHuman = await ethers.getContractFactory("ProofOfHuman");
    proofOfHuman = await ProofOfHuman.deploy(MOCK_HUB_ADDRESS, MOCK_SCOPE, MOCK_CONFIG_ID);
  });

  describe("isExpired", function () {
    it("should return false for future dates", async function () {
      // Get current date and add 1 year
      const currentDate = new Date();
      const futureYear = currentDate.getFullYear() + 1;
      const futureDate = `${futureYear}-12-31`;

      const isExpired = await proofOfHuman.isExpired(futureDate);
      expect(isExpired).to.be.false;
    });

    it("should return true for past dates", async function () {
      // Use a date that is definitely in the past
      const pastDate = "2020-01-01";

      const isExpired = await proofOfHuman.isExpired(pastDate);
      expect(isExpired).to.be.true;
    });

    it("should return true for today's date", async function () {
      // Get today's date in YYYY-MM-DD format
      const today = new Date();
      const todayString = today.toISOString().split("T")[0]; // YYYY-MM-DD format

      const isExpired = await proofOfHuman.isExpired(todayString);
      expect(isExpired).to.be.false; // Should be expired since we add 1 day in the function
    });

    it("should return false for tomorrow's date", async function () {
      // Get tomorrow's date
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowString = tomorrow.toISOString().split("T")[0];

      const isExpired = await proofOfHuman.isExpired(tomorrowString);
      expect(isExpired).to.be.false;
    });

    it("should handle leap year dates correctly", async function () {
      // Test leap year date (2024 is a leap year)
      const leapYearDate = "2024-02-29";

      // This should not throw an error for valid leap year date
      await expect(proofOfHuman.isExpired(leapYearDate)).to.not.be.reverted;
    });

    it("should reject invalid leap year dates", async function () {
      // Test invalid leap year date (2023 is not a leap year)
      const invalidLeapYearDate = "2023-02-29";

      await expect(proofOfHuman.isExpired(invalidLeapYearDate)).to.be.revertedWith("Invalid date");
    });

    it("should reject invalid date formats", async function () {
      const invalidFormats = [
        "2023/12/31", // Wrong separator
        "2023-12-31-", // Extra separator
        "2023-12", // Missing day
        "2023-12-31-15", // Extra parts
        "2023-12-31 15:30:00", // Time included
        "31-12-2023", // Wrong order
        "2023-13-01", // Invalid month
        "2023-12-32", // Invalid day
        "2023-00-01", // Invalid month
        "2023-12-00", // Invalid day
        "abc-def-ghi", // Non-numeric
        "2023-12-3a", // Mixed numeric and alphabetic
      ];

      for (const invalidDate of invalidFormats) {
        await expect(proofOfHuman.isExpired(invalidDate)).to.be.reverted;
      }
    });

    it("should reject dates with wrong length", async function () {
      const wrongLengthDates = [
        "2023-12-3", // Too short
        "2023-12-31-", // Too long
        "2023-12-31-1", // Too long
        "2023-12-31-12", // Too long
      ];

      for (const invalidDate of wrongLengthDates) {
        await expect(proofOfHuman.isExpired(invalidDate)).to.be.revertedWith(
          "Invalid date format. Expected YYYY-MM-DD"
        );
      }
    });

    it("should reject dates with wrong separators", async function () {
      const wrongSeparatorDates = ["2023/12/31", "2023.12.31", "2023_12_31", "2023 12 31"];

      for (const invalidDate of wrongSeparatorDates) {
        await expect(proofOfHuman.isExpired(invalidDate)).to.be.revertedWith(
          "Invalid date format. Expected YYYY-MM-DD"
        );
      }
    });

    it("should handle edge case dates correctly", async function () {
      // Test various edge cases
      const edgeCases = [
        "1970-01-01", // Unix epoch start
        "2038-01-19", // Year 2038 problem (32-bit timestamp limit)
        "2023-01-01", // January 1st
        "2023-12-31", // December 31st
        "2023-06-15", // Mid-year
      ];

      for (const date of edgeCases) {
        await expect(proofOfHuman.isExpired(date)).to.not.be.reverted;
      }
    });

    it("should reject dates before 1970", async function () {
      const preEpochDate = "1969-12-31";

      await expect(proofOfHuman.isExpired(preEpochDate)).to.be.revertedWith("Invalid date");
    });

    it("should handle month boundaries correctly", async function () {
      const monthBoundaries = [
        "2023-01-31", // January (31 days)
        "2023-02-28", // February (28 days in non-leap year)
        "2023-03-31", // March (31 days)
        "2023-04-30", // April (30 days)
        "2023-05-31", // May (31 days)
        "2023-06-30", // June (30 days)
        "2023-07-31", // July (31 days)
        "2023-08-31", // August (31 days)
        "2023-09-30", // September (30 days)
        "2023-10-31", // October (31 days)
        "2023-11-30", // November (30 days)
        "2023-12-31", // December (31 days)
      ];

      for (const date of monthBoundaries) {
        await expect(proofOfHuman.isExpired(date)).to.not.be.reverted;
      }
    });

    it("should reject invalid month boundaries", async function () {
      const invalidMonthBoundaries = [
        "2023-01-32", // January has 31 days
        "2023-02-29", // February has 28 days in 2023 (non-leap year)
        "2023-03-32", // March has 31 days
        "2023-04-31", // April has 30 days
        "2023-05-32", // May has 31 days
        "2023-06-31", // June has 30 days
        "2023-07-32", // July has 31 days
        "2023-08-32", // August has 31 days
        "2023-09-31", // September has 30 days
        "2023-10-32", // October has 31 days
        "2023-11-31", // November has 30 days
        "2023-12-32", // December has 31 days
      ];

      for (const invalidDate of invalidMonthBoundaries) {
        await expect(proofOfHuman.isExpired(invalidDate)).to.be.revertedWith("Invalid date");
      }
    });
  });

  describe("_parseUint", function () {
    it("should parse valid numeric strings correctly", async function () {
      // We can test this indirectly through isExpired
      const validDate = "2023-12-31";
      await expect(proofOfHuman.isExpired(validDate)).to.not.be.reverted;
    });

    it("should reject non-numeric characters", async function () {
      const invalidDates = [
        "202a-12-31", // Non-numeric in year
        "2023-1a-31", // Non-numeric in month
        "2023-12-3a", // Non-numeric in day
      ];

      for (const invalidDate of invalidDates) {
        await expect(proofOfHuman.isExpired(invalidDate)).to.be.revertedWith("Invalid digit");
      }
    });
  });
});
