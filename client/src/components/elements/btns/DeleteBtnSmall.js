import React from 'react';

const DeleteBtnSmall = ({ name, onClick, value, className, style }) => {
  return (
    <button
      name={name}
      value={value}
      onClick={onClick}
      className={`btn btn-warning btn-sq btn-sq-small mt-05 bg-fade fc-fade-dark bd-no center-content ${className}`}
      style={style}
    >
      x
    </button>
  );
};

export default DeleteBtnSmall;
