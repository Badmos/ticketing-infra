import request from "supertest";
import mongoose from "mongoose";
import { app } from "../../app";
import { Ticket } from "../../models/ticket";
import { Order } from "../../models/orders";

it("should fetch a specific order", async () => {
	const ticket = Ticket.build({
		title: "concert",
		price: 20,
		id: mongoose.Types.ObjectId().toHexString(),
	});

	await ticket.save();

	const user = global.signin();

	const order = await request(app)
		.post("/api/orders")
		.set("Cookie", user)
		.send({ ticketId: ticket.id })
		.expect(201);

	await request(app)
		.get(`/api/orders/${order.body.id}`)
		.set("Cookie", user)
		.send({ ticketId: ticket.id })
		.expect(200);
});

it("should return an error if one user tries to fetch another user's order", async () => {
	const ticket = Ticket.build({
		title: "concert",
		price: 20,
		id: mongoose.Types.ObjectId().toHexString(),
	});

	await ticket.save();

	const user = global.signin();

	const order = await request(app)
		.post("/api/orders")
		.set("Cookie", user)
		.send({ ticketId: ticket.id })
		.expect(201);

	await request(app)
		.get(`/api/orders/${order.body.id}`)
		.set("Cookie", global.signin())
		.send({ ticketId: ticket.id })
		.expect(401);
});
