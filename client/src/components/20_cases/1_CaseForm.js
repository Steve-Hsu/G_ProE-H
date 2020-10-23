import React, { useContext, Fragment, useEffect } from 'react';
// import { Prompt } from 'react-router-dom';
import CasesContext from '../../context/cases/casesContext';
import AuthUserContext from '../../context/authUser/authUserContext';
import SrMtrlContext from '../../context/srMtrl/srMtrlContext';
import PopoverContext from '../../context/popover/popoverContext';

// @ Components
import ColorWay from './1_1_ColorWay';
import Size from './1_2_Size';
import Qty from './1_3_Qty';
import DeletePopover from '../layout/DeletePopover';
import SqBtnLarge from '../elements/btns/SqBtnLarge';
import Board from '../elements/board/Board';
import Table from '../elements/table/Table';
import ItemSelector from '../itemSelector/ItemSelector';
import GoBackBtn from '../elements/btns/GoBackBtn';
import SqToggleSwitchL from '../elements/btns/SqToggleSwitchL';
import DeleteBtnSmall from '../elements/btns/DeleteBtnSmall';
import LockedBadge from '../elements/badge/LockedBadge';

const CaseForm = ({ props }) => {
  //@ Init Context
  const casesContext = useContext(CasesContext);
  const authUserContext = useContext(AuthUserContext);
  const srMtrlContext = useContext(SrMtrlContext);
  const popoverContext = useContext(PopoverContext);

  //@ Destructure, pull out the variables form userContext
  const {
    _id, // this id will appear after download an valid case
    cNo,
    caseType,
    style,
    client,
    cWays,
    sizes,
    gQtys,
    mtrls,
    isImportedExcel,
    addCaseValue,
    uploadCase,
    error,
    isEditingCase,
    isBoardMode,
    displayTitles,
    addSize,
    addcWay,
    addMtrl,
    addMtrlValue,
    poDate,
    osNo,
    merchandiser,
    lastUpdateBy,
    updateDate,
    caseError,
    caseConfirmDate,
  } = casesContext;
  const { comName, comSymbol } = authUserContext;
  const { updateSrMtrlByMtrl } = srMtrlContext;
  const {
    popover,
    isLoading,
    togglePopover,
    toggleLoading,
  } = popoverContext;

  //@ Make a body to submit
  const cases = {
    cNo: cNo,
    caseType: caseType,
    style: style,
    client: client,
    cWays: cWays,
    sizes: sizes,
    gQtys: gQtys,
    mtrls: mtrls,
    isImportedExcel: isImportedExcel,
    caseConfirmDate: caseConfirmDate,
  };

  //@ Case Types, the type has nothing to do with code's "type"
  const caseTypeList = ['', 'Test Sample', 'Salesman Sample', 'Bulk'];

  //@ Value for input
  //words length limit
  const maxWdsLength = '50';
  const styleLength = maxWdsLength;
  const clientLength = maxWdsLength;

  useEffect(() => {
    if (caseType === '') {
    } else {
      loadCaseSelectCaseTypeTagIndex(caseType);
    }
    if (osNo) {
      const inputs = document.querySelectorAll('input');
      // console.log(inputs); // Test Code
      const length = inputs.length;
      console.log('the length', length);
      for (let i = 0; i < length; i++) {
        inputs[i].setAttribute('readonly', true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cNo]);

  //@ Style for toggleTitle btn --------
  const titleBtn = (subject) => {
    // console.log('the subject', subject); // Test Code
    if (subject) {
      if (Object.values(subject)[0] == true) {
        // console.log('hhh');
        return {
          background: 'var(--cp-1_2)',
          color: 'var(--cp-1_3)',
        };
      }
    }
  };

  //@ Style for breakdown Table --------
  const SizesColumnSize = () => {
    if (sizes.length < 6) {
      return 5;
    } else {
      return sizes.length;
    }
  };
  const breakDownTable = {
    display: 'grid',
    gridTemplateColumns: `repeat(${SizesColumnSize()}, 1fr)`,
    gridGap: '0',
  };

  //@ OnChange functions ----------
  const onSubmitCase = async (e) => {
    e.preventDefault();
    let updatedCases = {};
    if (cNo === null) {
      // update the state of mPrice
      // console.log('uploadNewCase is called'); // Test Code

      toggleLoading(true);
      updatedCases = await uploadCase(cases).then((result) => {
        if (result) {
          toggleLoading(false);
          return result;
        }
      });
    } else {
      //Delete the refs of srMtrls from database, that deleted in UI by user

      toggleLoading(true);
      updatedCases = await uploadCase(cases, _id).then((result) => {
        if (result) {
          toggleLoading(false);
          return result;
        }
      });
    }
    // updatedCases = await uploadCase(cases, _id);

    // If error is null it will be false, else it will be true. null equals false
    if (error) {
      // If error contains some message, do not generate srMtrl.
    } else {
      const body = {
        cases: updatedCases,
        comName: comName,
        comSymbol: comSymbol,
      };
      // If no error then generate srMtrl
      updateSrMtrlByMtrl(body);
    }
  };

  const loadCaseSelectCaseTypeTagIndex = (type) => {
    if (document.getElementById(`${type}-caseType`)) {
      return document
        .getElementById(`${type}-caseType`)
        .setAttribute('selected', 'selected');
    }
  };

  const goBack = (e) => {
    e.target.name = 'isEditingCase';
    addCaseValue(e);
  };

  return (
    <Fragment>
      {/* // Ask the user when they want to jump to another page wihout saving datas */}
      {/* <Prompt when={formIsHalfFilledOut} message='Hey' /> */}
      {popover === true || isLoading === true || caseError !== null ? (
        <DeletePopover key={`casepopover`} />
      ) : null}
      {isEditingCase ? (
        <div className='container container-with-navbar'>
          <div className='h-scatter-content'>
            <GoBackBtn onClick={goBack} />
            {/* <GoBackBtn onClick={goBack} /> */}
          </div>

          <div className='mt-1'>
            <form id='caseForm' onSubmit={onSubmitCase}>
              {/* Case Information */}
              <div className='fs-lead'>Case Information</div>
              <div className='round-card bg-cp-elem mb-3 bd-light'>
                <div className='grid-1-5 row-gap-md'>
                  <div className='v-center-content'>CaseNo.</div>
                  <div className='h-scatter-content'>
                    {' '}
                    <div>{cNo === null ? 'New Case' : cNo}</div>
                    {cNo === null || osNo != null || caseConfirmDate != null ? null : (
                      <DeleteBtnSmall
                        name='case'
                        onClick={togglePopover}
                        style={{ marginTop: '-0.4rem' }}
                      />
                    )}
                  </div>
                  <div className='v-center-content'>Merchandiser : </div>
                  <div>{cNo === null ? '' : merchandiser}</div>
                  <div className='v-center-content'>Style</div>
                  <input
                    id='caseStyle'
                    type='text'
                    name='style'
                    onChange={addCaseValue}
                    maxLength={styleLength}
                    placeholder='Enter the name of style'
                    className='bd-light'
                    value={style || ''}
                    required
                  />

                  <div className='v-center-content'>Client</div>
                  <input
                    id='caseClient'
                    type='text'
                    name='client'
                    onChange={addCaseValue}
                    maxLength={clientLength}
                    // placeholder='.'
                    className='bd-light'
                    value={client || ''}
                    required
                  />

                  <div className='v-center-content'>Case Type</div>
                  <select
                    id='caseType'
                    name='caseType'
                    list='caseTypeList'
                    onChange={addCaseValue}
                    className='bd-light'
                    required
                  >
                    {caseTypeList.map((t) => {
                      return (
                        <option
                          key={`${t}-caseType`}
                          id={`${t}-caseType`}
                          value={t}
                        >
                          {t}
                        </option>
                      );
                    })}
                  </select>
                </div>
                {cNo ? (
                  <div className='grid-1-5 my-1'>
                    <div className='v-center-content'>Last Update : </div>
                    <div>{`${lastUpdateBy},  Date : ${updateDate}`}</div>
                  </div>
                ) : null}
                {caseConfirmDate ? (
                  <LockedBadge
                    labels={[
                      `The Case is locked.`,
                      <i className="fas fa-exclamation-triangle"> The case's confirmed, therefore you can't update the case</i>,
                    ]}
                  />
                ) : null}
                {osNo ? (
                  <LockedBadge
                    labels={[
                      `Order Summary : ${osNo}`,
                      `Date ${poDate}`,
                      <i className="fas fa-exclamation-triangle"> The case's purchase order is made, therefore you can't update the case</i>,
                    ]}
                  />
                ) : null}
              </div>

              {/* CS-Breakdown table */}
              {/* Color -------------------------- */}
              <div className='grid-6 mb-05'>
                <div
                  className='fs-lead v-center-content'
                  style={{ gridColumn: '1/2' }}
                >
                  Size-Breakdown
                </div>
                {caseConfirmDate || osNo ? (
                  <div></div>
                ) : (
                    <SqBtnLarge
                      label={<i className='fas fa-swatchbook'> Color ＋</i>}
                      onClick={addcWay}
                    />
                  )}

                {caseConfirmDate || osNo ? (
                  <div></div>
                ) : (
                    <SqBtnLarge
                      label={<i className='fas fa-ruler'> Size ＋</i>}
                      onClick={addSize}
                    />
                  )}

                <div className='flexBox' style={{ gridColumn: '5/7' }}>
                  {/* <div className='lead text-primary'>Total Qty : </div>
                <div className='lead'>
                  {gQtys.reduce(
                    (partial_sum, gQty) => partial_sum + Number(gQty.gQty),
                    0
                  )}
                </div> */}
                </div>
              </div>

              <div className='row-gap-md round-card bg-cp-1 bd-light'>
                <div className='grid-1-07-6'>
                  <div></div>
                  <div></div>
                  <div style={breakDownTable}>
                    {sizes.map((size) => (
                      <Size key={size.id} size={size} />
                    ))}
                  </div>
                </div>
                <div className='grid-1-07-6 '>
                  <div>
                    {cWays.map((cWay) => (
                      <ColorWay key={cWay.id} cWay={cWay} />
                    ))}
                  </div>
                  <div className='bd-cp-2-r-2px-dotted'>
                    {cWays.map((cWay) => {
                      let subtotal = 0;
                      gQtys.map((gQty) => {
                        if (gQty.cWay === cWay.id) {
                          subtotal = subtotal + Number(gQty.gQty);
                        }
                        return subtotal;
                      });
                      return (
                        <div
                          key={`subtotalOf${cWay.id}`}
                          style={{
                            height: 'var(--btn-h-m)',
                          }}
                          className='mt-1 bd-cp-2-b-2px fs-tiny fc-cp-2-c'
                        >
                          <div
                            style={{ textAlign: 'right' }}
                            className='pr-1 pt-07'
                          >
                            {' '}
                            {subtotal.toLocaleString()}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div style={breakDownTable}>
                    {sizes.map((size) => (
                      <div
                        key={`Qty${size.id}`}
                        className='bd-cp-2-r-2px-dotted'
                      >
                        {gQtys.map((gQty) => (
                          <Qty key={gQty.id} size={size} gQty={gQty} />
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className='mb-3 h-scatter-content'>
                <div>
                </div>
                <div>
                  Total : {Number(gQtys.reduce((cur, gQty) => { cur += Number(gQty.gQty); return cur; }, 0)).toLocaleString()} Pcs
                </div>
              </div>

              {/* Material -------------------------- */}
              <div className='grid-6'>
                {/* elem-1 */}
                <div className='fs-lead' style={{ gridColumn: '1/2' }}>
                  Materials
                  <span className='fs-tiny ml-1 fc-cp-2-c'>{mtrls.length} ms</span>
                </div>
                <div className='ml-05'>
                  {caseConfirmDate || osNo ? null : (
                    <SqBtnLarge
                      label={<i className='fab fa-buffer '> Item ＋</i>}
                      onClick={addMtrl}
                    />
                  )}
                </div>

                {/* elem-2 */}
                <SqToggleSwitchL
                  name='isBoardMode'
                  checked={isBoardMode}
                  onChange={addCaseValue}
                  label_1={<i className='fas fa-list-ul'> Table</i>}
                  label_2={<i className='fas fa-table'> Board</i>}
                />
                <div
                  className='grid-4 btn-toggleTitle-containter '
                  style={{ gridColumn: '4 / 7' }}
                >
                  {displayTitles.map((obj, idx) => {
                    return (
                      <button
                        id={Object.keys(obj)[0]}
                        name='displayTitles'
                        className='btn btn-sq btn-toggleTitle fs-small'
                        key={`btnToggle${Object.keys(obj)[0]}`}
                        onClick={addCaseValue}
                        style={titleBtn(obj)}
                      >
                        {Object.keys(obj)[0].charAt(0).toUpperCase() +
                          Object.keys(obj)[0].slice(1)}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                {isBoardMode === true ? (
                  <Board
                    purpose='1_CaseForm'
                    subjects={mtrls}
                    displayTitles={displayTitles}
                    toggleItemAttributes={addMtrlValue}
                  />
                ) : (
                    <Table
                      purpose='1_CaseForm'
                      subjects={mtrls}
                      displayTitles={displayTitles}
                      toggleItemAttributes={addMtrlValue}
                    />
                  )}
              </div>
            </form>
          </div>
        </div>
      ) : (
          <ItemSelector props={props} purpose='CaseSelector' />
        )}
    </Fragment>
  );
};

export default CaseForm;
