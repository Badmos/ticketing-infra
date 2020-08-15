import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';
import { errorHandler, NotFoundError, currentUser } from '@coboard/common';

import { newTicketRouter } from './routes/new-ticket';
import { showTicketRouter } from './routes/show-ticket';
import { indexTicketRouter } from './routes/index';
import { updateTicketRouter } from './routes/update-ticket';

const app = express();

app.set('trust proxy', true);
app.use(json());
app.use(
  cookieSession({
    signed: false,
    name: 'jwt',
    secure: false //process.env.NODE_ENV !== 'test',
  })
);
app.use(currentUser);

app.use(newTicketRouter);
app.use(showTicketRouter);
app.use(indexTicketRouter);
app.use(updateTicketRouter);

app.all('*', async (req, res) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
