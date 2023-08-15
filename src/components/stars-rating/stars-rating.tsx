import React from 'react';
import cx from 'classnames';

import Star from './star';

import styles from './stars-rating.module.css';

type TProps = {
  rating: 1 | 2 | 3 | 4 | 5
  className?: string
}

export default function StarsRating({ rating, className }: TProps) {
  return (
    <div
      className={cx(styles.starsRating, className)}
      role="img"
      aria-label={`Rating: ${rating} out of 5 stars`}
    >
      {new Array(5).fill(null).map((_, index) => (
        <Star
          // eslint-disable-next-line react/no-array-index-key
          key={index}
          className={index <= rating - 1 ? 'filled' : 'empty'}
          aria-hidden
        />
      ))}
    </div>
  );
}

StarsRating.defaultProps = {
  className: null,
};
