import React, { useContext, Fragment } from 'react';
import PurContext from '../../context/pur/purContext';
import CompleteSetContext from '../../context/completeSet/completeSetContext'
import Board from '../elements/board/Board';
import DeleteBtnSmall from '../elements/btns/DeleteBtnSmall';
import PopoverContext from '../../context/popover/popoverContext';
// import DeletePopover from '../layout/DeletePopover';
import LockedBadge from '../elements/badge/LockedBadge';
import SqBtnLarge from '../elements/btns/SqBtnLarge';

const OrderSummary = ({ purpose, props }) => {
  const popoverContext = useContext(PopoverContext);
  const { popover, togglePopover, isLoading, osError, current } = popoverContext;

  const purContext = useContext(PurContext);
  const { switchPage, currentOrderSummary } = purContext;
  const completeSetContext = useContext(CompleteSetContext);
  const { currentOS, openCompleteSet } = completeSetContext

  const { _id, osNo, caseList, suppliers, osConfirmDate, caseMtrls } =
    purpose === 'purchaseOrder' ?
      currentOrderSummary
      :
      purpose === 'completeSetOfCase' ?
        currentOS
        : null

  const onClick_1 = (e) => {
    e.preventDefault();
    switchPage('oSMtrlList');
  };

  const onClick_2 = (e) => {
    e.preventDefault();
    switchPage('leadTimePage')
  }

  const subjects = () => {
    if (purpose === 'purchaseOrder') {
      return [suppliers, caseMtrls]
      // if (suppliers) {
      //   return [suppliers, caseMtrls]
      // } else {
      //   return [[], []]
      // }
    } else if (purpose === 'completeSetOfCase') {
      return [currentOS.caseList, currentOS.caseList]
    }
  }

  const checkConfirmOfSuppliers = () => {
    let check = false
    if (suppliers) {
      suppliers.map((s) => {
        if (s.poConfirmDate) {
          check = true
        }
      })
    }
    return check
  }

  const toggleFuncs = () => {
    switch (purpose) {
      case 'purchaseOrder':
        return switchPage
      case 'completeSetOfCase':
        return openCompleteSet
      default:
    }

  }

  console.log("the osConfirmDate", osConfirmDate)

  return (
    <Fragment>
      <div className='round-area bd-light bg-cp-1 mb-05 mt-05'>
        <div className='h-scatter-content'>
          {' '}
          <div className='mb-5'>The Order Summary : {osNo}</div>
          {osConfirmDate === null ? (
            <DeleteBtnSmall
              name='deleteOs'
              onClick={togglePopover}
              value={_id}
              className='m-0 noPrint'
            />
          ) : null}
        </div>

        {/* Case purchased List */}
        <div>
          The case purchased :{' '}
          <div className='flexBox bg-gray-2 round-area mb-05'>
            {caseList.map((CS) => {
              return (
                <div key={CS._id} className='ml-05 fs-small' style={{ flex: '0 0 2.5rem' }}>
                  {CS.cNo},
                </div>
              );
            })}
          </div>
        </div>
        <div className='h-scatter-content'>
          <div></div>
          {purpose === 'purchaseOrder' ? (<div className='flexBox'>
            {checkConfirmOfSuppliers() ? (<SqBtnLarge onClick={onClick_1} label='Enter HS-Code' className='mr-05 fs-small' />) : null}
            <SqBtnLarge onClick={onClick_2} label='Lead Time' />
          </div>) : null}

        </div>

        {osConfirmDate ? (
          <LockedBadge
            labels={[
              'All the Purchase Order is confirmed.',
              'The order summary submitted to Accounting Department',
            ]}
          />
        ) : null}
      </div>

      <Board
        subjects={subjects()}
        // purpose='order'
        purpose={purpose}
        label={purpose === 'purchaseOrder' ? (<div>{suppliers ? suppliers.length : 0} <span className='fs-normal fc-cp-1'>Purchase Order</span></div>) : null}
        toggleItemAttributes={toggleFuncs()}
      />
    </Fragment>)
};

export default OrderSummary;
