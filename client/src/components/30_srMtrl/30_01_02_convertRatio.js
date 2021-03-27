import React from 'react';

const ConvertRatio = ({ srMtrl, caseUnit, onChange, purpose, name }) => {
  switch (purpose) {
    case 'mPrice':
      return (
        <div key={`unitConvertRatio${srMtrl._id}`} className='grid-2'>
          <div className='center-content mr-05'>
            <input
              type='number'
              id={srMtrl._id}
              placeholder='.'
              name={name}
              onChange={onChange}
              className='MPH-input mt-05'
              value={caseUnit.unitConvertRatio || ''}
              style={{ height: '2.2rem' }}
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
