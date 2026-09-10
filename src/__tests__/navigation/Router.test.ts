import { Router, DeepLinkParser } from '../../navigation/Router';

describe('Router', () => {
  it('should push and pop routes', () => {
    const router = new Router();
    router.push({ path: '/home', parameters: {} });
    router.push({ path: '/profile', parameters: { id: '1' } });
    expect(router.stackDepth).toBe(2);
    expect(router.currentRoute?.path).toBe('/profile');
    const popped = router.pop();
    expect(popped?.path).toBe('/profile');
    expect(router.currentRoute?.path).toBe('/home');
  });

  it('should replace the current route', () => {
    const router = new Router();
    router.push({ path: '/a', parameters: {} });
    router.replace({ path: '/b', parameters: {} });
    expect(router.stackDepth).toBe(1);
    expect(router.currentRoute?.path).toBe('/b');
  });

  it('should block navigation via guards', () => {
    const router = new Router();
    router.addGuard({ canNavigate: (to) => to.path !== '/admin' });
    expect(router.push({ path: '/admin', parameters: {} })).toBe(false);
    expect(router.push({ path: '/home', parameters: {} })).toBe(true);
    expect(router.stackDepth).toBe(1);
  });

  it('should popToRoot', () => {
    const router = new Router();
    router.push({ path: '/a', parameters: {} });
    router.push({ path: '/b', parameters: {} });
    router.push({ path: '/c', parameters: {} });
    router.popToRoot();
    expect(router.stackDepth).toBe(1);
    expect(router.currentRoute?.path).toBe('/a');
  });
});

describe('DeepLinkParser', () => {
  it('should parse URLs with parameters', () => {
    const parser = new DeepLinkParser();
    parser.register('/user/:id/post/:postId', (params) => ({
      path: '/user/post',
      parameters: params,
    }));
    const route = parser.parse('myapp://user/42/post/99');
    expect(route).toBeDefined();
    expect(route!.parameters).toEqual({ id: '42', postId: '99' });
  });

  it('should return undefined for non-matching URLs', () => {
    const parser = new DeepLinkParser();
    parser.register('/user/:id', (params) => ({ path: '/user', parameters: params }));
    expect(parser.parse('myapp://settings')).toBeUndefined();
  });
});
