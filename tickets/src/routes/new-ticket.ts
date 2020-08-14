import express, { Request, Response } from "express";
import { body, sanitize } from "express-validator";
import { isAuthorized, validateRequest } from "@coboard/common";
import { Ticket } from "../models/ticket";
import { TicketCreatedPublisher } from "../events/publishers/ticket-created-publisher";
import { natsWrapper } from "../nats-wrapper";

const router = express.Router();

const sanitizeRequest = [
	body("title").not().isEmpty().withMessage("Ticket title is required"),
	body("price").isFloat({ gt: 0 }).withMessage("Price must be greater than zero"),
];

router.post(
	"/api/tickets",
	isAuthorized,
	sanitizeRequest,
	validateRequest,
	async (req: Request, res: Response) => {
		const { title, price } = req.body;

		const ticket = Ticket.build({
			title,
			price,
			userId: req.currentUser!.id,
		});

		await ticket.save();

		await new TicketCreatedPublisher(natsWrapper.client).publish({
			id: ticket.id,
			title: ticket.title,
			price: ticket.price,
			userId: ticket.userId,
			version: ticket.version,
		});

		res.status(201).send(ticket);
	}
);

export { router as newTicketRouter };
