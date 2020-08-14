import { ExpirationCompleteListener } from "../expiration-complete-listener";
import { natsWrapper } from "../../../nats-wrapper";
import { Ticket } from "../../../models/ticket";
import mongoose from "mongoose";
import { Order } from "../../../models/orders";
import { OrderStatus, ExpirationCompleteEvent } from "@coboard/common";
import { Message } from "node-nats-streaming";

const setup = async () => {
	const listener = new ExpirationCompleteListener(natsWrapper.client);

	const ticket = Ticket.build({
		id: mongoose.Types.ObjectId().toHexString(),
		title: "GOT 06",
		price: 30,
	});

	await ticket.save();

	const order = Order.build({
		status: OrderStatus.Created,
		userId: "asdfghjk",
		expiresAt: new Date(),
		ticket,
	});

	await order.save();

	const data: ExpirationCompleteEvent["data"] = {
		orderId: order.id,
	};

	//@ts-ignore
	const msg: Message = {
		ack: jest.fn(),
	};

	return { listener, order, ticket, data, msg };
};

it("should update the order status to cancelled", async () => {
	const { listener, order, data, msg } = await setup();

	await listener.onMessage(data, msg);

	const updatedOrder = await Order.findById(order.id);

	expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it("shold emit an OrderCancelled event", async () => {
	const { listener, order, data, msg } = await setup();

	await listener.onMessage(data, msg);

	expect(natsWrapper.client.publish).toHaveBeenCalled();

	const eventData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]);

	expect(eventData.id).toEqual(order.id);
});

it("should ack the message", async () => {
	const { listener, data, msg } = await setup();

	await listener.onMessage(data, msg);

	expect(msg.ack).toHaveBeenCalled();
});
