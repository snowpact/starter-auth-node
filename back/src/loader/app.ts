import express, { Router, Express } from 'express';
import {
  attachLoggerMiddleware,
  jsonParserMiddleware,
  urlEncodedParserMiddleware,
  corsMiddleware,
  appErrorHandlerMiddleware,
} from '../core/middlewares';

export interface IAppOptions {
  prefix: string;
  router: Router;
}

export default ({ prefix, router }: IAppOptions): Express =>
  express()
    .use(attachLoggerMiddleware())
    .use(jsonParserMiddleware)
    .use(urlEncodedParserMiddleware)
    .use(corsMiddleware)
    .use(prefix, router)
    .use(appErrorHandlerMiddleware)
    .disable('x-powered-by');
