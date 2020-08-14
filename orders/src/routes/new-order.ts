import express, { Request, Response } from "express";
import mongoose from "mongoose";
import {
	isAuthorized,
	validateRequest,
	NotFoundError,
	OrderStatus,
	BadRequestError,
} from "@coboard/common";
import { body } from "express-validator";
import { Ticket } from "../models/ticket";
import { Order } from "../models/orders";
import { OrderCreatedPublisher } from "../events/publishers/order-created-publisher";
import { natsWrapper } from "../nats-wrapper";

const router = express.Router();
const ORDER_EXPIRATION_WINDON_IN_SECONDS = 0.25 * 60; //Can be saved as an env var in kube cluster

const sanitizeRequest = [
	body("ticketId")
		.not()
		.isEmpty()
		// checking if tickedId is a Mongodb Object ID is not ideal. what happens if the Ticket
		// service changes database or if another service entirely now emits ticketCreated event.
		.custom((input: string) => mongoose.Types.ObjectId.isValid(input))
		.withMessage("Ticket title is required"),
];

router.post(
	"/api/orders",
	isAuthorized,
	sanitizeRequest,
	validateRequest,
	async (req: Request, res: Response) => {
		const { ticketId } = req.body;
		const ticket = await Ticket.findById(ticketId);

		if (!ticket) {
			throw new NotFoundError();
		}

		const isReserved = await ticket.isReserved();

		if (isReserved) {
			throw new BadRequestError("Ticket has already been reserved");
		}

		const expiration = new Date();

		// or maybe just say Date.now() ???
		expiration.setSeconds(expiration.getSeconds() + ORDER_EXPIRATION_WINDON_IN_SECONDS);

		const order = Order.build({
			userId: req.currentUser!.id,
			status: OrderStatus.Created,
			ticket,
			expiresAt: expiration,
		});

		await order.save();

		// publish event
		new OrderCreatedPublisher(natsWrapper.client).publish({
			id: order.id,
			status: OrderStatus.Created,
			userId: order.userId,
			expiresAt: order.expiresAt.toISOString(),
			ticket: {
				id: ticket.id,
				price: ticket.price,
			},
			version: order.version,
		});

		res.status(201).json(order);
	}
);

export { router as newOrderRouter };
