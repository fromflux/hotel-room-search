/* eslint-disable import/no-extraneous-dependencies */
import {
  render, screen,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { rest } from 'msw';

import { server } from './mocks/server';

import App from './app';

describe('Hotels App', () => {
  it('should show loading message before request resolves', async () => {
    render(
      <App />,
    );

    expect((await screen.findAllByLabelText('Loading...')).length).toBeGreaterThan(0);
  });

  it('should show hotels list after request resolves', async () => {
    render(
      <App />,
    );

    expect(await screen.findByText('Very Fancy Hotel')).toBeInTheDocument();
  });

  it('should filter hotels by rating based on the star rating input value', async () => {
    render(
      <App />,
    );

    const hotelEl = await screen.findByText('3 Star Hotel');

    expect(hotelEl).toBeInTheDocument();

    const fiveStarsEl = await screen.findByLabelText('5 stars');
    await userEvent.click(fiveStarsEl);

    expect(hotelEl).not.toBeInTheDocument();
  });

  it('should filter hotel rooms by adult count based on the adults input value', async () => {
    render(
      <App />,
    );

    const roomEls = await screen.findAllByText('Room for 2 Adults');

    expect(roomEls[0]).toBeInTheDocument();

    const adultsInput = await screen.findByLabelText('Adults input');
    await userEvent.type(adultsInput, '3');

    // await waitForElementToBeRemoved(() => screen.getAllByText('Room for 2 Adults'));
    expect(roomEls[0]).not.toBeInTheDocument();
  });

  it('should filter hotel rooms by children count based on the children input value', async () => {
    render(
      <App />,
    );

    const roomEls = await screen.findAllByText('Room for 2 Adults');

    expect(roomEls[0]).toBeInTheDocument();

    const childrenInput = await screen.findByLabelText('Children input');
    await userEvent.type(childrenInput, '1');

    expect(roomEls[0]).not.toBeInTheDocument();
  });

  it('should filter hotel rooms by max occupancy based on the adults and children input values', async () => {
    render(
      <App />,
    );

    const roomEls = await screen.findAllByText('Room for 3 maximum people');

    expect(roomEls[0]).toBeInTheDocument();

    const adultsInput = await screen.findByLabelText('Adults input');
    await userEvent.type(adultsInput, '2');
    const childrenInput = await screen.findByLabelText('Children input');
    await userEvent.type(childrenInput, '2');

    expect(roomEls[0]).not.toBeInTheDocument();
  });

  it('should show not found message when no results found', async () => {
    render(
      <App />,
    );

    const hotelEl = await screen.findByText('3 Star Hotel');

    expect(hotelEl).toBeInTheDocument();

    const adultsInput = await screen.findByLabelText('Adults input');
    await userEvent.type(adultsInput, '10');

    expect(hotelEl).not.toBeInTheDocument();

    expect(await screen.findByText('Could not find hotels matching the filters :(')).toBeInTheDocument();
  });

  it('should show error message when request fails', async () => {
    // mock failed response
    server.use(
      rest.get('https://obmng.dbm.guestline.net/api/hotels', (req, res, ctx) => res(
        ctx.status(404),
        ctx.json({
          errorMessage: 'Not Found Custom Error Message',
        }),
      )),
    );

    render(
      <App />,
    );

    const loadingEls = await screen.findAllByLabelText('Loading...');

    expect(loadingEls[0]).toBeInTheDocument();

    expect(await screen.findByText('Something went wrong :(')).toBeInTheDocument();
  });
});
