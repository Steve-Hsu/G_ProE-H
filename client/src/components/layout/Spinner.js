import React, { Fragment } from 'react';
import spinner from './spinner.gif';

export default () => (
  <Fragment>
    {/* <div className='center-content'>Loading ...</div> */}

    <div className='center-content'>
      <div className='loader'></div>
    </div>
    {/* <img
      src={spinner}
      className='bg-cp-2'
      style={{ width: '50px', height: '50px' }}
      alt='Loading...'
    /> */}
  </Fragment>
);
