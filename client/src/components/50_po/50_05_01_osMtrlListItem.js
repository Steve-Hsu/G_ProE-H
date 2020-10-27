import React, { useContext } from 'react';
import PurContext from '../../context/pur/purContext';
import SqBtnLarge from '../elements/btns/SqBtnLarge';

const OsMtrlListItem = ({ osMtrl, theNumber, className }) => {
  const purContext = useContext(PurContext);
  const { enterHsCode } = purContext;

  const {
    _id,
    supplier,
    ref_no,
    mColor,
    mSizeSPEC,
    purchaseQtySumUp,
    purchaseLossQtySumUp,
    purchaseMoqQty,
    price,
    hsCode,
  } = osMtrl;

  const unit = price ? price.poUnit : 'unConfirmed';

  const onChange = (e) => {
    enterHsCode(e);
  };

  return (
    <div
      className={`grid-OsMtrl m-0 p-0 bd-light bd-light-t-05 bd-light-b-05 fs-small ${className}`}
    >
      <div className='bd-light bd-no-t v-center-content px-05 py-03 '>
        {theNumber}
      </div>
      <div className='bd-light bd-no-t v-center-content px-05 py-03'>
        {supplier}
      </div>
      <div className='bd-light bd-no-t v-center-content px-05 py-03'>
        {ref_no}
      </div>
      <div className='bd-light bd-no-t v-center-content'>
        <input
          type='text'
          id={`hsCode${_id}`}
          name='hsCodeInput'
          maxLength='50'
          value={hsCode || ''}
          onChange={onChange}
          className='bd-no whenPrintFSSmall'
        />
      </div>
      <div className='bd-light bd-no-t v-center-content px-05 py-03'>
        {mColor}
      </div>
      <div className='bd-light bd-no-t v-center-content px-05 py-03'>
        {mSizeSPEC}
      </div>
      <div className='bd-light bd-no-t v-center-content px-05 py-03'>
        {unit}
      </div>

      <div className='bd-light bd-no-t v-center-content px-05 py-03'>
        {purchaseQtySumUp}
      </div>
      <div className='bd-light bd-no-t v-center-content px-05 py-03'>
        {purchaseLossQtySumUp}
      </div>
      <div className='bd-light bd-no-t v-center-content px-05 py-03'>
        {purchaseQtySumUp + purchaseLossQtySumUp}
      </div>
    </div>
  );
};

export default OsMtrlListItem;
