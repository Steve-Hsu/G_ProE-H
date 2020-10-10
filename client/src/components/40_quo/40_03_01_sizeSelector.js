import React, { useContext, Fragment } from 'react';
import QuoContext from '../../context/quo/quoContext';
import SqBtnLarge from '../elements/btns/SqBtnLarge';

const SizeSelector = ({ sizes, className }) => {
  const quoContext = useContext(QuoContext);

  const { currentQuoForm, updateQuoSize, quotation } = quoContext;

  const quoFormId = currentQuoForm._id;

  const onClick = (e) => {
    e.preventDefault();
    if (currentQuoForm._id !== null) {
      const sizeValue = e.target.name;
      updateQuoSize(quoFormId, sizeValue);
    }
  };
  const btnClickedStyle = (subject) => {
    const quoForm = quotation.quoForms.find(({ _id }) => _id === quoFormId);
    const haveTheQuoSize = quoForm.quoSizes.includes(subject);
    if (haveTheQuoSize) {
      return {
        color: 'var(--primary-text)',
        background: 'var(--primary-color)',
        flex: '1 0 3.5rem',
      };
    } else {
      return {
        flex: '1 0 3.5rem',
      };
    }
  };

  return (
    <div className={`flexBox bd-radius-s ${className}`}>
      {sizes
        ? sizes.map((i) => {
            return (
              <SqBtnLarge
                key={`sizeSelector${i.id}`}
                name={i.gSize}
                onClick={onClick}
                label={i.gSize}
                style={btnClickedStyle(i.gSize)}
                className='mt-05 mx-03'
              />
              // <button
              //   key={`sizeSelector${i.id}`}
              //   name={i.gSize}
              //   type='button'
              //   className='btn'
              //   onClick={onClick}
              //   style={btnClickedStyle(i.gSize)}
              // >
              //   {i.gSize}
              // </button>
            );
          })
        : null}
    </div>
  );
};

export default SizeSelector;
