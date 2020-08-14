import request from 'supertest';
import { app } from '../../app';

const createTicket = (title: string, price: number) => {
  return request(app).post('/api/tickets').set('Cookie', global.signin()).send({
    title,
    price,
  });
};

it('should fetch a list of tickets', async () => {
  await createTicket('GOT season 1', 70);
  await createTicket('Hunter Killer', 80);
  await createTicket('Miss Sloane', 30);
  await createTicket('Money Heist', 10);

  const response = await request(app).get('/api/tickets').send().expect(200);
  expect(response.body.length).toEqual(4); // should equal number of tickets created
});
