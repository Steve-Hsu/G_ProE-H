import React from 'react';

const SizeTable = ({ sizes, mtrl, style }) => {
  const singleSPEC = () => {
    return (
      <div style={style} className='fs-small'>
        <div className='flexBox bd-light'>
          <div style={{ flex: '0 1 3rem' }} className='bd-light-r'>
            <div className='px-05 bg-fade'>Size</div>
            {sizes.map((i) => {
              return (
                <div key={`size${i.id}`} className='px-05 bd-light-t'>
                  {i.gSize}
                </div>
              );
            })}
          </div>
          <div style={{ flex: '0 1 4rem' }} className='bd-light-r'>
            <div className='px-05 bg-fade'>Consumption</div>
            {sizes.map((i) => {
              const cspt = mtrl.cspts.find(({ size }) => size === i.id);
              return (
                <div key={`consumptionOf${i.id}`} className='px-05 bd-light-t'>
                  {cspt.cspt} {cspt.unit}
                </div>
              );
            })}
          </div>
          <div style={{ flex: '1 1' }}>
            <div className='px-05 bg-fade'>SPEC</div>
            <div className='px-05 bd-light-t'>{mtrl.cspts[0].mSizeSPEC}</div>
          </div>
        </div>
      </div>
    );
  };

  const multipleSPEC = () => {
    return (
      <div style={style} className='fs-small'>
        <div className='flexBox'>
          <div style={{ flex: '0 1 3rem' }}>
            {' '}
            <div className='px-05 bg-fade'>Size</div>
          </div>
          <div style={{ flex: '0 1 4rem' }}>
            <div className='px-05 bg-fade'>Consumption</div>
          </div>
          <div style={{ flex: '1 1' }}>
            <div className='px-05 bg-fade'>SPEC</div>
          </div>
        </div>
        {sizes.map((i) => {
          const cspt = mtrl.cspts.find(({ size }) => size === i.id);
          const SPEC = cspt.mSizeSPEC;
          return (
            <div
              key={`multipleSize${i.id}`}
              className='flexBox bd-light bd-no-t'
              style={style}
            >
              <div style={{ flex: '0 1 3rem' }} className='bd-light-r '>
                {' '}
                <div className='px-05'>{i.gSize}</div>
              </div>
              <div style={{ flex: '0 1 4rem' }} className='bd-light-r '>
                <div className='px-05'>
                  {' '}
                  {cspt.cspt} {cspt.unit}
                </div>
              </div>
              <div style={{ flex: '1 1' }} className=''>
                <div className='px-05 '>{SPEC}</div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return mtrl.multipleSPEC ? multipleSPEC() : singleSPEC();
};

export default SizeTable;

// {mtrl.multipleSPEC ? (
//       sizes.map((i) => {
//         const SPEC = mtrl.cspts.find(({ size }) => size === i.id)
//           .mSizeSPEC;
//         return (
//           <div key={`specOf${i.id}`} className='px-05 bd-light-t'>
//             {SPEC}
//           </div>
//         );
//       })
//     ) : (
