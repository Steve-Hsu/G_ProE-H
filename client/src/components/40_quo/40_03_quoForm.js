import React, { useContext, Fragment } from 'react';
//Context
import QuoContext from '../../context/quo/quoContext';
import PopoverContext from '../../context/popover/popoverContext';

//Component
import DeletePopover from '../layout/DeletePopover';

import QuoMtrl from './40_03_03_quoMtrl';
import QuoOtherEx from './40_03_04_quoOtherEx';
// import QuoCondition from './40_03_05_quoCondition';

//element
import Select from '../elements/select/Select';
import GoBackBtn from '../elements/btns/GoBackBtn';
import SqBtnLarge from '../elements/btns/SqBtnLarge';
import DeleteBtnSmall from '../elements/btns/DeleteBtnSmall';
import NoAndDateHeader from '../elements/formPart/NoAndDateHeader';
import FormTitle from '../elements/formPart/FormTitle';
import Conditions from '../elements/formPart/Conditions/Conditions';
import ConfirmArea from '../elements/formPart/ConfirmArea';

const QuoForm = () => {
  const quoContext = useContext(QuoContext);
  const popoverContext = useContext(PopoverContext);
  const {
    switchQuoForm,
    downLoadmtrlPrice,
    currentQuoForm,
    uploadQuoForm,
    isQuotating,
    updateCurrentQuoForm,
    quotation,
  } = quoContext;
  const {
    _id,
    quoNo,
    quoSizes,
    quocWays,
    currency,
    mQuosTotal,
    otherExpenses,
    cm,
    otherExpensesTotal,
    fob,
    conditions,
  } = currentQuoForm;
  const theCases = quotation.theCase;
  let cWays,
    sizes,
    gQtys,
    mtrls = [];
  let cNo,
    caseType,
    style,
    client = '';

  if (theCases) {
    cNo = theCases.cNo;
    caseType = theCases.caseType;
    style = theCases.caseType;
    client = theCases.client;
    cWays = theCases.cWays;
    sizes = theCases.sizes;
    gQtys = theCases.gQtys;
    mtrls = theCases.mtrls;
  }

  const {
    popover,
    // current,
    togglePopover,
    toggleLoading,
    isLoading,
  } = popoverContext;
  const onSubmitQuoForm = async (e) => {
    // console.log('here triggered'); // Test Code
    e.preventDefault();
    // uploadQuoForm(isQuotating, true);
    toggleLoading();
    await uploadQuoForm(isQuotating, false, currentQuoForm)
      .then(() => {
        console.log('QuoForm is updated');
      })
      .then(() => {
        switchQuoForm(_id);
        toggleLoading();
      });
  };

  const onChange = (e) => {
    e.preventDefault();
    updateCurrentQuoForm(e);
  };

  const onClick = (e) => {
    e.preventDefault();
    switch (e.target.name) {
      case 'goBackBtn':
        switchQuoForm(null);
        break;
      case 'quotationBtn':
        const body = {
          quoNo: quoNo,
          quoFormId: _id,
          quoSizes: quoSizes,
          quocWays: quocWays,
        };
        downLoadmtrlPrice(body);
        break;
      case 'addOtherExpense':
      case 'addCondition':
      case 'deleteCondition':
      case 'conditionDescription':
      case 'condition':
        updateCurrentQuoForm(e);
        break;
      default:
    }
  };

  const addNumber = (e) => {
    e.preventDefault();
    const num = e.target.value;
    const Max = 99999;
    if (String(num).length > String(Max).length) {
      e.target.value = Max;
      updateCurrentQuoForm(e);
    } else {
      updateCurrentQuoForm(e);
    }
  };

  // const deleteQuoFormBtn = () => {
  //   togglePopover();
  // };

  return (
    <Fragment>
      {popover === true || isLoading === true ? (
        <DeletePopover key='quoFormPopover' />
      ) : null}
      <div
        className='container container-with-navbar whenPrint'
        id='quotationForm'
      >
        <div className='h-scatter-content '>
          <GoBackBtn name='goBackBtn' onClick={onClick} className='noPrint' />

          <DeleteBtnSmall
            name='quoForm'
            onClick={togglePopover}
            value={_id}
            className='m-0 noPrint'
          />
        </div>

        {/* <button name='goBackBtn' onClick={onClick}>
          Go Back
        </button>{' '} */}
        <form id='quoForm' onSubmit={onSubmitQuoForm} />
        <NoAndDateHeader No={quoNo} />
        <FormTitle title='Garment Quotation' />

        {/* <section className='h-20 w-100 mt-05 mb-3' id='formHead'>
          <form id='quoForm' onSubmit={onSubmitQuoForm} />
          <div className='fs-large h-center-content'>Garment Quotation</div>
          <div className='fs-lead h-center-content '>
            {comName} {comNameTail}
          </div>
          <div className='h-center-content '>{comAddress}</div>
        </section> */}
        <section id='formInformation' className='mb-2'>
          <div className='fs-lead'>Quotation For</div>
          {/* <div>Case Number : {cNo}</div>

          <div>Quotation for : {quotateFor}</div>
          <div>Quotation Type : {caseType}</div> */}
          <div className='whenPrintFSSmall'>
            <div>
              <span className='fw-bold'>Client : </span>
              {client}
            </div>
            <div>
              <span className='fw-bold'>Style : </span>
              {style}
            </div>
            <div>
              <span className='fw-bold'>Style total sizes :</span>{' '}
              {sizes ? sizes.length : 0} Sizes
            </div>
            <div>
              <span className='fw-bold'>Style total colorways : </span>{' '}
              {cWays ? cWays.length : 0} Color Ways
            </div>

            <div>
              <span className='fw-bold'>
                {quoSizes.length} Quotated Sizes :
              </span>{' '}
              {quoSizes.map((size) => (
                <span key={`quotatedsize${size}`}>{size}, </span>
              ))}
            </div>

            <div>
              <span className='fw-bold'>
                {' '}
                {quocWays.length} Quotated colorWays :
              </span>{' '}
              {quocWays.map((cWay) => (
                <span key={`quotatedcway${cWay}`}>{cWay}, </span>
              ))}
            </div>
          </div>
        </section>

        <section id='currencySelection' className='noPrint mb-2'>
          <div className='fs-lead'>Select a Currency</div>
          <div className='h-scatter-content round-card bg-cp-1 w-30'>
            {' '}
            <div className='fw-bold mr-1'>Quotation in</div>
            <div style={{ width: '10rem' }}>
              {'  '}
              <Select
                purpose='currency'
                onChange={onChange}
                name='currency'
                id={_id}
                subject={currentQuoForm}
                // value={currency || ''}
                selectedOption={currency}
              />
            </div>
          </div>
        </section>

        <section id='materialQuotationArea' className='mb-2'>
          <div className='fs-lead'>Materials</div>
          <div className='grid-Quo-Mtrl bd-light bg-cp-2-light m-0 p-0 fs-small'>
            {[
              'Item',
              'Description',
              'Consuption',
              `Unit Price (${currency})`,
              `Amount (${currency})`,
            ].map((i) => (
              <div
                key={`mQuosTitle${i}`}
                className='bd-light v-center-content p-05 f-wrap'
              >
                {i}
              </div>
            ))}
          </div>
          {mtrls.map((mtrl) => (
            <QuoMtrl
              key={`quoMtrl${mtrl.id}`}
              mtrl={mtrl}
              className='noBreak whenPrintFSSmall'
            />
          ))}
          <div className='mt-05 h-scatter-content'>
            <div></div>
            <div>{`Subtotal : ${mQuosTotal} ${currency}`}</div>
          </div>
        </section>
        {/* <button name='addOtherExpense' onClick={onClick}>
            Add other expense
          </button> */}

        <SqBtnLarge
          name='addOtherExpense'
          onClick={onClick}
          label='Add other expense'
          className='noPrint w-15vw mb-05'
        />

        <section id='expensesArea' className='mb-2'>
          <div className='fs-lead'>Expenses</div>
          <div className='grid-Quo-otherExpanse bd-light bg-cp-2-light m-0 p-0 fs-small'>
            {/* Row of title */}
            {['Cost', 'Description', `Amount (${currency})`].map((i) => (
              <div
                key={`otherExpenseTitle${i}`}
                className='bd-light v-center-content p-05 '
              >
                {i}
              </div>
            ))}
          </div>
          <div className='grid-Quo-otherExpanse m-0 p-0 bd-light bd-no-t mt-0 mb-0 whenPrintFSSmall'>
            <div className='bd-light bd-no-t v-center-content p-05'>CM</div>
            <div className='bd-light bd-no-t v-center-content p-05'>
              Cuting and making
            </div>
            <div className='bd-light bd-no-t v-center-content'>
              <input
                type='number'
                step='.01'
                name='cm'
                onChange={addNumber}
                id={`cm${_id}`}
                value={cm || ''}
                className='whenPrintNoBorder whenPrintFSSmall bd-no'
                // style={{ width: '5rem' }}
              />
            </div>
          </div>
          {otherExpenses.map((oE) => (
            <QuoOtherEx
              key={`otherExpense${oE.id}`}
              otherExpense={oE}
              className='noBreak bd-light mt-0 mb-0 whenPrintFSSmall'
            />
          ))}
          <div className='mt-05 h-scatter-content'>
            <div></div>
            <div>{`Subtotal : ${Number(
              otherExpensesTotal + cm
            )} ${currency}`}</div>
          </div>
        </section>

        <div className='h-scatter-content mb-2'>
          <div></div>
          <div className='fs-lead'>{`Total : ${fob} ${currency}`}</div>
        </div>

        {/*@ Conditions area */}
        <Conditions
          onClick={onClick}
          subjects={conditions}
          deleteBtnName='deleteCondition'
          deleteBtnOnClick={onClick}
          selectName='condition'
          selectOnChange={onClick}
          inputName='conditionDescription'
          inputOnChange={onClick}
        />
        {/*@ Confirm Area */}
        <ConfirmArea />
      </div>
    </Fragment>
  );
};

export default QuoForm;

// /* <SqBtnLarge
//           name='addCondition'
//           onClick={onClick}
//           label='Add condition'
//           className='noPrint w-15vw mb-05'
//         />
//         {conditions.length > 0 ? (
//           <section id='conditions' className='mb-2 noBreak'>
//             <div className='fs-lead'>Condition</div>
//             {conditions
//               ? conditions.map((c) => (
//                   <QuoCondition
//                     key={`condition${c.id}`}
//                     condition={c}
//                     className='noBreak mt-0 mb-0 whenPrintFSSmall'
//                   />
//                 ))
//               : null}
//           </section>
//         ) : null} */
