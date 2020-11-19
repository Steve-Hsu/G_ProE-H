import React from 'react';

const NoAndDateHeader = ({ No, className }) => {
  const d = new Date();
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  const theTime = String(
    d.getDate() + '/' + months[d.getMonth()] + '/' + d.getFullYear()
  );

  return (
    <div className={`h-scatter-content ${className}`}>
      <div></div>
      <div className='fs-tiny'>
        {No ? (<div>No : {No}</div>) : null}
        <div>Date : {theTime}</div>
      </div>
    </div >
  );
};

export default NoAndDateHeader;
