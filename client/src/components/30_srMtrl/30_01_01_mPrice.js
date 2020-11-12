import React, { useContext } from 'react';
import SrMtrlContext from '../../context/srMtrl/srMtrlContext';
import PropTypes from 'prop-types';
import Select from '../elements/select/Select';
import DeleteBtnSmall from '../elements/btns/DeleteBtnSmall';
import TopLabelTiny from '../elements/Label/TopLabelTiny';

const MPrice = ({
  mPrice,
  srMtrl,
  currentPath,
  togglePopover,
  idx,
  mainPrice,
}) => {
  const srMtrlContext = useContext(SrMtrlContext);
  const { addSrMtrlValue, toggleMainPrice } = srMtrlContext;

  //@
  const srMtrlId = srMtrl._id;

  const mPriceList = () => {
    let arr = [
      'mColor',
      'sizeSPEC',
      'unit',
      'moq',
      'currency',
      'moqPrice',
      'mPrice',
    ];
    if (currentPath === '/api/quogarment') {
      arr.push('quotation');
    }
    return arr;
  };

  //@ Funcs
  const labels = (x) => {
    switch (x) {
      case 'mColor':
        return 'Color';
      case 'sizeSPEC':
        return 'SPEC';
      case 'unit':
        return 'Unit';
      case 'currency':
        return 'Currency';
      case 'moq':
        return 'MOQ';
      case 'moqPrice':
        return 'MOQ_Price';
      case 'mPrice':
        return 'Unit Price';
      case 'quotation':
        return 'Selling Price';
    }
  };

  const onClick = (e) => {
    const subId = mPrice.id;
    togglePopover(e, subId);
  };

  const onChange = (e) => {
    e.preventDefault();
    const list = mPriceList();
    addSrMtrlValue(e, srMtrlId, list);
  };

  const addNumber = (e) => {
    e.preventDefault();
    const num = e.target.value;
    const list = mPriceList();
    const Max = 9999;
    if (String(num).length > String(Max).length) {
      e.target.value = Max;
      addSrMtrlValue(e, srMtrlId, list);
    } else {
      addSrMtrlValue(e, srMtrlId, list);
    }
  };

  const selectList = (x) => {
    let arr = [];
    switch (x) {
      case 'mColor':
        srMtrl.mtrlColors.map((mtrlColor) => arr.push(mtrlColor.mColor));
        srMtrl.mPrices.map((mP) => {
          if (mPrice.sizeSPEC === mP.sizeSPEC) {
            let idx = arr.indexOf(mP.mColor);
            arr.splice(idx, 1);
          }
        });
        arr.push(mPrice.mColor);
        break;
      case 'sizeSPEC':
        srMtrl.sizeSPECs.map((sizeSPEC) => arr.push(sizeSPEC.mSizeSPEC));
        srMtrl.mPrices.map((mP) => {
          if (mPrice.mColor === mP.mColor) {
            let idx = arr.indexOf(mP.sizeSPEC);
            arr.splice(idx, 1);
          }
        });
        arr.push(mPrice.sizeSPEC);
        break;
      default:
    }
    // console.log('the selectList in mPrice', arr);
    return arr;
  };

  // update the select when donwload
  // const loadSelectUnitTagIndex = () => {
  //   // if (currentPath !== '/api/quogarment') {
  //   const mColorOption = document.getElementById(
  //     `${mPrice.mColor}${mPrice.id}`
  //   );

  //   const sizeSPECOption = document.getElementById(
  //     `${mPrice.sizeSPEC}${mPrice.id}`
  //   );

  //   mColorOption.removeAttribute('selected');
  //   mColorOption.setAttribute('selected', 'selected');

  //   sizeSPECOption.removeAttribute('selected');
  //   sizeSPECOption.setAttribute('selected', 'selected');

  //   console.log('the mColorOption', mColorOption);
  //   console.log('the sizeSPECOption', sizeSPECOption);
  //   // }
  // };

  //@ Style
  const deleteBtnPosition = {
    transform: 'translate(0.3rem, -0.9rem)',
  };

  const onClick2 = () => {
    if (currentPath === '/api/case/mprice') {
      toggleMainPrice(srMtrlId, mPrice.id);
    }
  };

  const headNumStyle = (currentPath) => {
    if (currentPath === '/api/case/mprice') {
      return 'fs-lead cursor';
    } else {
      return 'fs-lead';
    }
  };

  const gridStyle = (currentPath) => {
    if (currentPath === '/api/quogarment') {
      return 'grid-mPrice-quo mb-0';
    } else {
      return 'grid-mPrice mb-0';
    }
  };

  return (
    <div className='card bg-cp-1 bd-radius-s bd-light pb-05 hover-cp-2-light'>
      <div className={gridStyle(currentPath)}>
        <div className={headNumStyle(currentPath)} onClick={onClick2}>
          <div
            className='pr-05'
            style={{ transform: 'translate(-0.3rem, -0.5rem)' }}
          >
            {' '}
            {mainPrice === mPrice.id ? (
              <i className='fas fa-magnet'></i>
            ) : (
                <div>{idx + 1}</div>
              )}
          </div>
        </div>
        {mPriceList().map((m) => {
          if (currentPath === '/api/quogarment') {
            switch (m) {
              case 'quotation':
                return (
                  <div key={`${m}${mPrice.id}`}>
                    <TopLabelTiny label={labels(m)} />
                    <div key={`${m}${mPrice.id}`}>
                      <input
                        type='number'
                        id={`${m}${mPrice.id}`}
                        name={mPrice.id}
                        onChange={addNumber}
                        value={mPrice[`${m}`] || ''}
                      />
                    </div>
                  </div>
                );
              default:
                return (
                  <div key={`${m}${mPrice.id}`}>
                    <TopLabelTiny label={labels(m)} />
                    <div
                      className='v-center-content pr-05 pt-04'
                    // style={{ height: '2.2rem' }}
                    >
                      {mPrice[`${m}`]}
                    </div>
                  </div>
                );
            }
          } else {
            switch (m) {
              case 'mColor':
              case 'sizeSPEC':
                return (
                  <div key={`div${m}${mPrice.id}`} className='ml-05'>
                    <TopLabelTiny label={labels(m)} />
                    <Select
                      purpose={m}
                      key={`${m}${mPrice.id}`}
                      id={`${m}${mPrice.id}`}
                      subject={mPrice}
                      optionList={selectList(m)}
                      onChange={onChange}
                      selectedOption={mPrice[m]}
                    />
                  </div>
                );

              case 'currency':
                return (
                  <div key={`div${m}${mPrice.id}`} className='ml-05'>
                    <TopLabelTiny label={labels(m)} />
                    <Select
                      key={`${m}${mPrice.id}`}
                      id={`${m}${mPrice.id}`}
                      purpose={m}
                      subject={mPrice}
                      onChange={onChange}
                      required={true}
                      selectedOption={mPrice[m]}
                    />
                  </div>
                );
              case 'unit':
                if (srMtrl.item === 'Thread') {
                  return (
                    <div key={`div${m}${mPrice.id}`} className='ml-05' >
                      <TopLabelTiny label={labels(m)} />
                      <div className='content-center pl-06 pt-03' style={{ height: '2.2rem' }}>{mPrice[m]}</div>
                    </div>
                  )
                } else {
                  return (
                    <div key={`div${m}${mPrice.id}`
                    } className='ml-05' >
                      <TopLabelTiny label={labels(m)} />
                      <Select
                        key={`${m}${mPrice.id}`}
                        id={`${m}${mPrice.id}`}
                        purpose={m}
                        subject={mPrice}
                        onChange={onChange}
                        required={true}
                        selectedOption={mPrice[m]}
                      />
                    </div>)
                }

              default:
                return (
                  <div
                    key={`div${m}${mPrice.id}`}
                    className='ml-05'
                    style={{ height: '68px' }}
                  >
                    <TopLabelTiny label={labels(m)} />
                    <div key={`${m}${mPrice.id}`}>
                      <input
                        type='number'
                        id={`${m}${mPrice.id}`}
                        name={mPrice.id}
                        onChange={addNumber}
                        value={mPrice[`${m}`] || ''}
                      />
                    </div>
                  </div>
                );
            }
          }
        })}
        {currentPath === '/api/case/mprice' ? (
          <div className='ml-05'>
            <DeleteBtnSmall
              key={mPrice.id}
              onClick={onClick}
              name='deleteMPrice'
              value={srMtrlId}
              style={deleteBtnPosition}
            />
          </div>
        ) : null}
      </div>
      {/* </div> */}
    </div>
  );
};
export default MPrice;

// PropTyeps
MPrice.propTypes = {
  mPrice: PropTypes.object.isRequired,
  srMtrl: PropTypes.object.isRequired,
};
