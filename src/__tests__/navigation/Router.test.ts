import { Router } from '../../navigation/Router';

describe('Router', () => {
  it('should instantiate', () => {
    const router = new Router();
    expect(router).toBeDefined();
  });
});
