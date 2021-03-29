import React from 'react';

const ConvertRatio = ({ srMtrl, caseUnit, onChange, purpose, name }) => {
  const addNumber = (e) => {
    e.preventDefault();
    const Max = 9999;
    if (e.target.value > Max || String(e.target.value).length > 5) {
      e.target.value = Max;
      onChange(e);
    } else {
      onChange(e)
    }
  };

  switch (purpose) {
    case 'mPrice':
      return (
        <div key={`unitConvertRatio${srMtrl._id}`} className='grid-2'>
          <div className='center-content mr-05'>
            <input
              type='number'
              id={srMtrl._id}
              name={name}
              onChange={addNumber}
              className='MPH-input mt-05'
              value={caseUnit.unitConvertRatio || ''}
              style={{ height: '2.2rem' }}
              min="0"
              max="9999"
              step="0.001"
            />
          </div>
          <div className='center-content mt-05'>
            {caseUnit.caseUnit} = 1 {srMtrl.purchaseUnit}
          </div>
        </div>
      )
    case 'quoMtrl':
      return (
        <div key={`unitConvertRatio${srMtrl._id}`} className='grid-2'>
          <div className='center-content'>
            {caseUnit.unitConvertRatio}
          </div>
          <div className='center-content'>
            {caseUnit.caseUnit} = 1 {srMtrl.purchaseUnit}
          </div>
        </div>
      )
    default:
  }

}

export default ConvertRatio
