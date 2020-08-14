import mongoose from "mongoose";
import request from "supertest";
import { app } from "../../app";
import { Ticket } from "../../models/ticket";
import { Order } from "../../models/orders";
import { OrderStatus } from "@coboard/common";
import { natsWrapper } from "../../nats-wrapper";

it("should return an error if the ticket does not exist", async () => {
	const ticketId = mongoose.Types.ObjectId();

	await request(app).post("/api/orders").set("Cookie", global.signin()).send({ ticketId }).expect(404);
});

it("should return an error if the ticket is already reserved", async () => {
	const ticket = Ticket.build({
		title: "GOT premiere",
		price: 5000,
		id: mongoose.Types.ObjectId().toHexString(),
	});

	await ticket.save();

	const order = await Order.build({
		userId: "123456789",
		status: OrderStatus.Created,
		expiresAt: new Date(),
		ticket,
	});

	order.save();

	await request(app)
		.post("/api/orders")
		.set("Cookie", global.signin())
		.send({ ticketId: ticket.id })
		.expect(400);
});

it("should reserve a ticket", async () => {
	const ticket = await Ticket.build({
		title: "Rains of Castamere",
		price: 700,
		id: mongoose.Types.ObjectId().toHexString(),
	});

	ticket.save();

	await request(app)
		.post("/api/orders")
		.set("Cookie", global.signin())
		.send({ ticketId: ticket.id })
		.expect(201);
});

it("should emit an order created event", async () => {
	const ticket = await Ticket.build({
		title: "Rains of Castamere",
		price: 700,
		id: mongoose.Types.ObjectId().toHexString(),
	});

	ticket.save();

	await request(app)
		.post("/api/orders")
		.set("Cookie", global.signin())
		.send({ ticketId: ticket.id })
		.expect(201);

	expect(natsWrapper.client.publish).toHaveBeenCalled();
});
