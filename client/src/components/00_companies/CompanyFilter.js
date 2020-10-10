import React, { useContext, useRef, useEffect } from 'react';
import ComContext from '../../context/company/comContext';

const CompanyFilter = () => {
  const comContext = useContext(ComContext);

  // Alternative form, when you need a form but more simpler, you cau use useRef()
  const text = useRef('');

  const { filterCompany, clearFilterCompany, filtered } = comContext;

  useEffect(() => {
    if (filtered === null) {
      text.current.value = '';
    }
  });

  const onChange = (e) => {
    if (text.current.value !== '') {
      filterCompany(e.target.value);
    } else {
      clearFilterCompany();
    }
  };

  return (
    <form>
      <input
        ref={text}
        type='text'
        placeholder='Filter Companies...'
        onChange={onChange}
      ></input>
    </form>
  );
};

export default CompanyFilter;
