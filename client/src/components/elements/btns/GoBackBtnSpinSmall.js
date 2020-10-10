import React from 'react';

const GoBackBtnSpinSmall = ({ onClick, id }) => {
  return (
    <div className='flexBox'>
      <div onClick={onClick} className='hover-spin-90'>
        <i className='fas fa-angle-down' id={id}></i>
      </div>
    </div>
  );
};

export default GoBackBtnSpinSmall;
