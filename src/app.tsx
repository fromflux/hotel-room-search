/* eslint-disable no-use-before-define */
import React, {
  ChangeEvent, startTransition, useEffect, useMemo, useReducer,
} from 'react';
import ContentLoader from 'react-content-loader';

import './theme/reset.css';
import './theme/globals.css';

import styles from './app.module.css';

import HotelList from './components/hotel-list';
import StarsInput from './components/stars-rating/stars-input';
import RangeInput from './components/range-input/range-input';

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
  filterRating: 1 | 2 | 3 | 4 | 5
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
        filterRating: action.data as TState['filterRating'],
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

  const handleRatingChange = (evt: ChangeEvent<HTMLInputElement>) => {
    startTransition(() => {
      dispatch({
        type: 'setFilterRating',
        data: Number.parseInt(evt.target.value, 10),
      });
    });
  };

  const handleAdultsChange = (value: number) => {
    startTransition(() => {
      dispatch({
        type: 'setFilterAdults',
        data: value,
      });
    });
  };

  const handleChildrenChange = (value: number) => {
    startTransition(() => {
      dispatch({
        type: 'setFilterChildren',
        data: value,
      });
    });
  };

  const visibleData = useMemo(() => {
    // bail out if bad filters
    const validFilters = !(
      Number.isNaN(filterAdults) || Number.isNaN(filterChildren)
    );

    if (loading || error || !validFilters) {
      return [];
    }
    return (
      hotels
        .filter((hotel) => (Number.parseInt(hotel.starRating, 10) >= filterRating))
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

  return (
    <main className={styles.app}>
      <header className={styles.appHeader}>

        <div className={styles.filtersContainer}>
          <StarsInput value={filterRating} onChange={handleRatingChange} />

          <div className={styles.occupancyFilters}>
            <RangeInput
              label="Adults"
              value={filterAdults}
              min={1}
              max={10}
              onChange={handleAdultsChange}
            />
            <RangeInput
              label="Children"
              value={filterChildren}
              min={0}
              max={10}
              onChange={handleChildrenChange}
            />
          </div>
        </div>

      </header>

      <div className={styles.appContent}>
        {error && (
          <div className={styles.contentError}>
            <h3>Something went wrong :(</h3>
            <h4>
              Error:
              {' '}
              {error}
            </h4>
          </div>
        )}
        {loading && (
          <HotelsLoader />
        )}
        {!loading && visibleData.length > 0 && (<HotelList hotels={visibleData} />)}
        {!loading && visibleData.length === 0 && (
          <div className={styles.contentEmpty}>
            <h3>Could not find hotels matching the filters :(</h3>
            <h4>
              Please try again with different options
            </h4>
          </div>
        )}
      </div>
    </main>
  );
}

function HotelsLoader() {
  return (
    <div className={styles.contentLoader}>
      {new Array(3).fill(null).map((_, i) => (
        <ContentLoader
          // eslint-disable-next-line react/no-array-index-key
          key={i}
          speed={2}
          viewBox="0 0 400 190"
          backgroundColor="#f3f3f3"
          foregroundColor="#ecebeb"
        >
          <rect x="0" y="0" rx="0" ry="0" width="150" height="100" />
          <rect x="170" y="10" rx="3" ry="3" width="150" height="10" />
          <rect x="170" y="34" rx="3" ry="3" width="82" height="8" />
          <rect x="170" y="57" rx="3" ry="3" width="82" height="8" />
          <rect x="0" y="110" rx="3" ry="3" width="410" height="6" />
          <rect x="0" y="130" rx="3" ry="3" width="380" height="6" />
          <rect x="0" y="150" rx="3" ry="3" width="178" height="6" />
        </ContentLoader>
      ))}
    </div>
  );
}
