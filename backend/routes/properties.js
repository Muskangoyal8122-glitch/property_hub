import express from "express";
import Property from "../models/Property.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

// GET /api/properties -> sab properties list karo (naya pehle)
router.get("/", requireAuth, async (req, res) => {
  try {
    const properties = await Property.find().sort({ createdAt: -1 });
    res.json(properties);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch properties" });
  }
});

// POST /api/properties -> nayi property add karo
router.post("/", requireAuth, async (req, res) => {
  try {
    const { title, location, price, type, bedrooms, bathrooms, area, description, image } = req.body;
    if (!title || !location || !price) {
      return res.status(400).json({ message: "title, location and price are required" });
    }

    const property = await Property.create({
      title,
      location,
      price,
      type: type === "buy" ? "buy" : "rent",
      bedrooms,
      bathrooms,
      area,
      description,
      image,
      owner: req.userId,
    });

    res.status(201).json(property);
  } catch (err) {
    res.status(500).json({ message: "Failed to create property" });
  }
});

export default router;
