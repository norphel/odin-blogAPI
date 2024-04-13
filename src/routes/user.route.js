import { Router } from "express";

const router = Router();

router.post("/register", (req, res) => {
  res.json({ msg: "User register route. YET TO BE IMPLEMENTED" });
});

export default router;
