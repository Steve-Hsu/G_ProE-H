import React, { useContext, useEffect, Fragment } from 'react';

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
    defaultCase,
    isBoardMode,
  } = caseContext;
  const { srMtrls, getSrMtrls, openSrMtrl, editingList } = srMtrlContext;
  const { switchQuoFormSelector, quotation, switchQuoForm } = quoContext;
  const { selectCase, selectedCases, switchPage } = purContext;
  const { toggleLoading } = popoverContext;
  useEffect(() => {
    switch (purpose) {
      case 'srMtrlSelector':
      case 'quoSrMtrlSelector':
        toggleLoading(true);
        getSrMtrls().then(() => {
          toggleLoading(false);
        });
        break;
      case 'CaseSelector':
      case 'quoCaseSelector':
      case 'purCaseSelector':
        toggleLoading(true);
        getCaseList().then(() => {
          toggleLoading(false);
        });
        break;
      default:
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  let subjects = null;
  let attributes = null;
  let goBack = null;
  let displayTitles = [];

  switch (purpose) {
    case 'CaseSelector':
    case 'quoCaseSelector':
    case 'purCaseSelector':
      subjects = caseList;
      displayTitles = [
        { cNo: true },
        { caseType: true },
        { client: true },
        { merchandiser: true },
        { quoNo: true },
      ];
      switch (purpose) {
        case 'CaseSelector':
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
      subjects = srMtrls;
      attributes = [openSrMtrl, editingList];
      displayTitles = [{ supplier: true }, { ref_no: true }];
      goBack = () => {
        props.history.push('/api/case/director');
      };
      // if (purpose === 'srMtrlSelector') {
      //   goBack = () => {
      //     props.history.push('/api/case/director');
      //   };
      // } else {
      //   goBack = () => {
      //     quoContext.switchPage();
      //   };
      // }

      break;
    case 'quoFormSelector':
      subjects = quotation.quoForms;
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
    default:
  }

  return (
    <Fragment>
      {/* <div style={{ paddingTop: '50px' }} className='p-1 container'> */}
      <div
        className=' container container-with-navbar'
        // style={{ paddingTop: '60px' }}
      >
        <div className='grid-6'>
          <GoBackBtn onClick={goBack} />
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
            subjects={subjects}
            displayTitles={displayTitles}
            toggleItemAttributes={attributes}
            currentPath={currentPath}
          />
        ) : (
          <Table
            purpose={purpose}
            subjects={subjects}
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
