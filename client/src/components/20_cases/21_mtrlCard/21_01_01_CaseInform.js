import React from 'react';

const CaseInform = ({ mtrl, style, no }) => {
  return (
    <div className='' style={style}>
      <div className='fs-large p-05'>
        {no} - {mtrl.item}
      </div>
      <div className='px-05 fs-small'>Supplier : {mtrl.supplier}</div>
      <div className='px-05 fs-small'>Ref No : {mtrl.ref_no}</div>
      <div className='px-05 fs-small'>Position : {mtrl.position}</div>
    </div>
  );
};

export default CaseInform;
