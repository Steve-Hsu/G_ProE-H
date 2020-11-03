import React, { useContext, Fragment } from 'react';
// Components
import LeftBar from '../layout/LeftBar';
// import CaseSelector from '../50_po/50_01_caseSelector';
import ItemSelector from '../itemSelector/ItemSelector';
import OsSelector from '../50_po/50_02_osSelector';
import OrderSummary from '../50_po/50_03_orderSummary';
import PurchaseOrder from '../50_po/50_04_purchaseOrder';
import OsMtrlList from '../50_po/50_05_osMtrlList';
import GoBackBtn from '../elements/btns/GoBackBtn';

// Context
import PurContext from '../../context/pur/purContext';
import DeletePopover from '../../components/layout/DeletePopover';
import PopoverContext from '../../context/popover/popoverContext';

const Purchase = (props) => {
  const purContext = useContext(PurContext);
  const {
    openPage,
    switchPage,
    selectedCases,
    createOrderSummary,
    osError,
    uploadCaseMtrl,
  } = purContext;
  const currentPath = props.location.pathname;

  const popoverContext = useContext(PopoverContext);
  const { popover, current, toggleLoading, isLoading } = popoverContext;

  const goBack = () => {
    props.history.push('/api/case/director');
  };

  const submit_1 = async (e) => {
    e.preventDefault();
    if (openPage === 'caseSelector') {
      toggleLoading(true);
      console.log('order summary is triggered');
      await createOrderSummary(selectedCases).then(() => {
        toggleLoading(false);
        switchPage('osSelector');
      });
    }
  };


  const submit_2 = async (e) => {
    e.preventDefault();
    if (openPage === 'leadTimePage') {
      toggleLoading(true);
      console.log('Try upload LeadTimes');
      await uploadCaseMtrl('leadTime').then(() => {
        toggleLoading(false);
      });
    }
  };

  //Here use same function the "switchPage", but separate to 2 onClick func the "goOsSelector" and "goOrderSummary", if not do so, the render seems sometime not refering to the value soon enough, cause the func in the state will enter an null value
  const goOsSelector = (e) => {
    e.preventDefault();
    switchPage('osSelector');
  };

  const goOrderSummanry = (e) => {
    e.preventDefault();
    switchPage('orderSummary');
  };


  return (
    <Fragment>
      {popover === true || isLoading === true || osError !== null ? (
        <DeletePopover key='purchasePagePopover' current={current} />
      ) : null}
      {/* Grid-1 */}
      {openPage === 'caseSelector' ? (
        <div className='grid-1-4'>
          <LeftBar currentPath={currentPath} />
          <form id='purchase' onSubmit={submit_1}>
            <ItemSelector props={props} purpose='purCaseSelector' />
          </form>
        </div>
      ) : openPage === 'osSelector' ? (
        <div className='grid-1-4'>
          <LeftBar currentPath={currentPath} />
          <div className='container container-with-navbar'>
            <GoBackBtn onClick={goBack} />
            <OsSelector purpose='osSelector' />
          </div>
        </div>
      ) : openPage === 'orderSummary' ? (
        <div className='grid-1-4'>
          <LeftBar currentPath={currentPath} />
          <div className='container container-with-navbar'>
            {/* <button value='osSelector' onClick={onClick}>
              go back
            </button> */}
            <GoBackBtn onClick={goOsSelector} />
            <OrderSummary purpose='purchaseOrder' />
          </div>
        </div>
      ) : openPage === 'purchaseOrder' ? (
        <div className='grid-1-4'>
          <LeftBar currentPath={currentPath} />
          <div className='container container-with-navbar whenPrint'>
            <GoBackBtn onClick={goOrderSummanry} className='noPrint' />
            <PurchaseOrder />
          </div>
        </div>
      ) : openPage === 'oSMtrlList' ? (
        <div className='grid-1-4'>
          <LeftBar currentPath={currentPath} />
          <div className='container container-with-navbar whenPrint long-row-print'>
            <GoBackBtn onClick={goOrderSummanry} className='noPrint' />
            <OsMtrlList />
          </div>
        </div>
      ) : openPage === 'leadTimePage' ? (
        <form id='updateOsCaseMtrlLeadTime' onSubmit={submit_2} className='grid-1-4'>
          <LeftBar currentPath={currentPath} />
          <ItemSelector props={props} purpose='leadTimePage' />
        </form>
      ) : null}
    </Fragment>
  );
};
export default Purchase;
