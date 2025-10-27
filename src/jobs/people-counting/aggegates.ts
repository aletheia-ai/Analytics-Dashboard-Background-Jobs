import { RangeType } from "../../utils/types/range-type";
import { client } from "../../server";

const defaultData = {
  enterCount: 0,
  exitCount: 0,
  maskCount: 0,
  unMaskCount: 0,
  maleCount: 0,
  feMaleCount: 0,
  passingBy: 0,
  age_0_9_Count: 0,
  age_10_18_Count: 0,
  age_19_34_Count: 0,
  age_35_60_Count: 0,
  age_60plus_Count: 0,
  interestedCustomers: 0,
  buyingCustomers: 0,
  liveOccupancy: 0,
};
const pipeline = (time: Date, range: RangeType) => {
  return [
    {
      $match: {
        createdAt: { $gte: time },
      },
    },
    {
      $facet: {
        perStore: [
          {
            $group: {
              _id: "$store",
              enterCount: { $sum: "$enterCount" },
              exitCount: { $sum: "$exitCount" },
              maskCount: { $sum: "$maskCount" },
              unMaskCount: { $sum: "$unMaskCount" },
              maleCount: { $sum: "$maleCount" },
              feMaleCount: { $sum: "$feMaleCount" },
              passingBy: { $sum: "$passingBy" },
              age_0_9_Count: { $sum: "$age_0_9_Count" },
              age_10_18_Count: { $sum: "$age_10_18_Count" },
              age_19_34_Count: { $sum: "$age_19_34_Count" },
              age_35_60_Count: { $sum: "$age_35_60_Count" },
              age_60plus_Count: { $sum: "$age_60plus_Count" },
              interestedCustomers: { $sum: "$interestedCustomers" },
              buyingCustomers: { $sum: "$buyingCustomers" },
              liveOccupancy: { $sum: "$liveOccupancy" },

              cameraId: { $last: "$cameraId" },
              createdAt: { $last: "$createdAt" },
            },
          },
          {
            $project: {
              _id: 0,
              store: "$_id",
              cameraId: "all",
              range: range,
              data: {
                enterCount: "$enterCount",
                exitCount: "$exitCount",
                maskCount: "$maskCount",
                unMaskCount: "$unMaskCount",
                maleCount: "$maleCount",
                feMaleCount: "$feMaleCount",
                passingBy: "$passingBy",
                age_0_9_Count: "$age_0_9_Count",
                age_10_18_Count: "$age_10_18_Count",
                age_19_34_Count: "$age_19_34_Count",
                age_35_60_Count: "$age_35_60_Count",
                age_60plus_Count: "$age_60plus_Count",
                interestedCustomers: "$interestedCustomers",
                buyingCustomers: "$buyingCustomers",
                liveOccupancy: "$liveOccupancy",
              },
            },
          },
        ],
        perStoreCamera: [
          {
            $group: {
              _id: { store: "$store", cameraId: "$cameraId" },
              enterCount: { $sum: "$enterCount" },
              exitCount: { $sum: "$exitCount" },
              maskCount: { $sum: "$maskCount" },
              unMaskCount: { $sum: "$unMaskCount" },
              maleCount: { $sum: "$maleCount" },
              feMaleCount: { $sum: "$feMaleCount" },
              passingBy: { $sum: "$passingBy" },
              age_0_9_Count: { $sum: "$age_0_9_Count" },
              age_10_18_Count: { $sum: "$age_10_18_Count" },
              age_19_34_Count: { $sum: "$age_19_34_Count" },
              age_35_60_Count: { $sum: "$age_35_60_Count" },
              age_60plus_Count: { $sum: "$age_60plus_Count" },
              interestedCustomers: { $sum: "$interestedCustomers" },
              buyingCustomers: { $sum: "$buyingCustomers" },
              liveOccupancy: { $sum: "$liveOccupancy" },

              // keep latest fields
              createdAt: { $last: "$createdAt" },
            },
          },
          {
            $project: {
              _id: 0,
              store: "$_id.store",
              cameraId: "$_id.cameraId",
              range: range,
              data: {
                enterCount: "$enterCount",
                exitCount: "$exitCount",
                maskCount: "$maskCount",
                unMaskCount: "$unMaskCount",
                maleCount: "$maleCount",
                feMaleCount: "$feMaleCount",
                passingBy: "$passingBy",
                age_0_9_Count: "$age_0_9_Count",
                age_10_18_Count: "$age_10_18_Count",
                age_19_34_Count: "$age_19_34_Count",
                age_35_60_Count: "$age_35_60_Count",
                age_60plus_Count: "$age_60plus_Count",
                interestedCustomers: "$interestedCustomers",
                buyingCustomers: "$buyingCustomers",
                liveOccupancy: "$liveOccupancy",
              },
            },
          },
        ],
      },
    },
  ];
};
export const calculateAggreagates = async (time: Date, range: RangeType) => {
  const db = client.db("brick-and-mortars");
  const rawStats = db.collection("person_countings");
  const result = await rawStats.aggregate(pipeline(time, range)).toArray();
  const productStats = db.collection("product_stats");

  const [doc] = result;
  const mergedArray = [...(doc?.perStore || []), ...(doc.perStoreCamera || [])];
  for (const item of mergedArray) {
    await productStats.updateOne(
      {
        store: item.store,
        cameraId: item.cameraId,
        range: item.range,
      },
      {
        $set: {
          data: item.data,
          updatedAt: new Date(),
          source: "from-cron",
        },
      },
      { upsert: true }
    );
  }

  const stores = mergedArray.map((item) => item.store);

  const existingStores = await productStats
    .find({
      store: { $nin: stores },
      range: range as string,
    })
    .toArray();
  if (existingStores.length) {
    const bulkOps = existingStores.map((doc) => ({
      updateOne: {
        filter: { _id: doc._id },
        update: {
          $set: {
            store: doc.store,
            cameraId: doc.cameraId,
            range: range,
            data: defaultData,
          },
        },
        upsert: true,
      },
    }));
    if (bulkOps.length) {
      await productStats.bulkWrite(bulkOps);
    }
  }
  if (range === RangeType.DAILY) {
    await productStats.updateMany(
      { range: "all" },
      {
        $set: {
          data: defaultData,
          source: "from-cron",
        },
      }
    );
  }
};
