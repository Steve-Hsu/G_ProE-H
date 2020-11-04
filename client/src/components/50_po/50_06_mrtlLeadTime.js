import React, { useContext } from 'react';
//Context
import PurContext from '../../context/pur/purContext';
import PopoverContext from '../../context/popover/popoverContext'

//Component
import GoBackBtnSpinSmall from '../elements/btns/GoBackBtnSpinSmall';
import TopLabelTiny from '../elements/Label/TopLabelTiny';
import SqBtnLarge from '../elements/btns/SqBtnLarge';
import MrtlLeadTimeItem from '../50_po/50_06_01_mtrlLeadTimeItem';

const MrtlLeadTime = ({ caseMtrl, idx }) => {
  const purContext = useContext(PurContext)
  const popoverContext = useContext(PopoverContext)
  const { openMtrlLeadTime, addLeadTime, updateLeadTime, deleteLeadTime, uploadCaseMtrl } = purContext;
  const { _id, purchaseQtySumUp, purchaseLossQtySumUp, purchaseMoqQty, leadTimeComplete } = caseMtrl;
  const caseMtrlId = _id
  const { toggleLoading } = popoverContext;

  const totalMtrlQty = purchaseQtySumUp + purchaseLossQtySumUp + purchaseMoqQty;
  const PoConfirmed = caseMtrl.price ? true : false
  const unit = caseMtrl.price ? caseMtrl.price.poUnit : 'PO not confirmed'

  const goBack = () => {
    openMtrlLeadTime(caseMtrlId)
  }

  const mtrlQtyTitle = () => {
    if (PoConfirmed) {
      return `${totalMtrlQty} ${unit}`
    } else {
      return (<span className='fc-danger'>PO not confirmed</span>)
    }
  }

  const onClick = (e) => {
    e.preventDefault();
    addLeadTime(caseMtrlId);
  }

  // const submit = async (e) => {
  //   e.preventDefault();
  //   toggleLoading(true);
  //   console.log('order summary is triggered');
  //   await uploadCaseMtrl('leadTime').then(() => {
  //     toggleLoading(false);
  //   });
  // };


  return (
    <div
      className=' p-1 round-card bg-cp-elem bd-light flexBox'
      style={{ width: '100%' }}
    >

      <div>
        <TopLabelTiny label={idx + 1} />
        <GoBackBtnSpinSmall onClick={goBack} />
      </div>
      <div className='ml-1' style={{ flex: '1 1 auto' }}>
        {/* <form id='updateOsCaseMtrlLeadTime' onSubmit={submit}></form> */}
        <section className='grid-3 hover-pointer' onClick={goBack}>
          <div style={{ flex: '1 1 auto' }}>
            <TopLabelTiny label='Supplier' />
            <div className='fs-large' id={`supplier${caseMtrlId}`}>
              {caseMtrl.supplier ? caseMtrl.supplier : (<span className='fc-danger'>No suuplier</span>)}
            </div>
          </div>

          <div style={{ flex: '1 1 auto' }}>
            <TopLabelTiny label='Ref No.' />
            <div className='fs-large' id={`ref_no${caseMtrlId}`}>
              {caseMtrl.ref_no ?
                caseMtrl.ref_no :
                (<span className='fc-fade-dark'>No Reference number</span>)}
            </div>
          </div>

          <div style={{ flex: '1 1 auto' }}>
            <TopLabelTiny label='Quantity' />
            <div className='fs-large' id={`poQty${caseMtrlId}`}>
              {mtrlQtyTitle()}
            </div>
          </div>
        </section>

        {caseMtrl.mColor && caseMtrl.mSizeSPEC ?
          (<div className='mb-1'>
            <TopLabelTiny label='Color / SPEC' />
            <div className='fs-lead'>
              {caseMtrl.mColor}{'  '}/{'  '}{caseMtrl.mSizeSPEC}
            </div>
          </div>) :
          caseMtrl.mColor ?
            (<div className='mb-1'>
              <TopLabelTiny label='Color' />
              <div className='fs-lead'>
                {caseMtrl.mColor}
              </div>
            </div>) :
            caseMtrl.mSizeSPEC ?
              (<div className='mb-1'>
                <TopLabelTiny label='SPEC' />
                <div className='fs-lead'>
                  {caseMtrl.mSizeSPEC}
                </div>
              </div>) :
              null}

        {PoConfirmed ? (
          <div>
            {!leadTimeComplete ? (
              <SqBtnLarge
                name='mPriceBtn'
                onClick={onClick}
                label={<i className="far fa-calendar-alt"> LeadTime ＋</i>}
                style={{ width: '10rem' }}
              />
            ) : (
                <div className='sq-block bd-radius-s bg-cp-1-light bd-light center-content' style={{ width: '13rem' }}>
                  <i className="fas fa-check-circle fc-success mr-05"></i> All Qty is set leadTime.
                </div>
              )}
          </div>
        ) : null}
        {/* LeadTime container */}
        <section>
          {caseMtrl.leadTimes ? caseMtrl.leadTimes.map((LTime, idx) => (
            <MrtlLeadTimeItem
              key={LTime.id}
              id={LTime.id}
              caseMtrlId={caseMtrlId}
              date={LTime.date}
              qty={LTime.qty}
              unit={unit}
              idx={idx}
              updateLeadTime={updateLeadTime}
              deleteLeadTime={deleteLeadTime}
            />
          )) : null}
        </section>

      </div>


    </div >
  )
}

export default MrtlLeadTime

  // < section className = 'flexBox' onClick = { goBack } >
  //         <div style={{ flex: '1 1 auto' }}>
  //           {/* <TopLabelTiny label='Supplier' /> */}
  //           <div className='fs-large' id={`space${id}`}>
  //             {/* {caseMtrl.supplier} */}
  //           </div>
  //         </div>
  //         <div style={{ flex: '1 1 auto' }}>
  //           <TopLabelTiny label='Color' />
  //           <div className='fs-large' id={`color${id}`}>
  //             {caseMtrl.mColor}
  //           </div>
  //         </div>
  //         <div style={{ flex: '1 1 auto' }}>
  //           <TopLabelTiny label='SPEC' />
  //           <div className='fs-large' id={`spec${id}`}>
  //             {caseMtrl.mSizeSPEC}
  //           </div>
  //         </div>
  //       </ >