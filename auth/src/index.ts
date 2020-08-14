import mongoose from "mongoose";

import { app } from "./app";

import { DatabaseConnectionError } from "@coboard/common";

const start = async () => {
	console.log("Starting server >>");
	//check if environment variable is defined in pod
	if (!process.env.JWT_KEY) {
		throw new Error("JWT key has not been set as an environment variable");
	}

	if (!process.env.MONGO_URI) {
		throw new Error("MONGO_URI has not been set as an environment variable");
	}

	try {
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
