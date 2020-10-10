import React, { useContext } from 'react';
import SrMtrlContext from '../../context/srMtrl/srMtrlContext';
import MPrice from './30_01_01_mPrice';
import PropTypes from 'prop-types';
import SqBtnLarge from '../elements/btns/SqBtnLarge';
import GoBackBtnSpinSmall from '../elements/btns/GoBackBtnSpinSmall';
import DeletePopover from '../layout/DeletePopover';
import PopoverContext from '../../context/popover/popoverContext';
import TopLabelTiny from '../elements/Label/TopLabelTiny';
// import ToggleSwitch from '../elements/btns/ToggleSwitch';

const SrMtrl = ({ srMtrl, currentPath }) => {
  const srMtrlContext = useContext(SrMtrlContext);
  const popoverContext = useContext(PopoverContext);
  const { addMPrice, openSrMtrl } = srMtrlContext;
  const { popover, isLoading, togglePopover } = popoverContext;
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

  return (
    <div
      className=' p-1 round-card bg-cp-elem bd-light flexBox'
      style={{ width: '100%' }}
    >
      {/* {popover ? <DeletePopover key={current.id} /> : null} */}
      {popover === true || isLoading === true ? (
        <DeletePopover key={'srMtrlPopover'} />
      ) : null}
      <GoBackBtnSpinSmall onClick={goBack} />
      <div className='ml-1 w-90' style={{ flex: '1 1 auto' }}>
        <div className='grid-2'>
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
        </div>
        <div className='flexBox mb-05'>
          <div>
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
        </div>

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
