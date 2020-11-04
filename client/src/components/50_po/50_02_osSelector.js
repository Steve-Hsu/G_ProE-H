import React, { useContext, useEffect } from 'react';
import PurContext from '../../context/pur/purContext';
import CompleteSetContext from '../../context/completeSet/completeSetContext'
import Table from '../elements/table/Table';
import PopoverContext from '../../context/popover/popoverContext'
//@ Child component
// import OsItem from './50_02_01_osItem';

const OsSelector = ({ purpose }) => {

  const purContext = useContext(PurContext);
  const popoverContext = useContext(PopoverContext)
  const {
    osList,
    getOsList,
    openPage,
    // switchOsCurrent,
    getOs,
    switchPage,
  } = purContext;

  const completeSetContext = useContext(CompleteSetContext)
  const {
    osHeads,
    getOsHeads,
    getCs,
    switchCsPage,
  } = completeSetContext

  const osPageSwitch = (osNo) => {
    toggleLoading(true)
    getOs(osNo).then(() => {
      switchPage(purpose === 'osSelector' ? 'orderSummary' : 'csCaseSelector');
      toggleLoading(false)
    })
  }

  const csPageSwitch = (osNo) => {
    toggleLoading(true)
    getCs(osNo).then(() => {
      switchCsPage('completeSetSelector')
      toggleLoading(false)
    })

  }

  const { toggleLoading } = popoverContext

  useEffect(() => {
    toggleLoading(true)
    if (purpose === 'csOsSelector') {
      getOsHeads().then(() => {
        toggleLoading(false)
      })
    } else {
      getOsList().then(() => {
        toggleLoading(false)
      });
    }


    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openPage]);

  //@ return
  return (

    <Table
      subjects={purpose === 'csOsSelector' ? osHeads : osList}
      purpose={purpose}
      toggleItemAttributes={purpose === 'csOsSelector' ? [csPageSwitch] : [osPageSwitch]}
      displayTitles={[{ osNo: true }]}
    />

  );
};

export default OsSelector;
