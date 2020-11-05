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
  const theUnit = mtrl.unit

  const onChange = (e) => {
    //   'cm',
    //   'g',//
    //   'in',
    //   'm',//
    //   'pcs',//
    //   'set',//
    //   'yds',//
    const num = e.target.value;
    switch (theUnit) {
      case 'm':
      case 'yds':
        if (String(num).slice(1, 2) == ".") {
          if (String(num).length <= 4) {
            e.target.value = Number(e.target.value)
          } else {
            const theValue = String(num).slice(0, 1)
            e.target.value = Number(theValue) + 1
          }
          addValueMtrlCspt(e);
        } else if (String(num).length <= 2) {
          e.target.value = Number(e.target.value)
          addValueMtrlCspt(e);
        } else {
          e.target.value = 99;
          addValueMtrlCspt(e);
        }
        break;
      case 'in':
        if (String(num).slice(1, 2) == ".") {
          if (String(num).length <= 3) {
            e.target.value = Number(e.target.value)
          } else {
            const theValue = String(num).slice(0, 1)
            e.target.value = Number(theValue) + 1
          }
          addValueMtrlCspt(e);
        } else if (String(num).length <= 2) {
          e.target.value = Number(e.target.value)
          addValueMtrlCspt(e);
        } else {
          e.target.value = 99;
          addValueMtrlCspt(e);
        }
        break;
      case 'pcs':
      case 'set':
        if (String(num).slice(1, 2) == ".") {
          const theValue = String(num).slice(0, 1)
          e.target.value = Number(theValue) + 1
          addValueMtrlCspt(e);
        } else if (String(num).length <= 2) {
          e.target.value = Number(e.target.value)
          addValueMtrlCspt(e);
        } else {
          e.target.value = 99;
          addValueMtrlCspt(e);
        }
        break;
      case 'cm':
      case 'g':
        if (String(num).slice(1, 2) == ".") {
          const theValue = String(num).slice(0, 1)
          e.target.value = Number(theValue) + 1
          addValueMtrlCspt(e);
        } else if (String(num).length <= 3) {
          e.target.value = Number(e.target.value)
          addValueMtrlCspt(e);
        } else {
          e.target.value = 999;
          addValueMtrlCspt(e);
        }
        break;
      default:
        if (String(num).length < 2) {
          addValueMtrlCspt(e);
        } else {
          e.target.value = 9;
          addValueMtrlCspt(e);
        }
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
        max='999'
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
