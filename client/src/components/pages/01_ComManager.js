import React, { Fragment } from 'react';
import Companies from '../00_companies/Companies';
import CompanyForm from '../00_companies/CompanyForm';
import CompanyFilter from '../00_companies/CompanyFilter';
import Navbar from '../layout/Navbar'

export const ComManager = () => {
  return (
    <Fragment>
      <Navbar />
      <div className='grid-2'>
        <div>
          <CompanyForm />
        </div>
        <div>
          <CompanyFilter />
          <Companies />
        </div>
      </div>
    </Fragment>

  );
};

export default ComManager;
