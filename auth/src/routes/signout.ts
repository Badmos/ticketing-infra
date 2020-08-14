import express from "express";

const router = express.Router();

router.post("/api/users/signout", (req, res) => {
  req.session = null;
  res.json({ message: "user has been signout" });
});

export { router as signoutRouter };
