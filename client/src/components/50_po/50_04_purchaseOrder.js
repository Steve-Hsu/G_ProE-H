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
    currentPo,
    getMaterialPrice,
    updatePOInform,
    uploadPO,
    getPOTotal,
  } = purContext;
  const popoverContext = useContext(PopoverContext);
  const { _id, osNo, caseMtrls } = currentOrderSummary;
  const { isLoading, toggleLoading } = popoverContext;

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

  return (
    <div className=''>
      {/* {isLoading === true ? <DeletePopover key='PurchaseOrderPopover' /> : null} */}
      {/* {currentPoPriceList === [] ? null : (
        <div> */}
      <NoAndDateHeader No={osNo} />
      <FormTitle title='Purchase Order' />
      {/* <div>
        <h1>
          {comName} {comNameTail}
        </h1>
      </div>
      <div>{comAddress}</div>
      <div>{comPhone}</div>
      <br /> */}
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
        {caseMtrls.map((osMtrl) => {
          if (osMtrl.supplier == currentPo.supplier) {
            theNumber = theNumber + 1;
            // console.log(mtrl.supplier);
            return (
              <PoItem key={osMtrl._id} osMtrl={osMtrl} theNumber={theNumber} />
            );
          } else {
            return null;
          }
        })}
        <div className='mt-05 h-scatter-content'>
          <div></div>
          <div>{`Total : `}</div>
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
