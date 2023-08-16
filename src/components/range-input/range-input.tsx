import React, { MouseEventHandler, useId } from 'react';

import styles from './range-input.module.css';

type TProps = {
  label: string
  value: number
  min: number
  max: number
  // onChange: React.ChangeEventHandler<HTMLInputElement>
  onChange: (value: number) => void
}

export default function RangeInput({
  label, value, min, max, onChange,
}: TProps) {
  const id = useId();

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (evt) => {
    const newValue = Number.parseInt(evt.target.value, 10);
    onChange(Number.isInteger(newValue) ? newValue : min);
  };

  const handleIncClick: MouseEventHandler<HTMLButtonElement> = () => {
    onChange(Math.min(max, value + 1));
  };

  const handleDecClick: MouseEventHandler<HTMLButtonElement> = () => {
    onChange(Math.max(min, value - 1));
  };

  return (
    <label
      className={styles.rangeInput}
      htmlFor={id}
    >
      <span>
        {label}
        :
      </span>
      <button
        type="button"
        onClick={handleDecClick}
        aria-label={`Decrease ${label}`}
      >
        -
      </button>
      <input
        id={id}
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={handleChange}
      />
      <button
        type="button"
        onClick={handleIncClick}
        aria-label={`Increase ${label}`}
      >
        +
      </button>
    </label>
  );
}
