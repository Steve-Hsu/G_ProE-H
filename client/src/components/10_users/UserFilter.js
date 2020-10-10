import React, { useContext, useRef, useEffect } from 'react';
import UserContext from '../../context/user/userContext';

const UserFilter = () => {
  const userContext = useContext(UserContext);

  // Alternative form, when you need a form but more simpler, you cau use useRef()
  const text = useRef('');

  const { filterUser, clearFilterUser, filtered } = userContext;

  useEffect(() => {
    if (filtered === null) {
      text.current.value = '';
    }
  });

  const onChange = (e) => {
    if (text.current.value !== '') {
      filterUser(e.target.value);
    } else {
      clearFilterUser();
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
          placeholder='Filter Users...'
          onChange={onChange}
        />
      </div>
    </form>
  );
};

export default UserFilter;
