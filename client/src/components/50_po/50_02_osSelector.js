import React, { useContext, useEffect } from 'react';
import PurContext from '../../context/pur/purContext';
import Table from '../elements/table/Table';
//@ Child component
// import OsItem from './50_02_01_osItem';

const OsSelector = () => {
  const purContext = useContext(PurContext);
  const {
    osList,
    getOsList,
    openPage,
    switchOsCurrent,
    switchPage,
  } = purContext;

  useEffect(() => {
    // alert('Try get os List');
    getOsList();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openPage]);

  //@ return
  return (
    // <div>test</div>
    <Table
      subjects={osList}
      purpose='osSelector'
      toggleItemAttributes={[switchOsCurrent, switchPage]}
      displayTitles={[{ osNo: true }]}
    />
    // <div className='p-1 container container-with-navbar'>
    //   {osList.map((osItem) => (
    //     <OsItem key={`caseList${osItem._id}`} osItem={osItem} />
    //   ))}
    // </div>
  );
};

export default OsSelector;
