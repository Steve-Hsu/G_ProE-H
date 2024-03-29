import React, { Fragment, useContext } from 'react'
import GoBackBtn from '../elements/btns/GoBackBtn'

//Context
import PopoverContext from '../../context/popover/popoverContext';
import PurContext from '../../context/pur/purContext';
import CompleteSetContext from '../../context/completeSet/completeSetContext'

//Component
import LeftBar from '../layout/LeftBar'
import DeletePopover from '../../components/layout/DeletePopover';
import OsSelector from '../../components/50_po/50_02_osSelector';
import OrderSummary from '../50_po/50_03_orderSummary';
import CompleteSetPage from '../60_completeSet/60_01_completeSetPage'
import Navbar from '../layout/Navbar';

const CompleteSet = (props) => {
   const currentPath = props.location.pathname;
   const popoverContext = useContext(PopoverContext)
   const { popover, current, toggleLoading, isLoading } = popoverContext;
   const purContext = useContext(PurContext);
   const completeSetContext = useContext(CompleteSetContext)
   const {
      openPage,
      switchPage,
      selectedCases,
      createOrderSummary,
      osError,
   } = purContext;

   const {
      csPage,
      switchCsPage,
      csError,
      uploadCsOrder,
   } = completeSetContext


   const goBack = () => {
      props.history.push('/api/case/director');
   };

   const goOsSelector = (e) => {
      e.preventDefault();
      switchCsPage('osSelector');
   };

   const goCsSelector = (e) => {
      e.preventDefault();
      switchCsPage('completeSetSelector');
   };

   const submit = async (e) => {
      e.preventDefault()
      console.log('yes submited !!')
      toggleLoading(true)
      await uploadCsOrder().then(() => {
         toggleLoading(false)
      })
   }

   return (
      <Fragment >
         <Navbar />
         {popover === true || isLoading === true || csError !== null ? <DeletePopover key='cspopover' current={current} props={props} /> : null}
         <form id='updateCompleteSet' onSubmit={submit}></form>
         {csPage === 'osSelector' ? (
            <div className='grid-1-4'>
               <LeftBar currentPath={currentPath} />
               <div className='container container-with-navbar'>
                  <GoBackBtn onClick={goBack} />
                  <OsSelector purpose='csOsSelector' />
               </div>
            </div>
         ) : csError === null && csPage === 'completeSetSelector' ? (
            <div className='grid-1-4'>
               <LeftBar currentPath={currentPath} />
               <div className='container container-with-navbar'>
                  <GoBackBtn onClick={goOsSelector} />
                  <OrderSummary purpose='completeSetOfCase' />
               </div>
            </div>
         ) : csError == null && csPage === 'completeSet' ? (
            <div className='grid-1-4'>
               <LeftBar currentPath={currentPath} />
               <div className='container container-with-navbar'>
                  <GoBackBtn onClick={goCsSelector} />
                  <CompleteSetPage />
               </div>
            </div>
         ) : null}

      </Fragment>

   )
}

export default CompleteSet
