import express, { Request, Response } from "express";
import { body } from "express-validator";
import mongoose from "mongoose";
import {
	isAuthorized,
	validateRequest,
	BadRequestError,
	NotFoundError,
	NotAuthorizedError,
	OrderStatus,
} from "@coboard/common";
import { Order } from "../models/order";
import { stripe } from "../stripe";
import { Payment } from "../models/payment";
import { PaymentCreatedPublisher } from "../events/publishers/payment-created-publisher";
import { natsWrapper } from "../nats-wrapper";

const router = express.Router();

const sanitizeRequest = [body("token").not().isEmpty(), body("orderId").not().isEmpty()];

router.post("/api/payments", isAuthorized, sanitizeRequest, validateRequest, async (req: Request, res: Response) => {
	const { token, orderId } = req.body;

	if (!mongoose.Types.ObjectId.isValid(orderId)) {
		throw new BadRequestError("String passed must be a mongodb Object Id");
	}

	const order = await Order.findById(orderId);

	if (!order) {
		throw new NotFoundError();
	}

	if (order.userId !== req.currentUser!.id) {
		throw new NotAuthorizedError();
	}
	if (order.status === OrderStatus.Cancelled) {
		throw new BadRequestError("Cannot pay for a cancelled order");
	}

	const charge = await stripe.charges.create({
		currency: "usd",
		amount: order.price * 100,
		source: token,
	});

	const payment = Payment.build({
		orderId,
		stripeId: charge.id,
	});

	await payment.save();

	await new PaymentCreatedPublisher(natsWrapper.client).publish({
		id: payment.id,
		orderId: payment.orderId,
		stripeId: payment.stripeId,
	});

	res.status(201).send({
		status: "success",
		message: "Payment successfully created",
		data: {
			id: payment.id,
		},
	});
});

export { router as createChargeRouter };
