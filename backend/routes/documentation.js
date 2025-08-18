import express from "express";
import expressListEndpoints from "express-list-endpoints";

const router = express.Router();

router.get("/", (req, res) => {
  const endpoints = expressListEndpoints(app);
  res.status(200).json(endpoints);
});

export default router;