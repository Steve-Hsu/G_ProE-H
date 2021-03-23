import React, { useContext, useRef, useEffect, Fragment, useState } from 'react';

// Context
import CaseContext from '../../context/cases/casesContext';
import SrMtrlContext from '../../context/srMtrl/srMtrlContext';
import QuoContext from '../../context/quo/quoContext';
import PurContext from '../../context/pur/purContext';
import PopoverContext from '../../context/popover/popoverContext';
// Components
import Table from '../elements/table/Table';
import Board from '../elements/board/Board';
import GoBackBtn from '../elements/btns/GoBackBtn';
import SqToggleSwitchL from '../elements/btns/SqToggleSwitchL';
import DeletePopover from '../layout/DeletePopover';

export const ItemSelector = ({ props, purpose, currentPath }) => {
  const caseContext = useContext(CaseContext);
  const srMtrlContext = useContext(SrMtrlContext);
  const quoContext = useContext(QuoContext);
  const purContext = useContext(PurContext);
  const popoverContext = useContext(PopoverContext);
  const {
    getCaseList,
    downloadCase,
    addCaseValue,
    caseList,
    isBoardMode,
    caseError,
  } = caseContext;
  const { srMtrls, getSrMtrls, openSrMtrl, editingList, srMtrlError } = srMtrlContext;
  const { switchQuoFormSelector, quotation, switchQuoForm } = quoContext;
  const { selectCase, selectedCases, switchPage, currentOrderSummary, openMtrlLeadTime, editingLeadTime, } = purContext;
  const { isLoading, toggleLoading, popover } = popoverContext;
  useEffect(() => {
    console.log('rendered');
    switch (purpose) {
      case 'srMtrlSelector':
      case 'quoSrMtrlSelector':
        toggleLoading(true);
        getSrMtrls().then(() => {
          toggleLoading(false);
          // setSubject(data);
        });
        break;
      case 'CaseSelector':
      case 'quoCaseSelector':
      case 'purCaseSelector':
        toggleLoading(true);
        getCaseList().then(() => {
          toggleLoading(false);
          // setSubject(data);
        });
        break;
      default:
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);



  const searchKeyWord = useRef('');
  // let searchKeyWord = '';
  let data = [];
  let attributes = null;
  let goBack = null;
  let displayTitles = [];
  const [subjects, setSubject] = useState(null);
  // let subjects = [];

  switch (purpose) {
    case 'CaseSelector':
    case 'quoCaseSelector':
    case 'purCaseSelector':

      displayTitles = [
        { cNo: true },
        { style: true },
        { caseType: true },
        { client: true },
        { merchandiser: true },
        { quoNo: true },
      ];
      switch (purpose) {
        case 'CaseSelector':
          data = caseList;
          const aFunc = async (id) => {
            toggleLoading(true);
            await downloadCase(id).then(() => {
              toggleLoading(false);
            });
          };
          attributes = [aFunc, addCaseValue];
          goBack = () => {
            props.history.push('/api/case/director');
          };
          break;
        case 'quoCaseSelector':
          data = caseList;
          const quoFunc = async (cNo) => {
            console.log('hit hit ');
            toggleLoading(true);
            await switchQuoFormSelector(cNo).then(() => {
              toggleLoading(false);
            });
          };
          attributes = quoFunc;
          goBack = () => {
            props.history.push('/api/case/director');
          };
          break;
        case 'purCaseSelector':
          data = caseList.filter((i) => i.caseConfirmDate !== null);
          attributes = [selectCase, selectedCases];
          goBack = () => {
            props.history.push('/api/case/director');
          };
          break;
        default:
      }
      break;
    case 'srMtrlSelector':
    case 'quoSrMtrlSelector':
      data = srMtrls;
      attributes = [openSrMtrl, editingList];
      displayTitles = [{ supplier: true }, { ref_no: true }, { prices: true }, { complete: true }];
      goBack = () => {
        props.history.push('/api/case/director');
      };
      break;
    case 'quoFormSelector':
      data = quotation.quoForms;
      attributes = switchQuoForm;
      displayTitles = [
        {
          quoNo: true,
        },
        { quotatedQty: true },
        { cm: true },
        { mQuosTotal: true },
        { otherExpensesTotal: true },
        { fob: true },
      ];
      goBack = () => {
        switchQuoFormSelector(null);
        // defaultCase();
      };
      break;
    case 'leadTimePage':
      data = currentOrderSummary.caseMtrls;
      attributes = [openMtrlLeadTime, editingLeadTime];
      displayTitles = [
        {
          supplier: true,
        },
        { ref_no: true },
        { poConfirmed: true },
        { leadTimeSetUp: true },
        { mColor: true },
        { mSizeSPEC: true },
      ];
      goBack = (e) => {
        e.preventDefault();
        switchPage('orderSummary');
      };

      break;
    default:
  }

  // Fileter funcs
  const searchAndFilter = (keywords) => {
    if (!data) {
      return;
    }
    const filteredResult = data.filter((target) => {
      const regex = new RegExp(`${keywords}`, 'gi');
      return target.cNo?.match(regex) ||
        target.client?.match(regex) ||
        target.style?.match(regex) ||
        target.item?.match(regex) ||
        target.merchandiser?.match(regex) ||
        target.supplier?.match(regex);
    });
    setSubject(filteredResult);
  }

  const cleanFilter = () => {
    setSubject(data)
    // subjects = data;
    console.log('clearFilter', subjects);
  }

  const searchBarOnchange = (e) => {
    if (e.target.value !== '') {
      searchAndFilter(e.target.value);
    } else {
      cleanFilter();
    }
  }

  return (
    <Fragment>
      {caseError !== null || srMtrlError !== null || isLoading === true || popover === true ? (
        <DeletePopover key={`itemSelectPopover`} props={props} />
      ) : null}
      {/* <div style={{ paddingTop: '50px' }} className='p-1 container'> */}
      <div
        className=' container container-with-navbar'
      // style={{ paddingTop: '60px' }}
      >
        <div className='grid-6'>
          <GoBackBtn onClick={goBack} />
          <div id='itemSearchBar' className='v-center-content' style={{ marginLeft: '-3vw' }}>
            <div className='mr-05 center-content'>
              <i className='fas fa-search'></i>
            </div>
            <div style={{ flex: '1 1' }}>
              <input
                ref={searchKeyWord}
                type='text'
                placeholder='Search...'
                onChange={searchBarOnchange}
              />
            </div>
          </div>
          <SqToggleSwitchL
            name='isBoardMode'
            checked={isBoardMode}
            onChange={addCaseValue}
            label_1={<i className='fas fa-list-ul'> Table</i>}
            label_2={<i className='fas fa-table'> Board</i>}
          />
        </div>
        {isBoardMode === true ? (
          <Board
            purpose={purpose}
            subjects={subjects || data}
            displayTitles={displayTitles}
            toggleItemAttributes={attributes}
            currentPath={currentPath}
          />
        ) : (
          <Table
            purpose={purpose}
            subjects={subjects || data}
            displayTitles={displayTitles}
            toggleItemAttributes={attributes}
            currentPath={currentPath}
          />
        )}
        {/* </div> */}
      </div>
    </Fragment>
  );
};

export default ItemSelector;
