import * as request from 'supertest';
import * as md5 from 'md5';
import { INestApplication } from '@nestjs/common';
import { createModuleFixture } from './utils';
import { Repository } from 'typeorm';
import { UserEntity } from 'src/entities/User.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuthService } from 'src/modules/auth/auth.service';

describe('UserController (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<UserEntity>;
  let authService: AuthService;
  let token = '';

  beforeEach(async () => {
    // receiving token
    await userRepository.save({
      email: 'mail@mail.com',
      name: 'John Doe',
      password: md5('123456'),
    });
    token = (await authService.login('mail@mail.com', '123456')).access_token;
  });

  afterEach(async () => {
    await userRepository.clear();
  });

  beforeAll(async () => {
    app = await createModuleFixture();
    userRepository = app.get(getRepositoryToken(UserEntity));
    authService = app.get(AuthService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('[GET] /user', () => {
    test('should return error if user unathorized', async () => {
      const response = await request(app.getHttpServer()).get('/user/');

      expect(response.body.statusCode).toBe(401);
      expect(response.body.message).toBe('Unauthorized');
    });

    test('should return empty array if no users', async () => {
      await userRepository.clear();
      const response = await request(app.getHttpServer())
        .get('/user/')
        .set('Authorization', token);

      expect(response.body.length).toBe(0);
    });

    test('should return list of users', async () => {
      await userRepository.save({
        email: 'mail2@mail.com',
        name: 'Doe John',
        password: md5('123456'),
      });
      const response = await request(app.getHttpServer())
        .get('/user/')
        .set('Authorization', token);

      expect(response.body.length).toBe(2);
      expect(response.body[0].email).toBe('mail@mail.com');
      expect(response.body[0].name).toBe('John Doe');
      expect(response.body[1].email).toBe('mail2@mail.com');
      expect(response.body[1].name).toBe('Doe John');
    });
  });

  describe('[POST] /user', () => {
    test('should return error if user unathorized', async () => {
      const response = await request(app.getHttpServer()).post('/user/');
      expect(response.body.statusCode).toBe(401);
      expect(response.body.message).toBe('Unauthorized');
    });

    test.each([
      {},
      { email: 'mail@mail.com' },
      { password: '12345678' },
      { name: 'John Doe' },
      { email: 'mail@mail.com', password: '12345678' },
      { email: 'mail@mail.com', name: 'John Doe' },
      { password: '12345678', name: 'John Doe' },
    ])('should return validation error', async (payload) => {
      const response = await request(app.getHttpServer())
        .post('/user/')
        .send(payload)
        .set('Authorization', token);

      expect(response.body.statusCode).toBe(400);
      expect(response.body.error).toBe('Bad Request');
      expect(response.body.message).toBe('Validation failed');
    });

    test('should create user', async () => {
      const response = await request(app.getHttpServer())
        .post('/user/')
        .send({
          email: 'test@example.com',
          name: 'John Doe',
          password: md5('123456'),
        })
        .set('Authorization', token);

      expect(response.body.email).toBe('test@example.com');
      expect(response.body.name).toBe('John Doe');
      expect(response.body.password).toBe(md5('123456'));
    });
  });

  describe('[PATCH] /user', () => {
    test('should return error if user unathorized', async () => {
      const response = await request(app.getHttpServer()).patch('/user/0');
      expect(response.body.statusCode).toBe(401);
      expect(response.body.message).toBe('Unauthorized');
    });

    test('should return validation error', async () => {
      const response = await request(app.getHttpServer())
        .patch('/user/0')
        .set('Authorization', token);

      expect(response.body.statusCode).toBe(400);
      expect(response.body.error).toBe('Bad Request');
      expect(response.body.message).toBe('Validation failed');
    });

    test('should update user', async () => {
      const userBeforeUpdate = await userRepository.save({
        email: 'mail2@mail.com',
        name: 'Doe John',
        password: md5('123456'),
      });
      const response = await request(app.getHttpServer())
        .patch('/user/' + userBeforeUpdate.id)
        .set('Authorization', token)
        .send({ name: 'John Doe' });
      const userAfterUpdate = await userRepository.findOneBy({
        id: userBeforeUpdate.id,
      });

      expect(userBeforeUpdate.name).toBe('Doe John');
      expect(userBeforeUpdate.email).toBe('mail2@mail.com');
      expect(response.body.updated).toBe(true);
      expect(userAfterUpdate.name).toBe('John Doe');
      expect(userAfterUpdate.email).toBe('mail2@mail.com');
    });
  });

  describe('[DELETE] /user', () => {
    test('should return error if user unathorized', async () => {
      const response = await request(app.getHttpServer()).delete('/user/0');
      expect(response.body.statusCode).toBe(401);
      expect(response.body.message).toBe('Unauthorized');
    });

    test('should remove user', async () => {
      const userBeforeDelete = await userRepository.save({
        email: 'mail2@mail.com',
        name: 'Doe John',
        password: md5('123456'),
      });

      const response = await request(app.getHttpServer())
        .delete('/user/' + userBeforeDelete.id)
        .set('Authorization', token);
      const userAfterDelete = await userRepository.findOneBy({
        id: userBeforeDelete.id,
      });

      expect(userBeforeDelete.name).toBe('Doe John');
      expect(userBeforeDelete.email).toBe('mail2@mail.com');
      expect(response.body.deleted).toBe(true);
      expect(userAfterDelete).toBe(null);
    });
  });
});
