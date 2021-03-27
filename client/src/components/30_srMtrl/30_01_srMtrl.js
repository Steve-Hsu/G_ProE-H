import React, { useContext } from 'react';
import SrMtrlContext from '../../context/srMtrl/srMtrlContext';
import MPrice from './30_01_01_mPrice';
import PropTypes from 'prop-types';
import SqBtnLarge from '../elements/btns/SqBtnLarge';
import GoBackBtnSpinSmall from '../elements/btns/GoBackBtnSpinSmall';
import PopoverContext from '../../context/popover/popoverContext';
import TopLabelTiny from '../elements/Label/TopLabelTiny';
import Select from '../elements/select/Select'

const SrMtrl = ({ srMtrl, currentPath, idx }) => {
  const srMtrlContext = useContext(SrMtrlContext);
  const popoverContext = useContext(PopoverContext);
  const { addMPrice, openSrMtrl, updateUnitCurrencyAndUnitConvertRation } = srMtrlContext;
  const { togglePopover } = popoverContext;
  const onClick = (e) => {
    e.preventDefault();
    addMPrice(srMtrl._id);
  };

  const goBack = () => {
    openSrMtrl(srMtrl._id);
  };

  const mPricelengthLimit = () => {
    const mtrlColorsLength = Number(srMtrl.mtrlColors.length);
    const sizeSPECsLength = Number(srMtrl.sizeSPECs.length);
    const mPricesLength = Number(srMtrl.mPrices.length);
    const limit = mtrlColorsLength * sizeSPECsLength;
    if (mPricesLength < limit) {
      return true;
    } else {
      return false;
    }
  };

  const onChange = (e) => {
    e.preventDefault();
    updateUnitCurrencyAndUnitConvertRation(e);
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
      <div className='ml-1 w-90' style={{ flex: '1 1 auto' }}>
        <section className='grid-3 hover-pointer' onClick={goBack} >
          <div>
            <TopLabelTiny label='Supplier' />
            <div className='fs-large' id={`supplier${srMtrl._id}`}>
              {srMtrl.supplier}
            </div>
          </div>
          <div>
            <TopLabelTiny label='Ref No.' />
            <div className='fs-large' id={`ref_no${srMtrl._id}`}>
              {srMtrl.ref_no}
            </div>
          </div>
          <div>
            <TopLabelTiny label='Item' />
            <div className='fs-large'>
              {srMtrl.item}
            </div>
          </div>

        </section>
        <section className='grid-3 mb-05'>
          <div className='mr-1'>
            {currentPath === '/api/case/mprice' && mPricelengthLimit() ? (
              <SqBtnLarge
                name='mPriceBtn'
                onClick={onClick}
                label={<i className='fas fa-money-check-alt'> Price ＋</i>}
              />
            ) : currentPath === '/api/case/mprice' ? (
              <div className='sq-block bd-radius-s bg-cp-2-light-c center-content w-20vw'>
                All color and SPEC are listed
              </div>
            ) : null}
          </div>
          <div className='mr-1'>
            {currentPath === '/api/case/mprice' ? (
              <div>
                <TopLabelTiny label='Currency' />
                <Select
                  subject={srMtrl}
                  id={srMtrl._id}
                  purpose='currency'
                  name='currency'
                  selectedOption={srMtrl.currency}
                  onChange={onChange} />
              </div>
            ) : (
              <div>
                <TopLabelTiny label='Currency' />
                <div className='fs-large'>
                  {srMtrl.currency}
                </div>
              </div>
            )}
          </div>
          <div className='mr-1'>
            {currentPath === '/api/case/mprice' ? (
              <div>
                <TopLabelTiny label='Purcase Unit' />
                <Select
                  subject={srMtrl}
                  id={srMtrl._id}
                  purpose='unit'
                  name='purchaseUnit'
                  selectedOption={srMtrl.purchaseUnit}
                  onChange={onChange} />
              </div>
            ) : (
              <div>
                <TopLabelTiny label='Purchase Unit' />
                <div className='fs-large'>
                  {srMtrl.purchaseUnit}
                </div>
              </div>
            )}
          </div>
          <div>

          </div>
          {srMtrl.item === 'Thread' ?
            currentPath === '/api/quogarment' ? (
              <div>
                {srMtrl.unitConvertRatio} <span className='ml-05'>m = 1 pcs</span>
              </div>
            ) : (
              <div key={`unitConvertRatio${srMtrl.id}`} className='flexBox'>
                <div className='center-content mr-05'>
                  <input
                    type='number'
                    id={srMtrl._id}
                    name='unitConvertRatio'
                    placeholder='.'
                    onChange={onChange}
                    className='MPH-input'
                    value={srMtrl.unitConvertRatio || ''}
                    style={{ height: 'var(--btn-h-m)' }}
                  />
                </div>
                <div className='center-content'>
                  m = 1 pcs
              </div>
              </div>
            ) : null}
        </section>

        {/* mPrice container */}
        <div>
          {srMtrl.mPrices.map((mPrice, idx) => (
            <MPrice
              key={mPrice.id}
              mPrice={mPrice}
              srMtrl={srMtrl}
              togglePopover={togglePopover}
              idx={idx}
              mainPrice={srMtrl.mainPrice}
              currentPath={currentPath}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SrMtrl;

// PropTyeps
SrMtrl.propTypes = {
  srMtrl: PropTypes.object.isRequired,
};
