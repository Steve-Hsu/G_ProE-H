import React, { useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import CasesContext from '../../context/cases/casesContext';
import PopoverContext from '../../context/popover/popoverContext';
import DeleteBtnSmall from '../elements/btns/DeleteBtnSmall';

const Size = ({ size, gQtys, purpose }) => {
  const casesContext = useContext(CasesContext);
  const popoverContext = useContext(PopoverContext);
  const { _id, cNo, osNo, sizes, updateSize, caseConfirmDate } = casesContext;
  const { togglePopover } = popoverContext;
  const event = new Event('change');
  //@ Array for generate <option> tags for s<elect> tag.
  const sizeList = [
    '4XS',
    '3XS',
    '2XS',
    'XS',
    'S',
    'M',
    'L',
    'XL',
    '2XL',
    '3XL',
    '4XL',
    '5XL',
  ];

  const lengthOfSizeList = sizeList.length;

  useEffect(() => {
    //If sizes is changed, then update the value of gSize"
    //I set this is because I want value update to gSize in state as we create a new select tag, since the user will see the value, it looks like the value is entered into the state, so I must set this way. All about UX.
    if (size.gSize === '') {
      //Select the next Size depaneds on last gSize
      if (sizes.length > 1) {
        autoSelectTagIndex(sizeList);
      }
      update();
    }
    // This command prevent useless warning
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sizes]);

  useEffect(() => {
    loadCaseSelectTagIndex();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_id]);

  //For spareting the postion of btn, here use an inline style.
  //deleteBtn in Size.
  const deleteBtnPosition = {
    // top: ' 50%',
    // left: '30%',
    // transform: 'translate(-1rem, -1rem)',
  };

  const update = () => {
    document.getElementById(size.id).addEventListener('change', onChange);
    document.getElementById(size.id).dispatchEvent(event);
    //If I don't remove the eventListner, it will cause problems when any change happens.
    document.getElementById(size.id).removeEventListener('change', onChange);
  };

  const onChange = (e) => {
    updateSize(e);
  };

  // @Select the next Size depaneds on last gSize
  const sizeLength = sizes.length;

  //@ AutoSelect next size by the previous size
  const autoSelectTagIndex = (sizeList) => {
    //Find the index of sizeList that value matched to value of previous gSize
    let previousSize = sizes[sizeLength - 2].gSize;
    if (previousSize) {
      console.log('The sizes.length', sizes.length);
      console.log('lengthOfSizeList', lengthOfSizeList);
      if (sizes.length <= lengthOfSizeList) {
        let x = sizeList.findIndex((size) => size === previousSize);
        x = x + 1;
        console.log(sizeList[x]);
        return document
          .getElementById(`${sizeList[x]}${size.id}`)
          .setAttribute('selected', 'selected');
      }
    }
  };

  //@ select the right size when new case is download
  const loadCaseSelectTagIndex = () => {
    if (caseConfirmDate || osNo || purpose === 'completeSet') {
    } else {
      document
        .getElementById(`${size.gSize}${size.id}`)
        .setAttribute('selected', 'selected');
    }

  };

  const sumNumOfSize = () => {
    let subtotal = 0;
    gQtys.map((gQty) => {
      if (gQty.size === size.id) {
        subtotal = subtotal + Number(gQty.gQty);
      }
    });
    return subtotal.toLocaleString();
  };

  return (
    <div className='bd-cp-2-b-2px pb-05'>
      {caseConfirmDate || osNo || purpose === 'completeSet' ? (<div className='bg-cp-1 fc-cp-3 bd-no fs-lead'>{size.gSize}</div>) : (
        <select
          id={size.id}
          list='garmentSize'
          placeholder='Size'
          onChange={onChange}
          autoFocus
          default='XS'
          className='select-primary bg-cp-1 fc-cp-3 bd-no fs-lead'
        >
          {sizeList.map((s) => {
            return (
              <option key={`${s}${size.id}`} id={`${s}${size.id}`} value={s}>
                {s}
              </option>
            );
          })}
        </select>
      )}

      {/* {cNo === null ? null : ( */}
      <div className='v-center-content'>
        <div className='pl-05'>
          {cNo === null || caseConfirmDate != null || osNo != null ? null : (
            <DeleteBtnSmall
              name='size'
              value={size.id}
              onClick={togglePopover}
            />
          )}
        </div>
        <div
          key={`subtotalOf${size.id}`}
          style={{ height: 'var(--btn-h-m)' }}
          className='pt-1d3 pl-07 '
        >
          {/* <div className='tiny text-primary'>{cWay.gClr}</div> */}
          <div className='fs-tiny fc-cp-2-c'>{sumNumOfSize()}</div>
        </div>
      </div>
      {/* )} */}
    </div>
  );
};

export default Size;

// PropTyeps
Size.propTypes = {
  size: PropTypes.object.isRequired,
};
