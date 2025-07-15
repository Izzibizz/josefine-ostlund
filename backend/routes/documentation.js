import express from "express";
import expressListEndpoints from "express-list-endpoints";

const router = express.Router();

//API Documentation
router.get("/", (req, res) => {
  const endpoints = expressListEndpoints(req.app);
  res.status(200).json(endpoints);
});

export default router;
