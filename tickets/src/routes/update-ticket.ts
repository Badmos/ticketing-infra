import express, { Request, Response } from "express";
import { body } from "express-validator";
import { Ticket } from "../models/ticket";
import {
	validateRequest,
	NotAuthorizedError,
	NotFoundError,
	isAuthorized,
	BadRequestError,
} from "@coboard/common";
import { TicketUpdatedPublisher } from "../events/publishers/ticket-updated-publisher";
import { natsWrapper } from "../nats-wrapper";

const router = express.Router();

const sanitizeRequest = [
	body("title").not().isEmpty().withMessage("Ticket title is required"),
	body("price").isFloat({ gt: 0 }).withMessage("Price must be greater than zero"),
];

router.put(
	"/api/tickets/:id",
	isAuthorized,
	sanitizeRequest,
	validateRequest,
	async (req: Request, res: Response) => {
		const ticket = await Ticket.findById(req.params.id);

		if (!ticket) {
			throw new NotFoundError();
		}

		if (ticket.orderId) {
			throw new BadRequestError("Cannot edit a reserved ticket");
		}

		if (ticket.userId !== req.currentUser!.id) {
			console.log("Do we actually get here?");
			throw new NotAuthorizedError();
		}

		console.log(ticket.userId, "ticket.userId");
		console.log(req.currentUser!.id);

		ticket.set({
			title: req.body.title,
			price: req.body.price,
		});

		await ticket.save();

		new TicketUpdatedPublisher(natsWrapper.client).publish({
			id: ticket.id,
			title: ticket.title,
			price: ticket.price,
			userId: ticket.userId,
			version: ticket.version,
		});

		res.send(ticket);
	}
);

export { router as updateTicketRouter };
