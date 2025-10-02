import cron from "node-cron";
import * as dotenv from "dotenv";
import { MongoClient } from "mongodb";
import { calculateAggreagates, resetStats } from "jobs/people-counting";
import { RangeType } from "utils/types.ts/range-type";
dotenv.config();

const uri = process.env.MONGO_URL!;
export const client = new MongoClient(uri);

(async () => {
  try {
    await client.connect();
    console.log("Connected to MongoDB ✅");

    cron.schedule("*/15 * * * * *", () => {
      calculateAggreagates(
        new Date(Date.now() - 15 * 60 * 1000),
        RangeType.QUARTER_HOURLY
      );
    });
    cron.schedule("*/15 * * * * *", () => {
      calculateAggreagates(
        new Date(Date.now() - 30 * 60 * 1000),
        RangeType.HALF_HOURLY
      );
    });
    cron.schedule("*/15 * * * * *", () => {
      calculateAggreagates(
        new Date(Date.now() - 60 * 60 * 1000),
        RangeType.HOURLY
      );
    });

    cron.schedule("0 0 * * *", () => {
      calculateAggreagates(
        new Date(Date.now() - 24 * 60 * 60 * 1000),
        RangeType.DAILY
      );
    });

    cron.schedule("59 59 23 * * 0", () => {
      resetStats("day wise stats");
    });
    cron.schedule("59 59 23 * * *", () => {
      resetStats("hour wise stats");
    });
  } catch (err) {
    console.error("MongoDB connection error ❌", err);
  }
})();
