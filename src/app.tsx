import React, { useEffect, useMemo, useReducer } from 'react';

import './theme/reset.css';
import './theme/globals.css';

import styles from './app.module.css';

import HotelList from './components/hotel-list';

const HOTELS_API = 'https://obmng.dbm.guestline.net/api/hotels?collection-id=OBMNG';
const ROOMS_API = 'https://obmng.dbm.guestline.net/api/roomRates/OBMNG/';

type THotelDTM = {
  id: string
  name: string
  address1: string
  address2: string
  postcode: string
  starRating: '1' | '2' | '3' | '4' | '5'
  images: {
    url: string
  }[]
}

type TRoomDTM = {
  id: string
  name: string
  longDescription: string
  occupancy: {
    maxAdults: number
    maxChildren: number
    maxOverall: number
  }
}

type TState = {
  loading: boolean
  error: string | null
  hotels: THotelDTM[]
  hotelRooms: Record<string, TRoomDTM[]>
  filterRating: number
  filterAdults: number
  filterChildren: number
}

const initialState: TState = {
  loading: true,
  error: null,
  hotels: [],
  hotelRooms: {},
  filterRating: 3,
  filterAdults: 2,
  filterChildren: 0,
};

type TAction = {
  type: 'setHotelsData',
  data: TState['hotels']
} | {
  type: 'setHotelRoomsData'
  data: TState['hotelRooms']
} | {
  type: 'setError'
  data: string
} | {
  type: 'loadingDone'
} | {
  type: 'setFilterRating' | 'setFilterAdults' | 'setFilterChildren'
  data: number
};

function reducer(state: TState, action: TAction): TState {
  switch (action.type) {
    case 'loadingDone':
      return {
        ...state,
        loading: false,
      };
    case 'setError':
      return {
        ...state,
        error: action.data,
      };
    case 'setHotelsData':
      return {
        ...state,
        hotels: action.data,
      };
    case 'setHotelRoomsData':
      return {
        ...state,
        hotelRooms: action.data,
      };
    case 'setFilterRating':
      return {
        ...state,
        filterRating: action.data,
      };
    case 'setFilterAdults':
      return {
        ...state,
        filterAdults: action.data,
      };
    case 'setFilterChildren':
      return {
        ...state,
        filterChildren: action.data,
      };
    default:
      return state;
  }
}

function useApiData(dispatch: React.Dispatch<TAction>) {
  useEffect(() => {
    let ready = true;

    async function fetchData() {
      try {
        // fetch hotels list
        const hotelsRes = await fetch(HOTELS_API);

        if (!hotelsRes.ok) {
          throw new Error('Failed to load hotels data');
        }

        const hotelsData = await hotelsRes.json() as THotelDTM[];

        if (ready) {
          dispatch({
            type: 'setHotelsData',
            data: hotelsData,
          });
        }

        const roomsData: Record<string, TRoomDTM[]> = {};

        const roomsRequests = hotelsData.map((hotel) => {
          roomsData[hotel.id] = [];
          // fetch rooms for each hotel in list
          async function fetchHotelRooms() {
            const url = ROOMS_API + hotel.id;
            try {
              const res = await fetch(url);

              if (!res.ok) {
                throw new Error(`Failed to load rooms data for hotel: ${hotel.id} at ${url}`);
              }

              const data = await res.json();

              roomsData[hotel.id] = data.rooms as TRoomDTM[];
            } catch (ex) {
              // allow for rooms request to fail but log error
              // eslint-disable-next-line no-console
              console.error(ex, { url });
            }
          }

          return fetchHotelRooms();
        });

        await Promise.allSettled(roomsRequests);

        if (ready) {
          dispatch({
            type: 'setHotelRoomsData',
            data: roomsData,
          });
        }
      } catch (ex) {
        if (ready && ex instanceof Error) {
          dispatch({
            type: 'setError',
            data: ex.message,
          });
        }
      } finally {
        dispatch({
          type: 'loadingDone',
        });
      }
    }

    fetchData();

    return () => { ready = false; };
  }, []);
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState);

  // fetch all data once
  useApiData(dispatch);

  const {
    loading, error, hotels, hotelRooms, filterRating, filterAdults, filterChildren,
  } = state;

  const visibleData = useMemo(() => {
    if (loading || error) {
      return [];
    }
    return (
      hotels
        .filter((hotel) => Number.parseInt(hotel.starRating, 10) >= filterRating)
        .map((hotel) => ({
          ...hotel,
          rooms: hotelRooms[hotel.id]
            .filter(
              (room) => room.occupancy.maxAdults >= filterAdults
                && room.occupancy.maxChildren >= filterChildren
                && (!room.occupancy.maxOverall
                  || room.occupancy.maxOverall >= filterAdults + filterChildren),
            ),
        }))
        .filter((hotel) => hotel.rooms.length > 0)
    );
  }, [loading, error, hotels, hotelRooms, filterRating, filterAdults, filterChildren]);

  if (loading) {
    return <h1>Loading...</h1>;
  }

  if (error) {
    return <h1>{error}</h1>;
  }

  return (
    <main className={styles.app}>
      <header>
        <input
          type="number"
          name="rating"
          id="rating"
          max={5}
          min={1}
          value={filterRating}
          onChange={
            (evt) => {
              dispatch({ type: 'setFilterRating', data: Number.parseInt(evt.target.value, 10) });
            }
          }
        />
        <input
          type="number"
          name="adults"
          id="adults"
          max={10}
          min={1}
          value={filterAdults}
          onChange={
            (evt) => {
              dispatch({ type: 'setFilterAdults', data: Number.parseInt(evt.target.value, 10) });
            }
          }
        />
        <input
          type="number"
          name="children"
          id="children"
          max={10}
          min={0}
          value={filterChildren}
          onChange={
            (evt) => {
              dispatch({ type: 'setFilterChildren', data: Number.parseInt(evt.target.value, 10) });
            }
          }
        />
      </header>
      <div className={styles.appContent}>
        <HotelList hotels={visibleData} />
      </div>
    </main>
  );
}
