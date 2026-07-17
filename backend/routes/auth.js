import express from "express";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import User from "../models/User.js";

const router = express.Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

function createToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET || "property-hub-dev-secret", {
    expiresIn: "7d",
  });
}

router.post("/demo", async (req, res) => {
  try {
    const demoEmail = "demo@propertyhub.local";
    let user = await User.findOne({ email: demoEmail });

    if (!user) {
      user = await User.create({
        googleId: "demo-user",
        name: "Demo User",
        email: demoEmail,
        picture: "https://ui-avatars.com/api/?name=Demo+User&background=0f766e&color=fff",
      });
    }

    res.json({
      token: createToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        picture: user.picture,
      },
    });
  } catch (err) {
    console.error("Demo auth error:", err.message);
    res.status(500).json({ message: "Demo login failed" });
  }
});

router.post("/google", async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ message: "idToken is required" });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    let user = await User.findOne({ googleId: payload.sub });
    if (!user) {
      user = await User.create({
        googleId: payload.sub,
        name: payload.name,
        email: payload.email,
        picture: payload.picture,
      });
    }

    res.json({
      token: createToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        picture: user.picture,
      },
    });
  } catch (err) {
    console.error("Google auth error:", err.message);
    res.status(401).json({ message: "Invalid Google token" });
  }
});

export default router;
