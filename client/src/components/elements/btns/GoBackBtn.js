import React from 'react';

const GoBackBtn = ({ name, onClick, className, value }) => {
  return (
    <button
      name={name}
      value={value}
      className={`btn btn-sq center-content bd-round bd-no noPrint ${className}`}
      onClick={onClick}
    >
      <i className='fas fa-chevron-left'></i>
    </button>
  );
};

export default GoBackBtn;
