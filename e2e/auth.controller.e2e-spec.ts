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
      async (paylaod) => {
        const response = await request(app.getHttpServer())
          .post('/auth/login')
          .send(paylaod);

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
    ])('should return error if fields are missing', () => {});

    test('should return error if email in incorrect format', () => {});

    test('should return error if password too short', () => {});

    test('should return error if user already exist', () => {});

    test('should return user without password if data is correct', () => {});
  });
});
