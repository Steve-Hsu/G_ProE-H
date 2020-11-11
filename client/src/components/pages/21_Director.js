import React, { Fragment, useContext, useEffect } from 'react';
import Banner from '../elements/banner/Banner';
//Context
import AuthUserContext from '../../context/authUser/authUserContext';
import UserContext from '../../context/user/userContext';
import SearchBarContext from '../../context/searchBar/searchBarContext';
import CasesContext from '../../context/cases/casesContext';
import SrMtrlContext from '../../context/srMtrl/srMtrlContext';
import QuoContext from '../../context/quo/quoContext';
import PurContext from '../../context/pur/purContext';
import CompleteSetContext from '../../context/completeSet/completeSetContext';
import PopoverContext from '../../context/popover/popoverContext';


export const Director = (props) => {
  const authUserContext = useContext(AuthUserContext);
  const userContext = useContext(UserContext);
  const searchBarContext = useContext(SearchBarContext);
  const casesContext = useContext(CasesContext);
  const srMtrlContext = useContext(SrMtrlContext);
  const quoContext = useContext(QuoContext);
  const purContext = useContext(PurContext);
  const completeSetContext = useContext(CompleteSetContext)
  const popoverContext = useContext(PopoverContext)

  const { logoutUser, isAuthenticated, token } = authUserContext;
  const { clearUsers } = userContext;
  const { toggleIndexList } = searchBarContext;
  const { defaultCase } = casesContext;
  const { clearSrMtrl } = srMtrlContext;
  const { switchPage, defaultQuo } = quoContext;
  const { defaultPurState } = purContext
  const { defaultCS } = completeSetContext;
  const { defaultPopover } = popoverContext;

  // AutoLogout after login for 10 hours
  useEffect(() => {
    const loginTime = new Date()
    console.log("the effect in direction") // test code
    setTimeout(() => {
      console.log("The setTimeout in direction") // Test code
      if (window.localStorage.token === token) {
        const time = new Date()
        alert(`Login : ${loginTime.getDate()}, ${loginTime.getHours()} o'clock, ${loginTime.getMinutes()} minutes
        ,Auto logout : ${time.getDate()}, ${time.getHours()} o'clock, ${time.getMinutes()} minutes`)
        console.log("yes you logout") // Test code
        onLogout()
        props.history.push('/api/auth/user');
      }
    }, 36000000)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated])

  const onLogout = () => {
    // acom.logoutCom();
    logoutUser();
    toggleIndexList();
    clearUsers();
    defaultCase();
    clearSrMtrl();
    defaultQuo();
    defaultPurState();
    defaultCS();
    defaultPopover();
  };


  // const { switchPage } = purContext;
  const goCase = () => {
    //Jump to other page while keeping authenticated
    props.history.push('/api/case/merchandiser');
  };
  const gomPrice = () => {
    //Jump to other page while keeping authenticated
    props.history.push('/api/case/mprice');
  };

  const goQuotation = [
    {
      material: () => {
        props.history.push('/api/quogarment');
        switchPage('material');
      },
    },
    {
      garment: () => {
        props.history.push('/api/quogarment');
        switchPage('garment');
      },
    },
  ];

  const quoLabel = ['Quotation for Materil', 'Quotation for Garment'];

  const goPurchase = [
    {
      caseSelector: () => {
        props.history.push('/api/purchase');
        purContext.switchPage('caseSelector');
      },
    },
    {
      osSelector: () => {
        props.history.push('/api/purchase');
        purContext.switchPage('osSelector');
      },
    },
  ];

  const purLabel = ['Select case, Make order summary', 'Check order summary'];
  // const goPurchase = () => {
  //   //Jump to other page while keeping authenticated
  //   props.history.push('/api/purchase');
  // };

  const goCompleteSet = () => {
    //Jump to other page while keeping authenticated
    props.history.push('/api/completeset');
  }

  const goProgress = () => {
    //Jump to other page while keeping authenticated
    props.history.push('/api/case/user/progress');
  };

  return (
    <Fragment>
      {/* content */}
      <div className='h-center-content h-100vh '>
        <div className='container container-with-navbar w-100 overflow-auto'>
          <Banner purpose='case' onClick={goCase} label='Start a case' className='bg-gray-1' />
          <Banner purpose='mPrice' onClick={gomPrice} label='Material Price' className='bg-gray-1' />
          <Banner purpose='quotation' onClick={goQuotation} label={quoLabel} className='bg-gray-1' />
          <Banner purpose='purchase' onClick={goPurchase} label={purLabel} className='bg-gray-1' />
          <Banner purpose='completeset' onClick={goCompleteSet} label='Complete set for production' className='bg-gray-1' />
          {/* <Banner purpose='progress' onClick={goProgress} label='Progress' /> */}
        </div>
      </div>
    </Fragment>
  );
};

export default Director;
