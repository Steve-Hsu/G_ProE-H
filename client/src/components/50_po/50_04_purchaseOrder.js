import React, { useContext, Fragment, useEffect } from 'react';
import PurContext from '../../context/pur/purContext';
// import AuthUserContext from '../../context/authUser/authUserContext';

// Component
import PoItem from './50_04_01_poItem';
import NoAndDateHeader from '../../components/elements/formPart/NoAndDateHeader';
import FormTitle from '../../components/elements/formPart/FormTitle';
import Conditions from '../elements/formPart/Conditions/Conditions';
import ConfirmArea from '../elements/formPart/ConfirmArea';
import DeletePopover from '../../components/layout/DeletePopover';
import PopoverContext from '../../context/popover/popoverContext';

const PurchaseOrder = () => {
  // const { downloadCase } = caseContext;

  const purContext = useContext(PurContext);
  const {
    currentOrderSummary,
    currentPoPriceList,
    currentPo,
    getMaterialPrice,
    updatePOInform,
    uploadPO,
    getPOTotal,
  } = purContext;
  const popoverContext = useContext(PopoverContext);
  const { _id, osNo, caseMtrls } = currentOrderSummary;
  const { toggleLoading } = popoverContext;

  // const authUserContext = useContext(AuthUserContext);
  // const { comName, comNameTail, comAddress, comPhone } = authUserContext;

  useEffect(() => {
    const currentMtrls = caseMtrls.filter((mtrl) => {
      return mtrl.supplier === currentPo.supplier;
    });
    getPOTotal(currentPo.supplier);

    getMaterialPrice(currentPo, currentMtrls);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPo, currentPo.poConfirmDate]);

  // let currentMtrls = [];

  let theNumber = 0;
  let totalAmount = 0;

  const currentMtrlsLength = caseMtrls.filter((mtrl) => {
    return mtrl.supplier === currentPo.supplier;
  }).length;

  const onClick = (e) => {
    e.preventDefault();
    updatePOInform(e);
  };

  const submit = async (e) => {
    e.preventDefault();
    toggleLoading(true);
    await uploadPO(_id, currentPo).then(() => {
      toggleLoading(false);
    });
  };

  const onChange = (e) => {
    e.preventDefault();
    updatePOInform(e);
  };

  // sort the caseMtrls by it ref_no
  const loopItems = () => {
    let arr = []
    arr = caseMtrls.sort((a, b) => {
      var refA = a.ref_no.toUpperCase(); // ignore upper and lowerCase;
      var refB = b.ref_no.toUpperCase(); // ignore upper and lowerCase;
      if (refA < refB) {
        return -1;
      }
      if (refA > refB) {
        return 1;
      }
      // ref_no must be equal
      return 0;
    })
    return arr
  }

  return (
    <div className=''>
      <NoAndDateHeader No={osNo} />
      <FormTitle title='Purchase Order' />
      <div className='fs-lead'>
        To : {String(currentPo.supplier).toUpperCase()}
      </div>

      {['address', 'attn', 'email', 'tel'].map((i) => (
        <div key={`${i}input`}>
          <div className='grid-Quo-condition p-0 noPrint mb-05'>
            <div className='v-center-content noPrint'>
              <div className='fw-bold'>{i.toUpperCase()} : </div>
            </div>
            {currentPo.poConfirmDate === null ? (
              <div className='v-center-content noPrint'>
                <input
                  type='text'
                  id={`${i}${_id}`}
                  name={i}
                  maxLength='200'
                  value={currentPo[i] || ''}
                  onChange={onChange}
                  className='whenPrintNoBorder whenPrintFSSmall ml-05'
                />
              </div>
            ) : (
                <div>{currentPo[i]}</div>
              )}
          </div>
          <div className='showWhenPrint w-100 fs-small'>
            <span className='fw-bold'>{i.toUpperCase()} : </span>
            {currentPo[i]}
          </div>
        </div>
      ))}

      <br />
      <form id='updatePurchaseOrder' onSubmit={submit}></form>
      <section id='purchaseListArea' className='mb-2'>
        <div className='fs-lead'>Materials <span className='ml-05 fs-small fc-gray-4'>{currentMtrlsLength} Items</span></div>
        <div className='grid-Pur-Mtrl bd-light bg-cp-2-light m-0 p-0 fs-small'>
          {[
            'No',
            'Ref_No',
            'Color',
            'SPEC',
            `Unit Price ()`,
            'Qantity',
            `Amount ()`,
          ].map((i) => (
            <div
              key={`purTitle${i}`}
              className='bd-light v-center-content p-05 f-wrap'
            >
              {i}
            </div>
          ))}
        </div>
        {loopItems().map((osMtrl) => {
          if (osMtrl.supplier == currentPo.supplier) {
            const currentMtrlPrice = currentPoPriceList.find(
              ({ osMtrlId }) => osMtrlId === osMtrl._id
            );
            // The loading may later than the mount of the component, so here set the default value for these variables to ref
            let unit = '';
            let currency = '';
            let mPrice = 0;
            let moq = 0;
            let moqPrice = 0;

            if (osMtrl.price && currentPo.poConfirmDate) {
              // If Po is confirmed, return the primce in price of the caseMtrls
              console.log('the price from caseMtrl')
              unit = osMtrl.price.poUnit ? osMtrl.price.poUnit : '';
              currency = osMtrl.price.currency ? osMtrl.price.currency : '';
              mPrice = osMtrl.price.mPrice ? osMtrl.price.mPrice : 0;
              moq = osMtrl.price.moq ? osMtrl.price.moq : 0;
              moqPrice = osMtrl.price.moqPrice ? osMtrl.price.moqPrice : 0;
            } else {
              // If Po is not confirmed, return the price get from database.
              if (currentMtrlPrice) {
                console.log('the price form currentMtrlPrice')
                unit = currentMtrlPrice.poUnit ? currentMtrlPrice.poUnit : '';
                currency = currentMtrlPrice.currency ? currentMtrlPrice.currency : '';
                mPrice = currentMtrlPrice.mPrice ? currentMtrlPrice.mPrice : 0;
                moq = currentMtrlPrice.moq ? currentMtrlPrice.moq : 0;
                moqPrice = currentMtrlPrice.moqPrice ? currentMtrlPrice.moqPrice : 0;
              }
            }

            const displayPrice = () => {
              if (moq) {
                if (osMtrl.purchaseQtySumUp + osMtrl.purchaseLossQtySumUp + osMtrl.purchaseMoqQty > moq) {
                  return mPrice;
                } else {
                  return moqPrice;
                }
              } else {
                return mPrice;
              }
            };

            theNumber = theNumber + 1;
            totalAmount += Number(osMtrl.purchaseQtySumUp + osMtrl.purchaseLossQtySumUp + osMtrl.purchaseMoqQty) * displayPrice()



            return (
              <PoItem
                key={osMtrl._id}
                osMtrl={osMtrl}
                theNumber={theNumber}
                displayPrice={displayPrice}
                unit={unit}
                currency={currency}
                moq={moq}
              />
            );
          } else {
            return null;
          }
        })}
        <div className='mt-05 h-scatter-content'>
          <div></div>
          <div>
            {`Total : ${Math.round(
              (Number(
                totalAmount) +
                Number.EPSILON) *
              100
            ) / 100}`}
          </div>
        </div>
      </section>

      <Conditions
        onClick={onClick}
        subjects={currentPo.conditions}
        deleteBtnName='deleteCondition'
        deleteBtnOnClick={onClick}
        selectName='condition'
        selectOnChange={onClick}
        inputName='conditionDescription'
        inputOnChange={onClick}
        isDisplay={currentPo.poConfirmDate}
      />
      <ConfirmArea />
      {/*   onClick,
  subjects,
  deleteBtnName,
  deleteBtnOnClick,
  selectName,
  selectOnChange,
  inputName,
  inputOnChange,
  itemClassName, */}

      {/* <br />
      <div>Conditions :</div>
      <div>Payment :</div>
      <div>Delivery :</div>
      <div>Shipment :</div>
      <div>Packing :</div>
      <div>Forwarder :</div>
      <div>Inspection Certificate :</div>
      <div>Shipping samples :</div>
      <div>Remark :</div>
      <div>Shipping Mark :</div> */}
    </div>
  );
};

export default PurchaseOrder;
