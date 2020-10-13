import React from 'react';

const DeleteBtnSmallNoWarning = ({ name, onClick, value, className, style }) => {
  return (
    <button
      name={name}
      value={value}
      onClick={onClick}
      className={`hover-no btn btn-sq btn-sq-small mt-05 bg-fade fc-fade-dark bd-no center-content ${className}`}
      style={style}
    >
      x
    </button>
  );
};

export default DeleteBtnSmallNoWarning;
