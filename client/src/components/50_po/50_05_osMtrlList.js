import React, { useContext } from 'react';
import PurContext from '../../context/pur/purContext';
import PopoverContext from '../../context/popover/popoverContext'

import NoAndDateHeader from '../../components/elements/formPart/NoAndDateHeader';
import FormTitle from '../../components/elements/formPart/FormTitle';
import OsMtrlListItem from './50_05_01_osMtrlListItem';

const OsMtrlList = () => {
  const purContext = useContext(PurContext);
  const popoverContext = useContext(PopoverContext)
  const { currentOrderSummary, uploadCaseMtrl } = purContext;
  const { caseMtrls, suppliers } = currentOrderSummary;
  const { toggleLoading } = popoverContext;


  const submit = async (e) => {
    e.preventDefault();
    toggleLoading(true);
    console.log('order summary is triggered');
    await uploadCaseMtrl().then(() => {
      toggleLoading(false);
    });
  };



  const confirmedSuppliers = suppliers.map((i) => {
    if (i.poConfirmDate) {
      return i.supplier;
    } else {
      return null;
    }
  });

  const currentMtrlsLength = caseMtrls.filter((osMtrl) => {
    return confirmedSuppliers.includes(osMtrl.supplier);
  }).length;

  return (
    <div>
      <NoAndDateHeader No={currentOrderSummary.osNo} />
      <FormTitle title='Order Summary' />
      <form id='updateOsCaseMtrlHsCode' onSubmit={submit}></form>
      <section id='purchaseListArea' className='mb-2'>
        <div className='fs-lead'>Materials <span className='ml-05 fs-small fc-gray-4'>{currentMtrlsLength} Items</span></div>
        <div className='grid-OsMtrl bd-light bg-cp-2-light m-0 p-0 fs-small'>
          {[
            'No',
            'Supplier',
            'Ref_No',
            'HS-Code',
            'Color',
            'SPEC',
            'Unit',
            'Qantity',
            'Loss',
            'Total',
          ].map((i) => (
            <div
              key={`osTitle${i}`}
              className='bd-light v-center-content p-05 f-wrap'
            >
              {i}
            </div>
          ))}
        </div>
        {caseMtrls.map((osMtrl, idx) => {
          const check = confirmedSuppliers.includes(osMtrl.supplier);
          if (check) {
            return (
              <OsMtrlListItem
                key={osMtrl._id}
                osMtrl={osMtrl}
                theNumber={idx + 1}
                className='noBreak whenPrintFSSmall'
              />
            );
          } else {
            return null;
          }
        })}
        <div className='mt-05 h-scatter-content'>
          <div></div>
          <div>{`Total : ${caseMtrls.filter((i) => confirmedSuppliers.includes(i.supplier))
            .length
            } materials`}</div>
        </div>
      </section>
    </div>
  );
};

export default OsMtrlList;
