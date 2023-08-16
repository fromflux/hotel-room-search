import React from 'react';
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';

import styles from './hotel-list.module.css';

import StarsRating from '../stars-rating/stars-rating';

type TProps = {
  hotels: {
    id: string
    name: string
    address1: string
    address2: string
    postcode: string
    starRating: '1' | '2' | '3' | '4' | '5'
    images: {
      url: string
    }[]
    rooms: {
      id: string
      name: string
      longDescription: string
      occupancy: {
        maxAdults: number
        maxChildren: number
      }
    }[];
  }[]
}

export default function HotelList({ hotels }: TProps) {
  return (
    <ul className={styles.hotelList}>
      {hotels.map((hotel) => (
        <li className={styles.hotel} key={hotel.id}>
          <article>
            <header className={styles.header}>

              <Carousel
                className={styles.headerImage}
                arrows
                showDots
                removeArrowOnDeviceType="mobile"
                centerMode={false}
                slidesToSlide={1}
                swipeable
                minimumTouchDrag={80}
                draggable={false}
                infinite
                keyBoardControl
                responsive={{
                  desktop: {
                    breakpoint: {
                      max: 3000,
                      min: 1024,
                    },
                    items: 1,
                  },
                  mobile: {
                    breakpoint: {
                      max: 464,
                      min: 0,
                    },
                    items: 1,
                  },
                  tablet: {
                    breakpoint: {
                      max: 1024,
                      min: 464,
                    },
                    items: 1,
                  },
                }}
              >
                {hotel.images.map((image) => (
                  <img
                    key={image.url}
                    src={image.url}
                    style={{
                      display: 'block',
                      height: '100%',
                      margin: 'auto',
                      width: '100%',
                    }}
                    alt={hotel.name}
                  />
                ))}
              </Carousel>

              <section className={styles.headerDescription}>
                <h2>{hotel.name}</h2>
                <address>
                  {hotel.address1}
                  <br />
                  {hotel.address2}
                  <br />
                  {hotel.postcode}
                </address>
              </section>
              <div className={styles.headerRating}>
                <StarsRating
                  rating={Number.parseInt(hotel.starRating, 10) as 1 | 2 | 3 | 4 | 5}
                />
              </div>
            </header>

            <ul className={styles.roomList}>
              {hotel.rooms.map((room) => (
                <li
                  className={styles.room}
                  key={room.id}
                >
                  <article>
                    <section>
                      <h3>{room.name}</h3>
                      <h4>
                        Adults:
                        {' '}
                        {room.occupancy.maxAdults}
                      </h4>
                      <h4>
                        Children:
                        {' '}
                        {room.occupancy.maxChildren}
                      </h4>
                    </section>
                    <p className={styles.roomDescription}>
                      {room.longDescription}
                    </p>
                  </article>
                </li>
              ))}
            </ul>
          </article>
        </li>
      ))}
    </ul>
  );
}
