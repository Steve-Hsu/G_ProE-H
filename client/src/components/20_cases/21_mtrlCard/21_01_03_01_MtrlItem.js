import React from 'react';

const MtrlItem = ({ colorWay, mColor }) => {
  return (
    <div className='bd-light'>
      <div className='bg-fade fw-bold px-05'>{colorWay}</div>
      <div className='px-05'>{mColor}</div>
      <div style={{ height: '3.8cm' }}></div>
    </div>
  );
};

export default MtrlItem;
