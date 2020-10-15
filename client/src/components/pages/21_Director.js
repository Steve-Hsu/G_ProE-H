import React, { Fragment, useContext } from 'react';
import Banner from '../elements/banner/Banner';
import QuoContext from '../../context/quo/quoContext';
import PurContext from '../../context/pur/purContext';

export const Director = (props) => {
  const quoContext = useContext(QuoContext);
  const purContext = useContext(PurContext);
  const { switchPage } = quoContext;
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

  const goProgress = () => {
    //Jump to other page while keeping authenticated
    props.history.push('/api/case/user/progress');
  };

  return (
    <Fragment>
      {/* content */}
      <div className='h-center-content h-100vh'>
        <div className='container container-with-navbar w-100'>
          <Banner purpose='case' onClick={goCase} label='Start a case' className='bg-gray-1' />
          <Banner purpose='mPrice' onClick={gomPrice} label='Material Price' className='bg-gray-1' />
          <Banner purpose='quotation' onClick={goQuotation} label={quoLabel} className='bg-gray-1' />
          <Banner purpose='purchase' onClick={goPurchase} label={purLabel} className='bg-gray-1' />
          {/* <Banner purpose='progress' onClick={goProgress} label='Progress' /> */}
        </div>
      </div>
    </Fragment>
  );
};

export default Director;
