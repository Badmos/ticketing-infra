import request from "supertest";
import { app } from "../../app";
import { Ticket } from "../../models/ticket";
import { natsWrapper } from "../../nats-wrapper";

it("should have a route handler listening to /api/tickets for post requests", async () => {
	const response = await request(app).post("/api/tickets").send({});

	expect(response.status).not.toEqual(404);
});

it("should only be accessible if user is signed in", async () => {
	await request(app).post("/api/tickets/").send({}).expect(401);
});

it("should return a status other than 401 when the user is signed in", async () => {
	const fakedCookie = global.signin();
	const response = await request(app).post("/api/tickets").set("Cookie", fakedCookie).send({});

	expect(response.status).not.toEqual(401);
});

it("should return an error if an invalid title is provided", async () => {
	await request(app)
		.post("/api/tickets")
		.set("Cookie", global.signin())
		.send({
			title: "",
			price: 10,
		})
		.expect(400);

	await request(app)
		.post("/api/tickets")
		.set("Cookie", global.signin())
		.send({
			title: "",
			price: 10,
		})
		.expect(400);
});

it("should return an error if an invalid price is provided", async () => {
	await request(app)
		.post("/api/tickets")
		.set("Cookie", global.signin())
		.send({
			title: "Cool titles",
			price: -10,
		})
		.expect(400);

	await request(app)
		.post("/api/tickets")
		.set("Cookie", global.signin())
		.send({
			title: "Cool titles",
		})
		.expect(400);
});

it("should create a ticket with valid inputs", async () => {
	let tickets = await Ticket.find({});
	let title = "Game of thrones Premiere";

	expect(tickets.length).toEqual(0);
	await request(app)
		.post("/api/tickets")
		.set("Cookie", global.signin())
		.send({
			title,
			price: 20,
		})
		.expect(201);

	tickets = await Ticket.find({});
	expect(tickets.length).toEqual(1);
	expect(tickets[0].price).toEqual(20);
	expect(tickets[0].title).toEqual(title);
});

it("publishes an event", async () => {
	await request(app)
		.post("/api/tickets")
		.set("Cookie", global.signin())
		.send({
			title: "Game of thrones",
			price: 20,
		})
		.expect(201);

	expect(natsWrapper.client.publish).toHaveBeenCalled();
});
