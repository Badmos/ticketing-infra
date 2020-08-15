import express from "express";
import "express-async-errors";
import { json } from "body-parser";
import cookieSession from "cookie-session";
import { errorHandler, NotFoundError, currentUser } from "@coboard/common";

import { indexOrderRouter } from "./routes/index";
import { newOrderRouter } from "./routes/new-order";
import { showOrderRouter } from "./routes/show-order";
import { deleteOrderRouter } from "./routes/delete-order";

const app = express();

app.set("trust proxy", true);
app.use(json());
app.use(
	cookieSession({
		signed: false,
		name: "jwt",
		secure: false //process.env.NODE_ENV !== "test",
	})
);
app.use(currentUser);

app.use(indexOrderRouter);
app.use(newOrderRouter);
app.use(showOrderRouter);
app.use(deleteOrderRouter);

app.all("*", async (req, res) => {
	throw new NotFoundError();
});

app.use(errorHandler);

export { app };
