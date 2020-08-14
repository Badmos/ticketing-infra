import request from "supertest";
import mongoose from "mongoose";
import { app } from "../../app";
import { Ticket } from "../../models/ticket";
import { Order } from "../../models/orders";

const buildTicket = async () => {
	const ticket = Ticket.build({
		title: "concert",
		price: 20,
		id: mongoose.Types.ObjectId().toHexString(),
	});

	await ticket.save();

	return ticket;
};

it("should fetch orders for a particular user", async () => {
	//create three different tickets
	const ticketOne = await buildTicket();
	const ticketTwo = await buildTicket();
	const ticketThree = await buildTicket();

	// fake three different users
	const userOne = global.signin();
	const userTwo = global.signin();

	//reserve forst ticket for user one
	await request(app)
		.post("/api/orders")
		.set("Cookie", userOne)
		.send({ ticketId: ticketOne.id })
		.expect(201);

	//reserve remaining two tickets for user two
	const { body: orderOne } = await request(app)
		.post("/api/orders")
		.set("Cookie", userTwo)
		.send({ ticketId: ticketTwo.id })
		.expect(201);

	const { body: orderTwo } = await request(app)
		.post("/api/orders")
		.set("Cookie", userTwo)
		.send({ ticketId: ticketThree.id })
		.expect(201);

	const response = await request(app).get("/api/orders").set("Cookie", userTwo).expect(200);

	// assert equality of length of order created
	expect(response.body.length).toEqual(2);

	//assert equality of orderId created and orderId fetched for a particular user
	expect(response.body[0].id).toEqual(orderOne.id);
	expect(response.body[1].id).toEqual(orderTwo.id);

	//assert equality of ticket id created and ticket id fetched for a particular user
	expect(response.body[0].ticket.id).toEqual(orderOne.ticket.id);
	expect(response.body[1].ticket.id).toEqual(orderTwo.ticket.id);
});
