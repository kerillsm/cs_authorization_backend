import * as request from 'supertest';
import * as md5 from 'md5';
import { INestApplication } from '@nestjs/common';
import { createModuleFixture } from './utils';
import { Repository } from 'typeorm';
import { UserEntity } from 'src/entities/User.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

describe('StatController (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<UserEntity>;
  let jwtService: JwtService;
  let configService: ConfigService;

  beforeEach(async () => {
    await userRepository.clear();
  });

  beforeAll(async () => {
    app = await createModuleFixture();
    userRepository = app.get(getRepositoryToken(UserEntity));
    jwtService = app.get(JwtService);
    configService = app.get(ConfigService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('[POST] /login', () => {
    test.each([{}, { email: 'mail@mail.com' }, { password: '12345678' }])(
      'should return error if fields are missing',
      async (payload) => {
        const response = await request(app.getHttpServer())
          .post('/auth/login')
          .send(payload);

        expect(response.body.statusCode).toBe(400);
        expect(response.body.error).toBe('Bad Request');
        expect(response.body.message).toBe('Validation failed');
      },
    );

    test('should return error if user does not exist', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'not_existing@mail.com', password: '123456' });

      expect(response.body.statusCode).toBe(403);
      expect(response.body.message).toBe('User with such email not found');
    });

    test('should return error if password is incorrect', async () => {
      await userRepository.save({
        email: 'mail@mail.com',
        name: 'John Doe',
        password: md5('123456'),
      });
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'mail@mail.com', password: 'incorrect_password' });

      expect(response.body.statusCode).toBe(403);
      expect(response.body.error).toBe('Forbidden');
      expect(response.body.message).toBe('Incorrect password');
    });

    test('should return token if data is correct', async () => {
      const user = await userRepository.save({
        email: 'mail@mail.com',
        name: 'John Doe',
        password: md5('123456'),
      });
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'mail@mail.com', password: '123456' });

      const expectedJwt = await jwtService.signAsync(
        {
          id: user.id,
          email: user.email,
        },
        { secret: configService.get('jwt_secret') },
      );

      expect(response.body.access_token).toBe('Bearer ' + expectedJwt);
    });
  });

  describe('[POST] /register', () => {
    test.each([
      {},
      { email: 'mail@mail.com' },
      { password: '12345678' },
      { name: 'John Doe' },
      { email: 'mail@mail.com', password: '12345678' },
      { email: 'mail@mail.com', name: 'John Doe' },
      { password: '12345678', name: 'John Doe' },
    ])('should return error if fields are missing', async (payload) => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(payload);

      expect(response.body.statusCode).toBe(400);
      expect(response.body.error).toBe('Bad Request');
      expect(response.body.message).toBe('Validation failed');
    });

    test('should return error if email in incorrect format', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'incorrect-email',
          name: 'John Doe',
          password: '123456',
        });

      expect(response.body.statusCode).toBe(400);
      expect(response.body.error).toBe('Bad Request');
      expect(response.body.message).toBe('Incorrect email format');
    });

    test('should return error if password too short', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'mail@mail.com',
          name: 'John Doe',
          password: '123',
        });

      expect(response.body.statusCode).toBe(400);
      expect(response.body.error).toBe('Bad Request');
      expect(response.body.message).toBe(
        'Password must be no less than 6 symbols',
      );
    });

    test('should return error if user already exist', async () => {
      await userRepository.save({
        email: 'mail@mail.com',
        name: 'John Doe',
        password: md5('123456'),
      });

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'mail@mail.com',
          name: 'Doe John',
          password: '123456',
        });

      const users = await userRepository.find();

      expect(response.body.statusCode).toBe(403);
      expect(response.body.error).toBe('Forbidden');
      expect(response.body.message).toBe('User with such email already exists');
    });

    test('should return user without password if data is correct', async () => {
      const userBeforeRegistration = await userRepository.findOneBy({
        email: 'mail@mail.com',
      });
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'mail@mail.com',
          name: 'Doe John',
          password: '123456',
        });
      const userAfterRegistration = await userRepository.findOneBy({
        email: 'mail@mail.com',
      });

      expect(userBeforeRegistration).toBe(null);
      expect(response.body.email).toBe('mail@mail.com');
      expect(response.body.name).toBe('Doe John');
      expect(response.body.password).toBeUndefined();
      expect(userAfterRegistration.email).toBe('mail@mail.com');
      expect(userAfterRegistration.name).toBe('Doe John');
      expect(userAfterRegistration.password).toBe(md5('123456'));
    });
  });
});
