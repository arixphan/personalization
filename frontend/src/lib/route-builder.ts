import { z } from "zod";

export type RouteConfig<
  Params extends z.ZodRawShape = any,
  Search extends z.ZodRawShape = any
> = {
  path: string;
  params?: z.ZodObject<Params>;
  search?: z.ZodObject<Search>;
};

/**
 * Creates a type-safe route generator.
 *
 * @example
 * const PROJECT_DETAIL = createRoute({
 *   path: '/projects/:id',
 *   params: z.object({ id: z.string() }),
 *   search: z.object({ tab: z.enum(['backlog', 'board']).optional() })
 * });
 *
 * const url = PROJECT_DETAIL({ id: '123' }, { tab: 'backlog' }); // "/projects/123?tab=backlog"
 */
export const createRoute = <
  Params extends z.ZodRawShape = any,
  Search extends z.ZodRawShape = any
>(
  config: RouteConfig<Params, Search>
) => {
  return (
    params?: Params extends z.ZodRawShape ? z.infer<z.ZodObject<Params>> : any,
    search?: Search extends z.ZodRawShape ? z.infer<z.ZodObject<Search>> : any
  ) => {
    let url = config.path;

    // Replace dynamic segments (e.g., :id)
    if (params) {
      Object.entries(params as any).forEach(([key, value]) => {
        url = url.replace(`:${key}`, encodeURIComponent(String(value)));
      });
    }

    // Append query strings
    if (search && Object.keys(search).length > 0) {
      const query = new URLSearchParams();
      Object.entries(search as any).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query.append(key, String(value));
        }
      });
      const queryString = query.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    return url;
  };
};


