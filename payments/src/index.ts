import mongoose from "mongoose";

import { app } from "./app";

import { DatabaseConnectionError } from "@coboard/common";
import { natsWrapper } from "./nats-wrapper";
import { OrderCreatedListener } from "./events/listeners/order-created-listener";
import { OrderCancelledListener } from "./events/listeners/order-cancelled-listener";

const start = async () => {
	//check if environment variable is defined in pod
	if (!process.env.JWT_KEY) {
		throw new Error("JWT key has not been set as an environment variable");
	}

	if (!process.env.MONGO_URI) {
		throw new Error("MONGO_URI has not been set as an environment variable");
	}

	if (!process.env.NATS_CLUSTER_ID) {
		throw new Error("NATS_CLUSTER_ID has not been set as an environment variable");
	}

	if (!process.env.NATS_CLIENT_ID) {
		throw new Error("NATS_CLIENT_ID has not been set as an environment variable");
	}

	if (!process.env.NATS_URL) {
		throw new Error("NATS_URL has not been set as an environment variable");
	}
	try {
		await natsWrapper.connect(
			process.env.NATS_CLUSTER_ID,
			process.env.NATS_CLIENT_ID,
			process.env.NATS_URL
		);
		natsWrapper.client.on("close", () => {
			console.log("NATS connection closed");
			process.exit();
		});

		process.on("SIGINT", () => natsWrapper.client.close());
		process.on("SIGTERM", () => natsWrapper.client.close());

		new OrderCreatedListener(natsWrapper.client).listen();
		new OrderCancelledListener(natsWrapper.client).listen();

		await mongoose.connect(process.env.MONGO_URI, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
			useCreateIndex: true,
		});
		console.log("Connected to Mongodb");
	} catch (error) {
		console.error(error);
		throw new DatabaseConnectionError();
	}

	app.listen(3000, () => {
		console.log("Started!!! listening on 3000");
	});
};

start();
