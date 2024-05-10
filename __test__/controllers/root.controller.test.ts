import request from 'supertest'
import routing from "../../src/constants/routes";
import { app } from "../../src/services/services.Socket";
routing(app);

describe('Test Express App', () => {

  // Test GET route
  test('GET / should return status 200', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
  });

});
