import { client } from "../../server";
export const resetStats = async (collection: string) => {
  console.log("Executing a cron-job");
  const db = client.db("global-dashboard");

  db.collection(collection).updateMany(
    {},
    {
      $set: {
        "data.enterCount": 0,
        "data.exitCount": 0,
        "data.maskCount": 0,
        "data.unMaskCount": 0,
        "data.maleCount": 0,
        "data.feMaleCount": 0,
        "data.passingBy": 0,
        "data.age_0_9_Count": 0,
        "data.age_10_18_Count": 0,
        "data.age_19_34_Count": 0,
        "data.age_35_60_Count": 0,
        "data.age_60plus_Count": 0,
        "data.interestedCustomers": 0,
        "data.buyingCustomers": 0,
        "data.liveOccupancy": 0,
        "data.cameraId": "aa",
      },
    }
  );
};
