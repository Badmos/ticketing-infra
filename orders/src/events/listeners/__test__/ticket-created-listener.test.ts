import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { TicketCreatedListener } from "../ticket-created-listener";
import { natsWrapper } from "../../../nats-wrapper";
import { TicketCreatedEvent } from "@coboard/common";
import { Ticket } from "../../../models/ticket";

const setup = async () => {
	const listener = new TicketCreatedListener(natsWrapper.client);

	const data: TicketCreatedEvent["data"] = {
		id: new mongoose.Types.ObjectId().toHexString(),
		version: 0,
		title: "Game of Thrones",
		price: 40,
		userId: new mongoose.Types.ObjectId().toHexString(),
	};

	//@ts-ignore
	const msg: Message = {
		ack: jest.fn(),
	};

	return { listener, data, msg };
};

it("should create and save a ticket", async () => {
	const { listener, data, msg } = await setup();

	await listener.onMessage(data, msg);

	const ticket = await Ticket.findById(data.id);

	expect(ticket).toBeDefined();
	expect(ticket?.title).toEqual(data.title);
	expect(ticket?.price).toEqual(data.price);
});

it("should ack the message", async () => {
	const { data, listener, msg } = await setup();

	await listener.onMessage(data, msg);

	expect(msg.ack).toHaveBeenCalled();
});
