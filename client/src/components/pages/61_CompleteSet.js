import React, { Fragment, useContext } from 'react'
import GoBackBtn from '../elements/btns/GoBackBtn'

//Context
import PopoverContext from '../../context/popover/popoverContext';
import PurContext from '../../context/pur/purContext';

//Component
import LeftBar from '../layout/LeftBar'
import DeletePopover from '../../components/layout/DeletePopover';
import OsSelector from '../../components/50_po/50_02_osSelector';
import OrderSummary from '../50_po/50_03_orderSummary';

const CompleteSet = (props) => {
   const currentPath = props.location.pathname;
   const popoverContext = useContext(PopoverContext)
   const { popover, current, toggleLoading, isLoading } = popoverContext;
   const purContext = useContext(PurContext);
   const {
      openPage,
      switchPage,
      selectedCases,
      createOrderSummary,
      osError,
   } = purContext;


   const goBack = () => {
      props.history.push('/api/case/director');
   };

   const goOsSelector = (e) => {
      e.preventDefault();
      switchPage('osSelector');
   };


   return (
      <Fragment >
         {popover === true || isLoading === true ? <DeletePopover key='quotationpopover' current={current} /> : null}
         {openPage !== 'csCaseSelector' ? (
            <div className='grid-1-4'>
               <LeftBar currentPath={currentPath} />
               <div className='container container-with-navbar'>
                  <GoBackBtn onClick={goBack} />
                  <OsSelector purpose='csOsSelector' />
               </div>
            </div>
         ) : (
               <div className='grid-1-4'>
                  <LeftBar currentPath={currentPath} />
                  <div className='container container-with-navbar'>
                     <GoBackBtn onClick={goOsSelector} />

                     <OrderSummary purpose='completeSetOfCase' />

                  </div>
               </div>
            )}
         {/* <div className='grid-1-4'>
            <LeftBar currentPath={currentPath} />
            <div className='container container-with-navbar'>
               <GoBackBtn onClick={goBack} />
               <OsSelector />
            </div>
         </div> */}
      </Fragment>

   )
}

export default CompleteSet
