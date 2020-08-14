import express, { Request, Response } from "express";
import { Order } from "../models/orders";
import { isAuthorized, NotAuthorizedError, NotFoundError, OrderStatus } from "@coboard/common";
import { OrderCancelledPublisher } from "../events/publishers/order-cancelled-publisher";
import { natsWrapper } from "../nats-wrapper";

const router = express.Router();

router.patch("/api/orders/:orderId", isAuthorized, async (req: Request, res: Response) => {
	const { orderId } = req.params;

	const order = await Order.findById(orderId).populate("ticket");

	if (!order) {
		throw new NotFoundError();
	}

	if (order.userId !== req.currentUser!.id) {
		throw new NotAuthorizedError();
	}

	order.status = OrderStatus.Cancelled;
	await order.save();

	//publish an order cancelled event
	new OrderCancelledPublisher(natsWrapper.client).publish({
		id: order.id,
		ticket: {
			id: order.ticket.id,
		},
		version: order.version,
	});

	res.status(204).json(order);
});

export { router as deleteOrderRouter };
