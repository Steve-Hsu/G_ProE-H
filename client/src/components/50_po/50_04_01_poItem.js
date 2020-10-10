import React, { useContext } from 'react';
import PurContext from '../../context/pur/purContext';
import SqBtnLarge from '../elements/btns/SqBtnLarge';

const PoItem = ({ osMtrl, theNumber }) => {
  const purContext = useContext(PurContext);
  const { currentPoPriceList, currentPo, evenMoq } = purContext;

  const {
    id,
    // supplier,
    ref_no,
    mColor,
    mSizeSPEC,
    purchaseQtySumUp,
    purchaseLossQtySumUp,
    purchaseMoqQty,
  } = osMtrl;
  const currentMtrlPrice = currentPoPriceList.find(
    ({ osMtrlId }) => osMtrlId === osMtrl.id
  );

  // The loading may later than the mount of the component, so here set the default value for these variables to ref
  let unit = '';
  let currency = '';
  let mPrice = 0;
  let moq = 0;
  let moqPrice = 0;

  if (osMtrl.price && currentPo.poConfirmDate) {
    unit = osMtrl.price.poUnit;
    currency = osMtrl.price.currency;
    mPrice = osMtrl.price.mPrice;
    moq = osMtrl.price.moq;
    moqPrice = osMtrl.price.moqPrice;
    // }
  } else {
    if (currentMtrlPrice) {
      unit = currentMtrlPrice.poUnit;
      currency = currentMtrlPrice.currency;
      mPrice = currentMtrlPrice.mPrice;
      moq = currentMtrlPrice.moq;
      moqPrice = currentMtrlPrice.moqPrice;
    }
  }

  const displayPrice = () => {
    if (moq) {
      if (purchaseQtySumUp + purchaseLossQtySumUp + purchaseMoqQty > moq) {
        // return Number(mPrice).toFixed(2);
        return mPrice;
      } else {
        // return Number(moqPrice).toFixed(2);
        return moqPrice;
      }
    } else {
      // return Number(mPrice).toFixed(2);
      return mPrice;
    }
  };

  const moqLabel = () => {
    if (moq) {
      if (purchaseQtySumUp + purchaseLossQtySumUp + purchaseMoqQty > moq) {
        return null;
      } else {
        return <div className='fs-tiny fc-success'>MOQ Price</div>;
      }
    } else {
      return null;
    }
  };

  const onClick = () => {
    evenMoq(moq, purchaseQtySumUp + purchaseLossQtySumUp, purchaseMoqQty, id);
  };

  const amount =
    Math.round(
      (Number(
        (purchaseQtySumUp + purchaseLossQtySumUp + purchaseMoqQty) *
          displayPrice()
      ) +
        Number.EPSILON) *
        100
    ) / 100;

  return (
    <div className='grid-Pur-Mtrl m-0 p-0 bd-light bd-light-t-05 bd-light-b-05  noBreak whenPrintFSSmall'>
      <div className='bd-light bd-no-t v-center-content px-05 py-03'>
        {theNumber}
      </div>
      <div className='bd-light bd-no-t v-center-content px-05 py-03'>
        {ref_no}
      </div>
      <div className='bd-light bd-no-t v-center-content px-05 py-03'>
        {mColor}
      </div>
      <div className='bd-light bd-no-t v-center-content px-05 py-03'>
        {mSizeSPEC}
      </div>
      <div className='bd-light bd-no-t v-center-content px-05 py-03'>
        <div>
          <div className='v-center-content'>{moqLabel()}</div>
          <div className='v-center-content'>
            {displayPrice()} {currency}/{unit}
          </div>
        </div>
      </div>
      <div className='bd-light bd-no-t px-05 py-03 h-scatter-content'>
        <div className='v-center-content'>
          <div
            className='mr-05 round-area noPrint'
            style={{
              marginLeft: '-0.5rem',
              marginTop: '-0.5rem',
              marginBottom: '-0.5rem',
            }}
          >
            <div className='h-scatter-content noPrint'>
              <div className='fs-tiny fc-cp-2-c mr-1'>
                <div>Qty</div>
                <div>{purchaseQtySumUp}</div>
              </div>
              <div className='fs-tiny fc-cp-2-c'>
                <div>Loss</div>
                <div>{purchaseLossQtySumUp}</div>
              </div>
            </div>
            <div
              className='v-center-content'
              style={{ height: 'var(--btn-h-m)' }}
            >
              {purchaseQtySumUp + purchaseLossQtySumUp + purchaseMoqQty}
            </div>
          </div>
          <div className='showWhenPrint'>
            {purchaseQtySumUp + purchaseLossQtySumUp + purchaseMoqQty}
          </div>
        </div>
        {moq && purchaseQtySumUp + purchaseLossQtySumUp < moq ? (
          <div
            className='noPrint round-area '
            style={{
              marginTop: '-0.5rem',
              marginBottom: '-0.5rem',
              marginRight: '-0.5rem',
            }}
          >
            <div className='fs-tiny fc-success'>
              <div>Even Moq</div>
              <div>{purchaseMoqQty} </div>
            </div>

            {moq && currentPo.poConfirmDate === null ? (
              purchaseQtySumUp + purchaseLossQtySumUp > moq ? null : (
                <div className='noPrint'>
                  <SqBtnLarge
                    label={purchaseMoqQty === 0 ? 'Even' : 'Cancel Even'}
                    onClick={onClick}
                    className='fs-small'
                  />
                </div>
              )
            ) : null}
          </div>
        ) : null}

        {/* <div className='w-100'>
          <div className='fs-tiny fc-cp-2-c v-center-content noPrint'>
            <div className='mr-2'>
              <div>Required</div>
              <div>{purchaseQtySumUp}</div>
            </div>
            <div className='mr-2'>
              <div>Loss</div>
              <div>{purchaseLossQtySumUp}</div>
            </div>

            {moq && purchaseQtySumUp + purchaseLossQtySumUp < moq ? (
              <div className=''>
                <div>Even Moq</div>
                <div>{purchaseMoqQty} </div>
              </div>
            ) : null}
          </div>

          <div className='h-scatter-content '>
            <div className='v-center-content'>
              {purchaseQtySumUp + purchaseLossQtySumUp + purchaseMoqQty}
            </div>
            {moq && currentPo.poConfirmDate === null ? (
              purchaseQtySumUp + purchaseLossQtySumUp > moq ? null : (
                <div className='noPrint'>
                  <SqBtnLarge
                    label={purchaseMoqQty === 0 ? 'Even MOQ' : 'Cancel MOQ'}
                    onClick={onClick}
                  />
                </div>
              )
            ) : null}
          </div>
        </div> */}
      </div>
      <div className='bd-light bd-no-t v-center-content px-05 py-03'>
        {amount ? amount : null}
      </div>
    </div>
  );
};

export default PoItem;
