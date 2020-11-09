import React, { useContext, Fragment } from 'react';
import PropTypes from 'prop-types';
import CasesContext from '../../context/cases/casesContext';

const Qty = ({ purpose, size, gQty, }) => {
  const casesContext = useContext(CasesContext);
  const { cWays, addCaseValue } = casesContext;

  //@ Value for input
  //words length limit
  const Max = 99999;
  let content;

  const addNumber = (e) => {
    const num = e.target.value;
    if (String(num).length > String(Max).length) {
      e.target.value = Max;
      addCaseValue(e);
    } else {
      addCaseValue(e);
    }
  };

  const contentQty = () => {
    return (
      <Fragment>
        <input
          name='gQty'
          id={gQty.id}
          placeholder='.'
          type='number'
          // Add ||'' to the value to prevent error as uncontrolled to controled.
          value={gQty.gQty || ''}
          onChange={addNumber}
          min='0'
          max={Max}
          className='MPH-input bd-no fs-lead h-100 pl-05 bg-cp-1'
        />
        <label
          htmlFor={gQty.id}
          className='MPH-input-label MPH-input-label-gQty'
        >
          {cWays.find(({ id }) => id === gQty.cWay) == true
            ? cWays.find(({ id }) => id === gQty.cWay).gClr
            : null}
          {'  '}
          {size.gSize}
        </label>
      </Fragment>
    )
  }

  const contentCompleteSet = () => {
    return (
      <div
        name='gQty'
        id={gQty.id}
        className='center-content'
      >
        {gQty.leadTime ? gQty.leadTime.slice(5) : 'No results yet'}
      </div>
    )
  }


  switch (purpose) {
    case 'completeSet':
      content = contentCompleteSet()
      break;
    default:
      content = contentQty()
  }

  return (
    <Fragment>
      {gQty.size === size.id ? (
        <div
          key={gQty.id}
          style={{ height: 'var(--btn-h-m)' }}
          className='bg-cp-1 mt-1 bd-cp-2-b-2px'
        >
          {content}

        </div>
      ) : null}
    </Fragment>
  );
};

export default Qty;

// PropTyeps
Qty.propTypes = {
  size: PropTypes.object.isRequired,
  gQty: PropTypes.object.isRequired,
};
