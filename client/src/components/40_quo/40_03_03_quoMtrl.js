import React, { useContext } from 'react';
import QuoContext from '../../context/quo/quoContext';

const QuoMtrl = ({ mtrl, className }) => {
  const quoContext = useContext(QuoContext);

  const {
    isQuotating,
    switchQuoFormSelector,
    currentQuoForm,
    updateCurrentQuoForm,
  } = quoContext;
  const {
    _id,
    quoNo,
    quoSizes,
    quocWays,
    currency,
    cmpts,
    mQuos,
    otherExpenses,
    fob,
  } = currentQuoForm;

  const mQuo = mQuos.find(({ mtrlId }) => mtrlId === mtrl.id);

  // let mQuoAddvised,
  //   csptAddvised,
  //   materialFinalQuotation = null;
  // if (mQuo) {
  const mQuoAddvised = mQuo ? mQuo.mQuoAddvised : 0;
  const csptAddvised = mQuo ? mQuo.csptAddvised : 0;
  const materialFinalQuotation = mQuo ? mQuo.materialFinalQuotation : 0;
  // const { mQuoAddvised, csptAddvised, materialFinalQuotation } = mQuo;

  const addNumber = (e) => {
    e.preventDefault();
    const num = e.target.value;
    let Max = 0;
    switch (e.target.name) {
      case 'cspt':
        Max = 9999;
        break;
      case 'unitprice':
        Max = 9999999;
        break;
      default:
    }

    if (String(num).length > String(Max).length) {
      e.target.value = Max;
      updateCurrentQuoForm(e);
    } else {
      updateCurrentQuoForm(e);
    }
  };

  return (
    <div className={`grid-Quo-Mtrl m-0 p-0 bd-light bd-no-t ${className}`}>
      <div className='bd-light bd-no-t v-center-content px-05'>{mtrl.item}</div>
      <div className='bd-light bd-no-t v-center-content px-05'>
        {mtrl.supplier} / {mtrl.ref_no} / {mtrl.sizeSPECs[0].mSizeSPEC} /{' '}
        {mtrl.position}
      </div>

      <div className='bd-light bd-no-t v-center-content'>
        {' '}
        <input
          type='number'
          id={`cspt${mtrl.id}`}
          name='cspt'
          step='.01'
          value={csptAddvised || ''}
          onChange={addNumber}
          className='noPrint bd-no mr-05'
        />
        <div className='noPrint mr-05'>{mtrl.unit}</div>
        <div className='showWhenPrint m-05'>
          {csptAddvised} {mtrl.unit}
        </div>
      </div>

      {/* <div className='bd-light bd-no-t v-center-content p-05'>{mtrl.unit}</div> */}
      <div className='bd-light bd-no-t v-center-content '>
        <input
          type='number'
          id={`unitprice${mtrl.id}`}
          name='unitprice'
          step='.01'
          value={mQuoAddvised || ''}
          onChange={addNumber}
          className='noPrint bd-no'
        />
        {/* <div className='noPrint mr-05'>{currency}</div> */}
        <div className='showWhenPrint m-05'>{mQuoAddvised}</div>
      </div>
      {/* <div className='bd-light bd-no-t v-center-content p-05'>{currency}</div> */}
      <div className='bd-light bd-no-t v-center-content px-05'>
        {materialFinalQuotation}
      </div>
    </div>
  );
};

export default QuoMtrl;
