// // import { Worker } from "bullmq";
// const IORedis = require("ioredis");
// import { worker as Worker } from "../config/bull-mq";
// const connection = new IORedis();

// export const worker = new Worker(
//   "test",
//   async (job) => {
//     // console.log(👷 Processing job ${job.id} with data:, job.data);
//     console.log(job);
//     // Simulate async task (e.g., sending email)
//     // await new Promise((resolve) => setTimeout(resolve, 2000));

//     // if (job.data.shouldFail) {
//     //   throw new Error("Email sending failed!");
//     // }

//     // return { status: "Email sent successfully" };
//   },
//   { connection }
// );

// // Events
// worker.on("completed", (job, result) => {
//   console.log(`✅ Job ${job.id} completed:, result`);
// });

// worker.on("failed", (job, err) => {
//   console.error(`❌ Job ${job?.id} failed:, err.message`);
// });
