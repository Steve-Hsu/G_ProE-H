import React, { useContext, Fragment } from 'react';
import PropTypes from 'prop-types';
import CasesContext from '../../context/cases/casesContext';

const MtrlCspt = ({ size, mtrl }) => {
  const casesContext = useContext(CasesContext);
  const { addValueMtrlCspt, osNo, caseConfirmDate } = casesContext;
  //@ Value for input
  //words length limit
  const maxWdsLength = '4';
  const csptLength = maxWdsLength;

  const sizeId = size.id;
  const cspt = mtrl.cspts.find(({ size }) => size === sizeId); // This is JS array's find method, it returns 1 item, if some many are found, only still return first item
  const multipleCSPT = mtrl.multipleCSPT;

  const Max = 999;
  const onChange = (e) => {
    const num = e.target.value;
    if (String(num).length <= String(Max).length) {
      addValueMtrlCspt(e);
    } else {
      e.target.value = Max;
      addValueMtrlCspt(e);
    }
  };

  return (
    // <Fragment>
    //   {cspt ? (
    <div className='mr-1'>
      <input
        name={mtrl.id}
        id={cspt.id}
        type='number'
        placeholder='.'
        onChange={onChange}
        maxLength={csptLength}
        value={cspt.cspt}
        min='0'
        max={Max}
        className='MPH-input'
        step='.01'
        readOnly={caseConfirmDate || osNo ? true : false}
      />
      <label htmlFor={cspt.id} className='MPH-input-label'>
        {multipleCSPT == true ? `${size.gSize}` : 'For all Size'}
      </label>
    </div>
    //   ) : null}
    // </Fragment>
  );
};

export default MtrlCspt;

MtrlCspt.propTypes = {
  size: PropTypes.object.isRequired,
  mtrl: PropTypes.object.isRequired,
};
