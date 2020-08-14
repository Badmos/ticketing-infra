import request from "supertest";
import mongoose, { version } from "mongoose";
import { app } from "../../app";
import { Order } from "../../models/order";
import { OrderStatus } from "@coboard/common";
import { stripe } from "../../stripe";
import { Payment } from "../../models/payment";

it("should return a 404 when purchasing an order that does not exist", async () => {
	await request(app)
		.post("/api/payments")
		.set("Cookie", global.signin())
		.send({
			token: "asdfgh",
			orderId: mongoose.Types.ObjectId().toHexString(),
		})
		.expect(404);
});

it("should return a 401 when purchasing an order that does not belong to the user", async () => {
	const order = Order.build({
		id: mongoose.Types.ObjectId().toHexString(),
		userId: mongoose.Types.ObjectId().toHexString(),
		version: 0,
		price: 20,
		status: OrderStatus.Created,
	});

	await order.save();

	await request(app)
		.post("/api/payments")
		.set("Cookie", global.signin())
		.send({
			token: "asdfgh",
			orderId: order.id,
		})
		.expect(401);
});

it("should return a 400 when purchasing a cancelled order", async () => {
	const userId = mongoose.Types.ObjectId().toHexString();

	const order = Order.build({
		id: mongoose.Types.ObjectId().toHexString(),
		userId,
		version: 0,
		price: 20,
		status: OrderStatus.Cancelled,
	});

	await order.save();

	await request(app)
		.post("/api/payments")
		.set("Cookie", global.signin(userId))
		.send({
			orderId: order.id,
			token: "asdfghj",
		})
		.expect(400);
});

it("should return a 200 with valid inputs", async () => {
	const userId = mongoose.Types.ObjectId().toHexString();
	const price = Math.floor(Math.random() * 100000);

	const order = Order.build({
		id: mongoose.Types.ObjectId().toHexString(),
		userId,
		version: 0,
		price,
		status: OrderStatus.Created,
	});

	await order.save();

	await request(app)
		.post("/api/payments")
		.set("Cookie", global.signin(userId))
		.send({
			token: "tok_visa",
			orderId: order.id,
		})
		.expect(201);

	const stripeCharges = await stripe.charges.list({ limit: 50 });
	const stripeCharge = stripeCharges.data.find((charge) => {
		return charge.amount === price * 100;
	});

	expect(stripeCharge).toBeDefined();
	expect(stripeCharge!.currency).toEqual("usd");

	const payment = await Payment.findOne({
		orderId: order.id,
		stripeId: stripeCharge!.id,
	});

	expect(payment).not.toBeNull();

	//this test case can also be mocked like below

	// const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0];

	// expect(chargeOptions.source).toEqual("tok_visa");
	// expect(chargeOptions.amount).toEqual(20 * 100);
	// expect(chargeOptions.currency).toEqual("usd");
});
