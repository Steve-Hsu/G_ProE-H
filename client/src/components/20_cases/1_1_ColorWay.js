import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import CasesContext from '../../context/cases/casesContext';
import PopoverContext from '../../context/popover/popoverContext';
import DeleteBtnSmall from '../elements/btns/DeleteBtnSmall';

const ColorWay = ({ cWay, purpose }) => {
  const casesContext = useContext(CasesContext);
  const { cNo, osNo, cWays, updatecWay, caseConfirmDate } = casesContext;
  const popoverContext = useContext(PopoverContext);
  const { togglePopover } = popoverContext;
  //For sparete the postion of btn, here use an inline style.
  //deleteBtn in ColorWay.

  // const deleteBtnPosition = {
  //   // top: ' 50%',
  //   // left: '50%',
  //   // transform: 'translate(0rem, -0.5rem)',
  // };

  //@ Value for input
  //words length limit
  const maxWdsLength = '50';
  const colorWayLength = maxWdsLength;

  // const te = {
  //   color: 'orange',
  // };

  const warningTextBoxStyle = () => {
    let obj = {};
    let emptyWar = new RegExp('empty-', 'i');
    let duplicatedWar = new RegExp('duplicated-', 'i');
    if (
      emptyWar.test(cWay.gClr) ||
      duplicatedWar.test(cWay.gClr) ||
      cWays.filter((i) => {
        return i.gClr === cWay.gClr;
      }).length > 1 ||
      cWay.gClr === ''
    ) {
      obj = {
        color: 'white',
        background: 'var(--danger-color)',
      };
    } else {
      obj = {
        color: 'var(--cp-3)',
      };
    }
    return obj;
  };

  return (
    <div
      className='h-scatter-content mt-1  pl-1 bd-cp-2-b-2px'
      style={{ height: 'var(--btn-h-m)' }}
    >
      <div style={{ height: 'var(--btn-h-m)' }}>
        {cNo === null || caseConfirmDate != null || osNo != null ? null : (
          <DeleteBtnSmall value={cWay.id} name='cWay' onClick={togglePopover} />
        )}
      </div>
      {caseConfirmDate || osNo || purpose === 'completeSet' ? (<div style={{ height: 'var(--btn-h-m' }}>
        <div className='MPH-input bd-no fs-lead w-100 h-100 hover-no'>
          {cWay.gClr.includes('COLORWAY_DUPLICATED') ? (<span className='fc-danger'>{`Empty-${Number(cWays.findIndex((e) => e.id === cWay.id)) + 1}`}</span>) : cWay.gClr}
        </div>
        <label htmlFor={cWay.id} className='MPH-input-label'>
          Color Way -{' '}
          {`${Number(cWays.findIndex((e) => e.id === cWay.id)) + 1}`}
        </label>
      </div>) : (
          <div style={{ height: 'var(--btn-h-m)' }}>
            <input
              id={cWay.id}
              type='text'
              name='style'
              placeholder='.'
              onChange={updatecWay}
              maxLength={colorWayLength}
              autoFocus
              className='MPH-input bd-no fs-lead w-100 h-100 bg-no'
              style={warningTextBoxStyle()}
              value={cWay.gClr || ''}
            />
            <label htmlFor={cWay.id} className='MPH-input-label'>
              Color Way -{' '}
              {`${Number(cWays.findIndex((e) => e.id === cWay.id)) + 1}`}
            </label>
          </div>
        )}

    </div>
  );
};

export default ColorWay;

// PropTyeps
ColorWay.propTypes = {
  cWay: PropTypes.object.isRequired,
};
