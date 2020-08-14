import nats from 'node-nats-streaming';
import { TicketCreatedPublisher } from './events/ticket-created-publisher';

console.clear();

const stan = nats.connect('ticketing', 'abc', {
  url: 'http://localhost:4222',
});

stan.on('connect', async () => {
  console.log('Publisher connected to NATS streaming server');

  const publisher = new TicketCreatedPublisher(stan);
  try {
    await publisher.publish({
      id: 'ec0cdjns34is',
      title: '12 Strong',
      price: 50,
    });
  } catch (err) {
    console.error(err);
  }
});
