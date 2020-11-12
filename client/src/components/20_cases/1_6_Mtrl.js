import React, { Fragment, useContext } from 'react';
import PropTypes from 'prop-types';
import CasesContext from '../../context/cases/casesContext';
import PopoverContext from '../../context/popover/popoverContext';

import MtrlClr from './1_6_1_MtrlClr';
import MtrlSizeSPEC from './1_6_2_MtrlSizeSPEC';
import MtrlCspt from './1_6_3_MtrlCspt';
import DeleteBtnSmall from '../elements/btns/DeleteBtnSmall';
import GoBackBtnSpinSmall from '../elements/btns/GoBackBtnSpinSmall';
import Select from '../elements/select/Select';
import ToggleSwitch from '../elements/btns/ToggleSwitch';

const Mtrl = ({ mtrl }) => {
  const casesContext = useContext(CasesContext);
  const popoverContext = useContext(PopoverContext);

  const {
    osNo,
    cNo,
    cWays,
    sizes,
    mtrls,
    expandExtraPanels,
    addMtrlValue,
    addCaseValue,
    addMtrlValueDescription,
    caseConfirmDate,
  } = casesContext;

  const { togglePopover } = popoverContext;

  //@ Value for input
  //words length limit
  const maxWdsLength = '300';

  //For sparete the postion of btn, here use an inline style.
  //deleteBtn in mtrl.
  const deleteBtnPosition = {
    transform: 'translate(-0.2rem, -0.7rem)',
  };
  // Expand Panel class
  const expandPanelClass = 'grid-1-5 bg-cp-1 pt-1 round-card bd-light-2px';

  // const unitList = [
  //   'Select a Unit',
  //   'yds',
  //   'm',
  //   'cm',
  //   'in',
  //   'set',
  //   'print size',
  //   'pcs',
  //   'gross',
  //   'doz',
  //   'g',
  // ];

  // Ajust the color of dropdown btn when the attached table is expaneded.
  const dropDownStyle = (subject) => {
    const styleObj = {
      // color: 'white',
      // background: 'var(--primary-color)',
      transition: 'all 0.5s',
      // border: '0',
      // borderBottom: '1px solid var(--primary - color)',
      background: 'var(--cp-1_2)',
      color: 'var(--cp-1_4)',
      border: '2px solid var(--cp-1_3)',
      opacity: '1',
    };
    switch (subject) {
      case 'mtrlColor':
        if (mtrl.expandColor) {
          return styleObj;
        } else {
          return {};
        }
      case 'SizeSPEC':
        if (mtrl.expandSizeSPEC) {
          return styleObj;
        } else {
          return {};
        }
      case 'cspt':
        if (mtrl.expandCspt) {
          return styleObj;
        } else {
          return {};
        }
      default:
        return {};
    }
  };

  //@ Adjust the width of component of mColor and SizeSPEC
  const attachedTable = (subject) => {
    const columnSize = (subject) => {
      return 5;
      // switch (subject) {
      //   case 'size':
      //   case 'cspt':
      //     if (sizes.length < 6) {
      //       return 5;
      //     } else {
      //       return sizes.length;
      //     }
      //   case 'cWay':
      //     if (cWays.length < 6) {
      //       return 5;
      //     } else {
      //       return cWays.length;
      //     }
      //   default:
      //     return 5;
      // }
    };

    return {
      display: 'grid',
      gridTemplateColumns: `repeat(${columnSize(subject)}, 1fr)`,
      gridGap: '0',
    };
  };

  const item_titles = ['Item', 'Supplier', 'Ref_no', 'Position', 'Description'];

  const mtrlAttribute = (keyWord) => {
    switch (keyWord) {
      case 'Item':
        return mtrl.item;
      case 'Supplier':
        return mtrl.supplier;
      case 'Ref_no':
        return mtrl.ref_no;
      case 'Position':
        return mtrl.position;
      case 'Description':
        return mtrl.descriptions;
      default:
    }
  };

  const onChange = (e) => {
    addMtrlValue(e);
  };

  const onChange2 = (e) => {
    addMtrlValue(e);
    // const elem = document.getElementById(e.target.id);

    // elem.addEventListener('blur', (e) => {
    //   addMtrlValue(e);
    //   elem.setAttribute('value', `${mtrlAttribute('item') || ''}`);
    // });
  };

  const inputItemObj = (subject) => {
    if (subject === 'Item') {
      // //Prevent update when user enter the value for item, espacially in board mode, if don't, it will cause alot of delay
      // let placeholder = 'Item';
      // if (mtrlAttribute(subject)) {
      //   placeholder =
      //     mtrlAttribute(subject).charAt(0).toUpperCase() +
      //     mtrlAttribute(subject).slice(1);
      // }
      if (caseConfirmDate || osNo) {
        return <div className='itemSelect'>{mtrl.item}</div>;
      } else {
        return (
          <>
            {/* <div className='fs-tiny  transition'>{subject}</div> */}
            <Select
              purpose='item'
              id={`${subject}${mtrl.id}`}
              name={mtrl.id}
              onChange={onChange2}
              subject={mtrl}
              // label='Item'
              selectedOption={mtrl.item}
              className='itemSelect'
            />
            {/* <input
            type='text'
            id={`${subject}${mtrl.id}`}
            name={mtrl.id}
            placeholder={placeholder}
            onChange={onChange2}
            className='item-input'
            maxLength={maxWdsLength}
            readOnly={osNo ? true : false}
          /> */}
          </>
        );
      }
    } else if (subject === 'Description') {
      return (
        <>
          <div className='fs-tiny fc-gray-4'>Description</div>
          {mtrl.descriptions.length === 0 ? (
            <div key={`${subject}${0}${mtrl.id}`} className='mb-05'>
              <input
                type='text'
                id={0}
                name={mtrl.id}
                placeholder='.'
                onChange={addMtrlValueDescription}
                className='MPH-input'
                value={mtrlAttribute(subject)[0] || ''}
                maxLength={maxWdsLength}
                readOnly={caseConfirmDate || osNo ? true : false}
              />
            </div>
          ) : (
              mtrl.descriptions.map((des, idx) => (
                <div key={`${subject}${idx}${mtrl.id}`} className='mb-05'>
                  <input
                    type='text'
                    id={idx}
                    name={mtrl.id}
                    placeholder='.'
                    onChange={addMtrlValueDescription}
                    className='MPH-input'
                    value={mtrlAttribute(subject)[idx] || ''}
                    maxLength={maxWdsLength}
                    readOnly={caseConfirmDate || osNo ? true : false}
                  />
                </div>
              ))
            )}
        </>
      );
    } else {
      return (
        <>
          <input
            type='text'
            id={`${subject}${mtrl.id}`}
            name={mtrl.id}
            placeholder='.'
            onChange={addMtrlValue}
            className='MPH-input'
            value={mtrlAttribute(subject) || ''}
            maxLength={maxWdsLength}
            readOnly={caseConfirmDate || osNo ? true : false}
          />
          <label htmlFor={`${subject}${mtrl.id}`} className='MPH-input-label'>
            {subject}
          </label>
        </>
      );
    }
  };

  const toggleSwitchObj = (subject) => {
    return (
      <ToggleSwitch
        id={subject}
        name={mtrl.id}
        checked={mtrl[subject]}
        onChange={onChange}
        readOnlyIndicator={osNo ? osNo : caseConfirmDate}
        onLabel='On'
        offLabel='Off'
      />
    );
  };

  const onClick = (e) => {
    addCaseValue(e);
  };

  const goBack = (e) => {
    e.target.name = mtrl.id;
    e.target.id = 'isEditingMtrl';
    addMtrlValue(e);
  };

  return (
    <div
      className='mb-1 p-1 round-card bg-cp-elem bd-light flexBox'
      style={{ width: '100%' }}
      id='isEditingMtrl'
      onClick={onClick}
    >
      <GoBackBtnSpinSmall onClick={goBack} />
      <div className='ml-05 w-90' style={{ flex: '1 1 auto' }}>
        {/* Title area */}
        <div className='h-scatter-content mb-1'>
          <div key={`${item_titles[0]}${mtrl.id}`} style={{ flex: '1 1 1' }}>
            {inputItemObj(item_titles[0])}
          </div>
          <div
            onClick={goBack}
            style={{ flex: '1 1 50%', height: '3.5rem', opacity: 0 }}
          ></div>

          {/* Row_1 - Delete Btn */}
          <div>
            {cNo === null || caseConfirmDate != null || osNo != null ? null : (
              <DeleteBtnSmall
                value={mtrl.id}
                name='mtrl'
                onClick={togglePopover}
                style={deleteBtnPosition}
              />
            )}
          </div>
        </div>
        {/* Row_1  */}
        <div className='grid-6'>
          {/* Row_1 - Item */}
          <div className='flexBox'>
            <div className='ml-1'>No.{Number(mtrls.indexOf(mtrl) + 1)}</div>
          </div>

          {/* Row_1 - Supplier */}
          <div
            key={`${item_titles[1]}${mtrl.id}`}
            style={{ gridColumn: '2 / 4' }}
            className='pr-1'
          >
            {inputItemObj(item_titles[1])}
          </div>
          {/* Row_1 - Ref_no */}
          <div
            key={`${item_titles[2]}${mtrl.id}`}
            style={{ gridColumn: '4 / 7' }}
          >
            {inputItemObj(item_titles[2])}
          </div>
        </div>

        {/* Row_2  */}
        <div className='grid-6'>
          {/* Row_2 - Icon Space */}
          <></>
          {/* Row_2 - Position */}
          <div
            key={`${item_titles[3]}${mtrl.id}`}
            style={{ gridColumn: '2 / 7' }}
          >
            {inputItemObj(item_titles[3])}
          </div>
        </div>

        {/* Row_3  */}
        <div className='grid-6'>
          {/* Row_3 - Icon Space */}
          <div></div>
          {/* Row_3 - Description */}
          <div
            key={`${item_titles[4]}${mtrl.id}`}
            style={{ gridColumn: '2 / 7' }}
          >
            {inputItemObj(item_titles[4])}
          </div>
        </div>

        {/* Row_4  */}
        <div className='grid-6 mt-1'>
          {/* Row_4 - Icon Space */}
          <div></div>
          <div className='mr-1'>
            <div className='fs-tiny transition fc-gray-4'>
              {mtrl.multipleColor === true ? 'Multiple' : 'Single'}
            </div>
            <button
              value={mtrl.id}
              name='mtrlColor'
              onClick={expandExtraPanels}
              className='btn btn-dropdown fs-lead'
              style={dropDownStyle('mtrlColor')}
            >
              Color
            </button>
          </div>
          <div className='mr-1'>
            <div className='fs-tiny  transition fc-gray-4'>
              {mtrl.multipleSPEC === true ? 'Multiple' : 'Single'}
            </div>
            <button
              value={mtrl.id}
              name='SizeSPEC'
              onClick={expandExtraPanels}
              className='btn btn-dropdown fs-lead'
              style={dropDownStyle('SizeSPEC')}
            >
              SPEC
            </button>
          </div>
          <div className='mr-1'>
            <div className='fs-tiny  transition fc-gray-4'>
              {mtrl.multipleCSPT === true ? 'Multiple' : 'Single'}
            </div>
            <button
              value={mtrl.id}
              name='cspt'
              onClick={expandExtraPanels}
              className='btn btn-dropdown fs-lead '
              style={dropDownStyle('cspt')}
            >
              Consumption
            </button>
          </div>
          {/* Row_4 - Unit Selector */}
          {caseConfirmDate || osNo || mtrl.item === 'Thread' ? (
            <div>
              <div className='fs-tiny  transition fc-gray-4'>Unit</div>
              <div className='h-3rem w-100 round-area bd-light fs-lead center-content'>
                {mtrl.unit}
              </div>
            </div>
          ) : (
              <Select
                purpose='caseUnit'
                subject={mtrl}
                onChange={addMtrlValue}
                required={true}
                label='Unit'
                className='select-primary-sub  bd-light'
                selectedOption={mtrl.unit}
              />
            )}
        </div>
        {/* {Row_5} */}
        {/* Color expand panel  */}
        {mtrl.expandColor && cWays.length > 0 ? (
          <div className={expandPanelClass}>
            {/* The toggle switch for material Color */}
            <div
              style={{ height: '100%', display: 'grid', placeItems: 'center' }}
            >
              {caseConfirmDate || osNo ? null : toggleSwitchObj('multipleColor')}
            </div>
            <div style={attachedTable('cWay')} className='mt-1'>
              {mtrl.multipleColor === true ? (
                mtrl.mtrlColors.map((mtrlColor) => (
                  <MtrlClr
                    key={mtrlColor.id}
                    mtrlColor={mtrlColor}
                    mtrlId={mtrl.id}
                  />
                ))
              ) : (
                  <MtrlClr
                    key={mtrl.mtrlColors[0].id}
                    mtrlColor={mtrl.mtrlColors[0]}
                    mtrlId={mtrl.id}
                  />
                )}
            </div>
          </div>
        ) : null}
        {/* SizeSPEC expand panel  */}
        {mtrl.expandSizeSPEC && sizes.length > 0 ? (
          <div className={expandPanelClass}>
            {/* The toggle switch for material SPEC */}
            <div
              style={{ height: '100%', display: 'grid', placeItems: 'center' }}
            >
              {caseConfirmDate || osNo ? null : toggleSwitchObj('multipleSPEC')}
            </div>
            <div style={attachedTable('size')} className='mt-1'>
              {mtrl.multipleSPEC === true ? (
                mtrl.sizeSPECs.map((sizeSPEC) => (
                  <MtrlSizeSPEC
                    key={sizeSPEC.id}
                    sizeSPEC={sizeSPEC}
                    mtrlId={mtrl.id}
                  />
                ))
              ) : (
                  <MtrlSizeSPEC
                    key={mtrl.sizeSPECs[0].id}
                    sizeSPEC={mtrl.sizeSPECs[0]}
                    mtrlId={mtrl.id}
                  />
                )}
            </div>
          </div>
        ) : null}
        {/* cspt expand panel  */}
        {mtrl.expandCspt && mtrl.cspts.length > 0 ? (
          <div className={expandPanelClass}>
            {/* The toggle switch for material SPEC */}
            <div
              style={{ height: '100%', display: 'grid', placeItems: 'center' }}
            >
              {caseConfirmDate || osNo ? null : toggleSwitchObj('multipleCSPT')}
            </div>
            <div style={attachedTable('cspt')} className='mt-1'>
              {mtrl.multipleCSPT === true ? (
                sizes.map((size) => (
                  <MtrlCspt
                    key={`Fragment${size.id}${mtrl.id}`}
                    size={size}
                    mtrl={mtrl}
                  />
                ))
              ) : (
                  <MtrlCspt
                    key={`Fragment${sizes[0].id}${mtrl.id}`}
                    size={sizes[0]}
                    mtrl={mtrl}
                  />
                )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Mtrl;

// PropTyeps
Mtrl.propTypes = {
  mtrl: PropTypes.object.isRequired,
};
