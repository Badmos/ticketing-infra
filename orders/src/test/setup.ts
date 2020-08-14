import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

declare global {
	namespace NodeJS {
		interface Global {
			signin(): string[];
		}
	}
}

let mongo: any;

jest.mock("../nats-wrapper");

beforeAll(async () => {
	process.env.JWT_KEY = "coolbyt";
	process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
	mongo = new MongoMemoryServer();
	const mongoUri = await mongo.getUri();

	await mongoose.connect(mongoUri, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});
});

beforeEach(async () => {
	jest.clearAllMocks();
	const collections = await mongoose.connection.db.collections();

	for (let collection of collections) {
		await collection.deleteMany({});
	}
});

afterAll(async () => {
	await mongo.stop();
	await mongoose.connection.close();
});

//mock signup flow to help return a supertest compatible cookie
global.signin = () => {
	let payload = {
		id: new mongoose.Types.ObjectId().toHexString(),
		email: "test@test.com",
	};

	const token = jwt.sign(payload, process.env.JWT_KEY!);

	const session = {
		jwt: token,
	};

	const sessionJson = JSON.stringify(session);

	const base64encodedJwt = Buffer.from(sessionJson).toString("base64");

	//should be jwt= and not express:sess ... using express:sess causes an unexpected bug.
	return [`jwt=${base64encodedJwt}`];
};
