import React from 'react';
import CaseInform from './21_01_01_CaseInform';
import SizeTable from './21_01_02_SizeTable';
import CWayTable from './21_01_03_CWayTable';

const CardItem = ({ cNo, style, cWays, sizes, mtrl, no }) => {
  return (
    <div className='mt-05 noBreak'>
      <div className='fw-bold fs-small fc-fade-dark'>
        {style} - {cNo}
      </div>
      <div className='bd-light-2px '>
        <div className='flexBox'>
          <CaseInform mtrl={mtrl} style={{ flex: '1 1 50%' }} no={no} />
          <SizeTable sizes={sizes} mtrl={mtrl} style={{ flex: '1 1 50%' }} />
        </div>
        <CWayTable cWays={cWays} mtrlColors={mtrl.mtrlColors} />
      </div>
    </div>
  );
};

export default CardItem;
