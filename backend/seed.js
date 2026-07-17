import mongoose from "mongoose";
import dotenv from "dotenv";
import Property from "./models/Property.js";
import { sampleProperties } from "./data/sampleProperties.js";

dotenv.config();

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB, refreshing sample listings…");
    await Property.deleteMany({});
    await Property.insertMany(sampleProperties);
    console.log(`Inserted ${sampleProperties.length} sample properties.`);
  } catch (err) {
    console.error("Seed error:", err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();
