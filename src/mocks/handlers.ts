/* eslint-disable import/no-extraneous-dependencies */
import { rest } from 'msw';

import HOTELS_LIST_MOCK from './HOTELS_LIST_MOCK.json';
import HOTEL_MOCK from './HOTEL_MOCK.json';

export const handlers = [
  rest.get('https://obmng.dbm.guestline.net/api/hotels', (req, res, ctx) => res(
    ctx.delay(),
    ctx.status(200),
    ctx.json(HOTELS_LIST_MOCK),
  )),

  rest.get('https://obmng.dbm.guestline.net/api/roomRates/OBMNG/:hotelID', (req, res, ctx) => res(
    ctx.delay(),
    ctx.status(200),
    ctx.json(HOTEL_MOCK),
  )),
];
