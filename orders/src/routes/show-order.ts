import express, { Request, Response } from "express";
import { isAuthorized, NotFoundError, NotAuthorizedError } from "@coboard/common";
import { Order } from "../models/orders";

const router = express.Router();

router.get("/api/orders/:orderId", isAuthorized, async (req: Request, res: Response) => {
	const order = await Order.findById(req.params.orderId).populate("ticket");

	if (!order) {
		throw new NotFoundError();
	}

	if (order.userId !== req.currentUser!.id) {
		throw new NotAuthorizedError();
	}

	res.status(200).json(order);
});

export { router as showOrderRouter };
