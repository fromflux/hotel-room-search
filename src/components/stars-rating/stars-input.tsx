/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { ChangeEventHandler, Fragment } from 'react';
import cx from 'classnames';

import Star from './star';

import styles from './stars-input.module.css';

type TProps = {
  value: 1 | 2 | 3 | 4 | 5
  onChange: ChangeEventHandler<HTMLInputElement>
}

export default function StarsInput({ value, onChange }: TProps) {
  return (
    <fieldset className={styles.starsInput}>
      {new Array(5).fill(null).map((_, index) => (
        // eslint-disable-next-line react/no-array-index-key
        <Fragment key={index}>
          <input
            type="radio"
            name="rating"
            id={`rating-${index + 1}`}
            value={index + 1}
            checked={index + 1 === value}
            onChange={onChange}
          />
          <label
            className={cx({
              filled: index + 1 <= value,
            })}
            htmlFor={`rating-${index + 1}`}
            aria-label={`${index + 1} stars`}
          >
            <Star />
          </label>
        </Fragment>
      ))}
    </fieldset>
  );
}
