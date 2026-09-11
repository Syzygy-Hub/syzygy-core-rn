/**
 * Stack-based navigation router with guards and deep link parsing.
 */

/** A navigation route with path and parameters. */
export interface Route {
  /** The route path (e.g. "/home/profile"). */
  readonly path: string;
  /** Key-value parameters extracted from the route. */
  readonly parameters: Record<string, string>;
}

/** Guard that can block navigation to a route. */
export interface RouteGuard {
  /** Return true to allow navigation, false to block it. */
  canNavigate(to: Route): boolean;
}

/**
 * Stack-based router with guard support.
 *
 * @example
 * ```typescript
 * const router = new Router();
 * router.push({ path: '/home', parameters: {} });
 * router.push({ path: '/profile', parameters: { id: '42' } });
 * router.pop(); // returns the profile route
 * ```
 */
export class Router {
  private stack: Route[] = [];
  private guards: RouteGuard[] = [];

  /** The currently active route, or undefined if the stack is empty. */
  get currentRoute(): Route | undefined {
    return this.stack.length > 0 ? this.stack[this.stack.length - 1] : undefined;
  }

  /** The number of routes on the navigation stack. */
  get stackDepth(): number {
    return this.stack.length;
  }

  /**
   * Push a route onto the stack.
   * @param route - The route to navigate to.
   * @returns true if navigation was allowed, false if a guard blocked it.
   */
  push(route: Route): boolean {
    if (!this.canNavigate(route)) {
      return false;
    }
    this.stack.push(route);
    return true;
  }

  /**
   * Pop the top route off the stack.
   * @returns The popped route, or undefined if the stack was empty.
   */
  pop(): Route | undefined {
    return this.stack.pop();
  }

  /**
   * Pop all routes except the root, leaving only the first route on the stack.
   * Aborts if a guard returns false for the root route.
   * @returns true if popToRoot was allowed, false if a guard blocked it.
   */
  popToRoot(): boolean {
    const root = this.stack[0];
    if (root === undefined) {
      return true;
    }
    if (!this.canNavigate(root)) {
      return false;
    }
    if (this.stack.length > 1) {
      this.stack.splice(1);
    }
    return true;
  }

  /**
   * Replace the current top of the stack with a new route.
   * @param route - The replacement route.
   * @returns true if navigation was allowed, false if a guard blocked it.
   */
  replace(route: Route): boolean {
    if (!this.canNavigate(route)) {
      return false;
    }
    if (this.stack.length > 0) {
      this.stack[this.stack.length - 1] = route;
    } else {
      this.stack.push(route);
    }
    return true;
  }

  /**
   * Add a navigation guard.
   * @param guard - The guard to add.
   */
  addGuard(guard: RouteGuard): void {
    this.guards.push(guard);
  }

  private canNavigate(route: Route): boolean {
    return this.guards.every((g) => g.canNavigate(route));
  }
}

interface DeepLinkEntry {
  segments: string[];
  routeFactory: (params: Record<string, string>) => Route;
}

/**
 * Deep link URL parser that matches patterns and extracts parameters.
 *
 * @example
 * ```typescript
 * const parser = new DeepLinkParser();
 * parser.register('/user/:id', (params) => ({ path: '/user', parameters: params }));
 * const route = parser.parse('myapp://user/42'); // { path: '/user', parameters: { id: '42' } }
 * ```
 */
export class DeepLinkParser {
  private entries: DeepLinkEntry[] = [];

  /**
   * Register a URL pattern with parameter placeholders (e.g. "/user/:id").
   * @param pattern - The URL pattern. Segments starting with ":" are parameters.
   * @param routeFactory - Factory that creates a Route from extracted parameters.
   */
  register(pattern: string, routeFactory: (params: Record<string, string>) => Route): void {
    const segments = pattern.split('/').filter((s) => s.length > 0);
    this.entries.push({ segments, routeFactory });
  }

  /**
   * Parse a URL and return a matching route, or undefined if no pattern matches.
   * @param url - The URL to parse (e.g. "myapp://user/42" or "/user/42").
   */
  parse(url: string): Route | undefined {
    let path = url;
    const schemeIndex = url.indexOf('://');
    if (schemeIndex >= 0) {
      path = url.substring(schemeIndex + 3);
    }

    // Strip fragment (#...) first, then query string (?...)
    const fragmentIndex = path.indexOf('#');
    if (fragmentIndex >= 0) {
      path = path.substring(0, fragmentIndex);
    }
    const queryIndex = path.indexOf('?');
    if (queryIndex >= 0) {
      path = path.substring(0, queryIndex);
    }

    const urlSegments = path.split('/').filter((s) => s.length > 0);

    for (const entry of this.entries) {
      if (entry.segments.length !== urlSegments.length) {
        continue;
      }
      const params: Record<string, string> = {};
      let matched = true;
      for (let i = 0; i < entry.segments.length; i++) {
        if (entry.segments[i].startsWith(':')) {
          params[entry.segments[i].substring(1)] = urlSegments[i];
        } else if (entry.segments[i] !== urlSegments[i]) {
          matched = false;
          break;
        }
      }
      if (matched) {
        return entry.routeFactory(params);
      }
    }
    return undefined;
  }
}
