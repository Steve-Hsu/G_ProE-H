import React from 'react';

const SqBtnLarge = ({ label, onClick, name, value, className, style }) => {
  return (
    <button
      name={name}
      className={`btn btn-sq sq-block center-content ${className}`}
      onClick={onClick}
      value={value}
      style={style}
    >
      {label}
    </button>
  );
};

export default SqBtnLarge;
