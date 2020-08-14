import request from 'supertest';
import { app } from '../../app';

it('should return a 201 on successful signup', async () => {
  return request(app)
    .post('/api/users/signup')
    .send({
      email: 'yusuf@gmail.com',
      password: 'cool',
    })
    .expect(201);
});

it('should return a 400 with an invalid email', async () => {
  return request(app)
    .post('/api/users/signup')
    .send({
      email: 'yusufmail.com',
      password: 'cool',
    })
    .expect(400);
});

it('should return a 400 with an invalid password', async () => {
  return request(app)
    .post('/api/users/signup')
    .send({
      email: 'yusufmail.com',
      password: 'lhjnj',
    })
    .expect(400);
});

it('should return a 400 with Missing email and password', async () => {
  await request(app).post('/api/users/signup').send({ email: 'test@gmail.com' }).expect(400);
  await request(app).post('/api/users/signup').send({ password: 'kjnskjnkds' }).expect(400);
});

it('should disallow duplicate emails', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'ysdsdusuf@mail.com',
      password: 'cool',
    })
    .expect(201);
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'ysdsdusuf@mail.com',
      password: 'cool',
    })
    .expect(400);
});

it('sets a cookie after a successful signup', async () => {
  const response = await request(app)
    .post('/api/users/signup')
    .send({
      email: 'ysdsdusuf@mail.com',
      password: 'cool',
    })
    .expect(201);
  console.log(response);
  expect(response.get('Set-Cookie')).toBeDefined();
});
