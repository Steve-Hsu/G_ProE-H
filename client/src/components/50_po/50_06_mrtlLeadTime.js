import React, { useContext } from 'react';
//Context
import PurContext from '../../context/pur/purContext';

//Component
import GoBackBtnSpinSmall from '../elements/btns/GoBackBtnSpinSmall';
import TopLabelTiny from '../elements/Label/TopLabelTiny';
import SqBtnLarge from '../elements/btns/SqBtnLarge';
import MrtlLeadTimeItem from '../50_po/50_06_01_mtrlLeadTimeItem';

const MrtlLeadTime = ({ caseMtrl, idx }) => {
  const purContext = useContext(PurContext)
  const { openMtrlLeadTime, addLeadTime, updateLeadTime, deleteLeadTime } = purContext;
  const { id, purchaseQtySumUp, purchaseLossQtySumUp, purchaseMoqQty, } = caseMtrl;

  const totalMtrlQty = purchaseQtySumUp + purchaseLossQtySumUp + purchaseMoqQty;
  const PoConfirmed = caseMtrl.price ? true : false
  const unit = caseMtrl.price ? caseMtrl.price.poUnit : 'PO not confirmed'

  const goBack = () => {
    openMtrlLeadTime(caseMtrl.id)
  }

  const mtrlQtyTitle = () => {
    if (PoConfirmed) {
      return `${totalMtrlQty} ${unit}`
    } else {
      return (<span className='fc-danger'>PO not confirmed</span>)
    }
  }

  const onClick_1 = (e) => {
    e.preventDefault();
    addLeadTime(id);
  }

  const leadTimeTotalQty = () => {
    if (caseMtrl.leadTimes) {
      let number = 0
      caseMtrl.leadTimes.map((LTime) => {
        number += LTime.qty;
      })
      return number
    } else {
      return 0
    }
  }


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

        <section className='flexBox' onClick={goBack}>
          <div style={{ flex: '1 1 auto' }}>
            <TopLabelTiny label='Supplier' />
            <div className='fs-large' id={`supplier${id}`}>
              {caseMtrl.supplier}
            </div>
          </div>
          <div style={{ flex: '1 1 auto' }}>
            <TopLabelTiny label='Ref No.' />
            <div className='fs-large' id={`ref_no${id}`}>
              {caseMtrl.ref_no}
            </div>
          </div>
          <div style={{ flex: '1 1 auto' }}>
            <TopLabelTiny label='Quantity' />
            <div className='fs-large' id={`poQty${id}`}>
              {mtrlQtyTitle()}
            </div>
          </div>
        </section>
        <section className='flexBox mb-05'>
          {PoConfirmed ? (
            <div>
              {totalMtrlQty > leadTimeTotalQty() ? (
                <SqBtnLarge
                  name='mPriceBtn'
                  onClick={onClick_1}
                  label={<i className="far fa-calendar-alt"> LeadTime ＋</i>}
                  style={{ width: '10rem' }}
                />
              ) : (
                  <div className='sq-block bd-radius-s bg-cp-2-light-c center-content w-20vw'>
                    All Qty is set leadTime.
                  </div>
                )}
            </div>
          ) : null}

        </section>

        {/* LeadTime container */}
        <section>
          {caseMtrl.leadTimes ? caseMtrl.leadTimes.map((LTime, idx) => (
            <MrtlLeadTimeItem
              key={LTime.id}
              id={LTime.id}
              caseMtrlId={caseMtrl.id}
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


    </div>
  )
}

export default MrtlLeadTime
