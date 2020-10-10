import React, { useContext } from 'react';
import QuoContext from '../../context/quo/quoContext';
import DeleteBtnSmall from '../elements/btns/DeleteBtnSmall';

const QuoOtherEx = ({ otherExpense, className }) => {
  const quoContext = useContext(QuoContext);

  const {
    isQuotating,
    switchQuoFormSelector,
    currentQuoForm,
    updateCurrentQuoForm,
  } = quoContext;
  const {
    _id,
    quoNo,
    quoSizes,
    quocWays,
    currency,
    cmpts,
    mQuos,
    otherExpenses,
    fob,
  } = currentQuoForm;

  const onClick = (e) => {
    e.preventDefault();
    updateCurrentQuoForm(e);
  };

  const onChange = (e) => {
    e.preventDefault();
    updateCurrentQuoForm(e);
  };

  const addNumber = (e) => {
    e.preventDefault();
    const num = e.target.value;
    const Max = 9999999;
    if (String(num).length > String(Max).length) {
      e.target.value = Max;
      updateCurrentQuoForm(e);
    } else {
      updateCurrentQuoForm(e);
    }
  };

  //@ Style
  const deleteBtnPosition = {
    // top: ' 50%',
    // // left: '100%',
    // transform: 'translate(0, -1rem)',
  };

  return (
    // <div className='mb-1 p-1 card'>
    <div
      className={`grid-Quo-otherExpanse m-0 p-0 bd-light bd-no-t ${className}`}
    >
      <div className='bd-light bd-no-t v-center-content'>
        <div className='noPrint p-05' style={{ width: '50px' }}>
          <DeleteBtnSmall
            name='deleteOtherExpense'
            value={otherExpense.id}
            style={deleteBtnPosition}
            onClick={onClick}
            className='noPrint m-0'
          />
        </div>

        <input
          type='text'
          id={`costName${otherExpense.id}`}
          name='costName'
          maxLength='30'
          value={otherExpense.costName || ''}
          onChange={onChange}
          className='whenPrintNoBorder whenPrintFSSmall bd-no'
        />
      </div>
      <div className='bd-light bd-no-t v-center-content '>
        <input
          type='text'
          id={`costDescription${otherExpense.id}`}
          name='costDescription'
          maxLength='200'
          value={otherExpense.costDescription || ''}
          onChange={onChange}
          className='whenPrintNoBorder whenPrintFSSmall bd-no'
        />
      </div>
      <div className='bd-light bd-no-t v-center-content'>
        <div className='h-scatter-content'>
          <input
            type='number'
            id={`otherExpenseCost${otherExpense.id}`}
            name='otherExpenseCost'
            min='0'
            max='9999999'
            step='.01'
            value={otherExpense.cost || ''}
            onChange={addNumber}
            className='whenPrintNoBorder whenPrintFSSmall bd-no'
          />
        </div>
      </div>
    </div>
    // </div>
  );
};

export default QuoOtherEx;
