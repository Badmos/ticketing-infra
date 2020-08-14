import request from "supertest";
import { app } from "../../app";
import mongoose from "mongoose";
import { response } from "express";
import { natsWrapper } from "../../nats-wrapper";
import { Ticket } from "../../models/ticket";

// it('should return a 404 if the provided id does not exist', async () => {
//   const id = new mongoose.Types.ObjectId().toHexString();
//   await request(app)
//     .put(`/api/tickets/${id}`)
//     .set('Cookie', global.signin())
//     .send({
//       title: 'cool new movie',
//       price: 20,
//     })
//     .expect(404);
// });

// it('should return a 401 if the user is not authenticated', async () => {
//   const id = new mongoose.Types.ObjectId().toHexString();
//   await request(app)
//     .put(`/api/tickets/${id}`)
//     .send({
//       title: 'cool new movie',
//       price: 20,
//     })
//     .expect(401);
// });

// it('should return a 401 if the user does not own the ticket', async () => {
//   const response = await request(app).post('/api/tickets').set('Cookie', global.signin()).send({
//     title: 'New Ticket',
//     price: 10,
//   });
//   await request(app)
//     .put(`/api/tickets/${response.body.id}`)
//     .set('Cookie', global.signin())
//     .send({
//       title: 'Update ticket title',
//       price: 600,
//     })
//     .expect(401);
// });

it("should return a 400 if the user provides and invalid title or price", async () => {
	const fakedCookie = global.signin();
	const response = await request(app)
		.post("/api/tickets")
		.set("Cookie", fakedCookie)
		.send({
			title: "New Ticket",
			price: 10,
		})
		.expect(201);

	await request(app)
		.put(`/api/tickets/${response.body.id}`)
		.set("Cookie", fakedCookie)
		.send({
			title: "",
			price: 600,
		})
		.expect(400);

	await request(app)
		.put(`/api/tickets/${response.body.id}`)
		.set("Cookie", fakedCookie)
		.send({
			title: "Updated ticket",
			price: -600,
		})
		.expect(400);
});

it("should update the ticket provided a valid input", async () => {
	const fakedCookie = global.signin();
	const response = await request(app)
		.post("/api/tickets")
		.set("Cookie", fakedCookie)
		.send({
			title: "New Ticket",
			price: 10,
		})
		.expect(201);

	await request(app)
		.put(`/api/tickets/${response.body.id}`)
		.set("Cookie", fakedCookie)
		.send({
			title: "Updated ticket",
			price: 600,
		})
		.expect(200);

	const ticketReponse = await request(app).get(`/api/tickets/${response.body.id}`).send({});

	expect(ticketReponse.body.title).toEqual("Updated ticket");
	expect(ticketReponse.body.price).toEqual(600);
});

it("should publish an event", async () => {
	const fakedCookie = global.signin();
	const response = await request(app)
		.post("/api/tickets")
		.set("Cookie", fakedCookie)
		.send({
			title: "New Ticket",
			price: 10,
		})
		.expect(201);

	await request(app)
		.put(`/api/tickets/${response.body.id}`)
		.set("Cookie", fakedCookie)
		.send({
			title: "Updated ticket",
			price: 600,
		})
		.expect(200);

	expect(natsWrapper.client.publish).toHaveBeenCalled();
});

it("should reject an update if the ticket is reserved", async () => {
	const fakedCookie = global.signin();
	const response = await request(app)
		.post("/api/tickets")
		.set("Cookie", fakedCookie)
		.send({
			title: "New Ticket",
			price: 10,
		})
		.expect(201);

	const ticket = await Ticket.findById(response.body.id);
	if (ticket) {
		ticket.set({ orderId: mongoose.Types.ObjectId().toHexString() });
		await ticket.save();
	}

	await request(app)
		.put(`/api/tickets/${response.body.id}`)
		.set("Cookie", fakedCookie)
		.send({
			title: "Updated ticket",
			price: 600,
		})
		.expect(400);
});
