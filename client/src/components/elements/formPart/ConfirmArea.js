import React, { useContext } from 'react';
import AuthUserContext from '../../../context/authUser/authUserContext';

function ConfirmArea() {
  const authUserContext = useContext(AuthUserContext);
  const { comName, comNameTail, comAddress } = authUserContext;
  return (
    <section id='confirmArea' className='noBreak mb-1'>
      <div className='fs-lead'>Confirmed by :</div>
      <div className='h-scatter-content'>
        <div></div>
        <div>
          <div className='fs-tiny'>Signature</div>
          <br />
          <br />
          <br />
          <div>______________________________________________</div>
          <div>
            {' '}
            {comName} {comNameTail}
          </div>
        </div>
      </div>
    </section>
  );
}

export default ConfirmArea;
