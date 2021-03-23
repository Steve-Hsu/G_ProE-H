import React, { useContext, useRef, useEffect } from 'react';

const ItemFilter = () => {
  // const userContext = useContext(UserContext);

  // Alternative form, when you need a form but more simpler, you cau use useRef()
  const text = useRef('');

  useEffect(() => {
    if (filtered === null) {
      text.current.value = '';
    }
  });

  const onChange = (e) => {
    if (text.current.value !== '') {
      // filterUser(e.target.value);
    } else {
      // clearFilterUser();
    }
  };

  return (
    <form className='flexBox w-100'>
      <div className='mr-05 center-content'>
        <i className='fas fa-search'></i>
      </div>
      <div style={{ flex: '1 1' }}>
        <input
          ref={text}
          type='text'
          placeholder='Search...'
          onChange={onChange}
        />
      </div>
    </form>
  );
};

export default ItemFilter;
