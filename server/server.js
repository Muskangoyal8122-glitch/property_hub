import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.js";
import propertyRoutes from "./routes/properties.js";
import Property from "./models/Property.js";
import { sampleProperties } from "./data/sampleProperties.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB se connect karo, aur agar database khaali hai to demo listings daal do
mongoose
  .connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log("✅ MongoDB connected");
    try {
      const count = await Property.countDocuments();
      if (count === 0) {
        await Property.insertMany(sampleProperties);
        console.log(`🌱 Auto-seeded ${sampleProperties.length} sample properties (database was empty).`);
      } else {
        console.log(`ℹ️  Database already has ${count} properties — skipping auto-seed.`);
      }
    } catch (seedErr) {
      console.error("Auto-seed error:", seedErr.message);
    }
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/properties", propertyRoutes);

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
