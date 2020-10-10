import React from 'react';
import Companies from '../00_companies/Companies';
import CompanyForm from '../00_companies/CompanyForm';
import CompanyFilter from '../00_companies/CompanyFilter';

export const ComManager = () => {
  return (
    <div className='grid-2'>
      <div>
        <CompanyForm />
      </div>
      <div>
        <CompanyFilter />
        <Companies />
      </div>
    </div>
  );
};

export default ComManager;
