import express, { Request, Response } from 'express';
import { NotFoundError } from '@coboard/common';
import { Ticket } from '../models/ticket';

const router = express.Router();

router.get('/api/tickets/:ticketId', async (req: Request, res: Response) => {
  const ticketId = req.params.ticketId;
  const ticket = await Ticket.findById(ticketId);

  if (!ticket) {
    throw new NotFoundError();
  }

  return res.status(200).json(ticket);
});

export { router as showTicketRouter };
