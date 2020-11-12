import React, { useContext } from 'react';
import SrMtrlContext from '../../context/srMtrl/srMtrlContext';
import MPrice from './30_01_01_mPrice';
import PropTypes from 'prop-types';
import SqBtnLarge from '../elements/btns/SqBtnLarge';
import GoBackBtnSpinSmall from '../elements/btns/GoBackBtnSpinSmall';
// import DeletePopover from '../layout/DeletePopover';
import PopoverContext from '../../context/popover/popoverContext';
import TopLabelTiny from '../elements/Label/TopLabelTiny';
import Select from '../elements/select/Select'
// import ToggleSwitch from '../elements/btns/ToggleSwitch';

const SrMtrl = ({ srMtrl, currentPath, idx }) => {
  const srMtrlContext = useContext(SrMtrlContext);
  const popoverContext = useContext(PopoverContext);
  const { addMPrice, openSrMtrl, updateItemAndUnitConvertRation } = srMtrlContext;
  const { togglePopover } = popoverContext;
  // let options = [];
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
    updateItemAndUnitConvertRation(e)
  }

  return (
    <div
      className=' p-1 round-card bg-cp-elem bd-light flexBox'
      style={{ width: '100%' }}
    >
      {/* {popover ? <DeletePopover key={current.id} /> : null} */}
      {/* {popover === true || isLoading === true ? (
        <DeletePopover key={'srMtrlPopover'} />
      ) : null} */}
      <div>
        <TopLabelTiny label={idx + 1} />
        <GoBackBtnSpinSmall onClick={goBack} />
      </div>
      <div className='ml-1 w-90' style={{ flex: '1 1 auto' }}>
        <section className='grid-3 hover-pointer' >
          <div onClick={goBack} >
            <TopLabelTiny label='Supplier' />
            <div className='fs-large' id={`supplier${srMtrl._id}`}>
              {srMtrl.supplier}
            </div>
          </div>
          <div onClick={goBack} >
            <TopLabelTiny label='Ref No.' />
            <div className='fs-large' id={`ref_no${srMtrl._id}`}>
              {srMtrl.ref_no}
            </div>
          </div>
          {currentPath === '/api/quogarment' ? (
            <div className='center-content fs-large'>
              {srMtrl.item}
            </div>
          ) : (
              <div>
                <Select
                  purpose='item'
                  id={srMtrl._id}
                  name='item'
                  onChange={onChange}
                  subject={srMtrl}
                  label='Item'
                  selectedOption={srMtrl.item}
                  className='fs-large select-primary-sub  bd-light'
                />
              </div>
            )}

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
                    // maxLength={maxWdsLength}
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
            // options={options}
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
  // mPrice: PropTypes.object.isRequired,
  srMtrl: PropTypes.object.isRequired,
  // currentPath: PropTypes.string.isRequired,
};
