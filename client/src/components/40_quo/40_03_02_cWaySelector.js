import React, { useContext, Fragment } from 'react';
import QuoContext from '../../context/quo/quoContext';
import SqBtnLarge from '../elements/btns/SqBtnLarge';

const CWaySelector = ({ cWays, className }) => {
  const quoContext = useContext(QuoContext);

  const { currentQuoForm, updateQuocWay, quotation } = quoContext;

  const quoFormId = currentQuoForm._id;

  const onClick = (e) => {
    e.preventDefault();
    if (currentQuoForm.id !== null) {
      const sizeValue = e.target.name;
      updateQuocWay(quoFormId, sizeValue);
    }
  };

  const btnClickedStyle = (subject) => {
    const quoForm = quotation.quoForms.find(({ _id }) => _id === quoFormId);
    let haveTheQuocWay = [];
    if (quoForm.quocWays) {
      haveTheQuocWay = quoForm.quocWays.includes(subject);
    }
    if (haveTheQuocWay) {
      return {
        color: 'var(--primary-text)',
        background: 'var(--primary-color)',
      };
    } else {
      return {};
    }
  };

  return (
    <div className={`flexBox ${className}`}>
      {cWays
        ? cWays.map((i) => {
            return (
              <SqBtnLarge
                key={`sizeSelector${i.id}`}
                name={i.gClr}
                onClick={onClick}
                style={btnClickedStyle(i.gClr)}
                label={i.gClr}
                className='mt-05 mx-03 w-100'
              />
            );
          })
        : null}
    </div>
  );
};

export default CWaySelector;
