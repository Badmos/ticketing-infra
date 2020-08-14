import mongoose from "mongoose";
import { natsWrapper } from "../../../nats-wrapper";
import { OrderStatus, OrderCancelledEvent } from "@coboard/common";
import { Order } from "../../../models/order";
import { OrderCancelledListener } from "../order-cancelled-listener";

const setup = async () => {
	const listener = new OrderCancelledListener(natsWrapper.client);

	const order = Order.build({
		id: mongoose.Types.ObjectId().toHexString(),
		status: OrderStatus.Created,
		price: 10,
		userId: "asdfgh",
		version: 0,
	});

	await order.save();

	const data: OrderCancelledEvent["data"] = {
		id: order.id,
		version: 1,
		ticket: {
			id: "asddfgf",
		},
	};

	//@ts-ignore
	const msg: Message = {
		ack: jest.fn(),
	};

	return { listener, data, msg, order };
};

it("should update the status of the order", async () => {
	const { listener, data, msg, order } = await setup();

	await listener.onMessage(data, msg);

	const updatedOrder = await Order.findById(order.id);

	if (!order) {
		throw new Error("Order not found");
	}

	expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it("should update the status of the order", async () => {
	const { listener, data, msg, order } = await setup();

	await listener.onMessage(data, msg);

	expect(msg.ack).toHaveBeenCalled();
});
