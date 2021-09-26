import { Router, Express } from 'express';

export interface IBuildAppFunctionArgs {
  prefix: string;
  router: Router;
}

export type BuildAppFunction = (args: IBuildAppFunctionArgs) => Express;

/**
 * Factory of Express application for test purposes.
 * @param buildAppFunction function that builds Express app
 */
export const buildTestAppHelper =
  (buildAppFunction: BuildAppFunction, servicePrefix: string) =>
  (...routers: Router[]): Express =>
    buildAppFunction({
      prefix: servicePrefix,
      router: routers.reduce((acc: Router, cur: Router) => acc.use(cur), Router()),
    });
