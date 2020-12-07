import React, { Fragment } from 'react';
import Navbar from '../layout/Navbar'

export const NotFound = () => {
  return (
    <Fragment>
      <Navbar />
      <div className='container container-with-navbar'>
        <h1>Not Found</h1>
        <p className='lead'>The page you are looking for dose not exist.</p>
      </div>
    </Fragment>

  );
};

export default NotFound;
