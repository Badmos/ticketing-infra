import express, { Request, Response } from "express";
import { isAuthorized } from "@coboard/common";
import { Order } from "../models/orders";

const router = express.Router();

router.get("/api/orders", isAuthorized, async (req: Request, res: Response) => {
	const orders = await Order.find({
		userId: req.currentUser!.id,
	}).populate("ticket");

	res.status(200).json(orders);
});

export { router as indexOrderRouter };
