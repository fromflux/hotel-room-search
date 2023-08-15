/* eslint-disable import/no-extraneous-dependencies */
import { rest } from 'msw';

export const handlers = [
  rest.get('/api/', (req, res, ctx) => res(
    ctx.delay(),
    ctx.status(200),
    ctx.json({ data: 'foo' }),
  )),
];
