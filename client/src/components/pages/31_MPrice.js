import React, { useContext, Fragment } from 'react';

// Components
import LeftBar from '../layout/LeftBar';
import InquiryForm from '../30_srMtrl/30_02_inquiryForm'
import GoBackBtn from '../../components/elements/btns/GoBackBtn'
// ItemSelector
import ItemSelector from '../itemSelector/ItemSelector';
import SrMtrlContext from '../../context/srMtrl/srMtrlContext';
// import DeletePopover from '../layout/DeletePopover';
import PopoverContext from '../../context/popover/popoverContext';
import Navbar from '../layout/Navbar';

export const MPrice = (props) => {
  const srMtrlContext = useContext(SrMtrlContext);
  const popoverContext = useContext(PopoverContext);
  const currentPath = props.location.pathname;
  const { srMtrls, updateMPrices, currentSrPage, switchSrPage } = srMtrlContext;
  const { toggleLoading } = popoverContext;

  const onSubmitSrMtrl = async (e) => {
    console.log('yes the submit is hit');
    e.preventDefault();
    toggleLoading(true);
    const body = [];
    await srMtrls.map((srMtrl) => {
      body.push({
        id: srMtrl._id,
        mainPrice: srMtrl.mainPrice,
        mPrices: srMtrl.mPrices,
        item: srMtrl.item,
        unitConvertRatio: srMtrl.unitConvertRatio,
      });
    });
    if (currentPath === '/api/case/mprice') {
      await updateMPrices(body).then(() => {
        toggleLoading(false);
      });
    }
  };

  const goBack = () => {
    switchSrPage()
  }

  return (
    <Fragment>
      <Navbar />
      <div className='grid-1-4'>
        {/* Grid-1 */}
        <LeftBar currentPath={currentPath} />

        {/* Grid-2 */}
        {currentSrPage === null ? (
          <form id='srMtrlForm' onSubmit={onSubmitSrMtrl}>
            {' '}
            <ItemSelector
              purpose='srMtrlSelector'
              props={props}
              currentPath={currentPath}
            />
          </form>
        ) : (
            <div className='container container-with-navbar whenPrint pb-1'>
              <GoBackBtn onClick={goBack} />
              <InquiryForm />
            </div>
          )}
      </div>

    </Fragment>

  );
};

export default MPrice;
