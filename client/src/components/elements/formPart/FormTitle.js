import React, { useContext } from 'react';
import AuthUserContext from '../../../context/authUser/authUserContext';

const FormTitle = ({ title }) => {
  const authUserContext = useContext(AuthUserContext);
  const { comName, comNameTail, comAddress } = authUserContext;
  return (
    <section className='h-20vh w-100 mt-05 mb-3' id='formTitle'>
      <div className='fs-large h-center-content'>{title}</div>
      <div className='fs-lead h-center-content '>
        {comName} {comNameTail}
      </div>
      <div className='h-center-content '>{comAddress}</div>
    </section>
  );
};

export default FormTitle;
