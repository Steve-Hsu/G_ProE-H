import React from 'react'
import PropTypes from 'prop-types';
import Size from '../../20_cases/1_2_Size';
import ColorWay from '../../20_cases/1_1_ColorWay';
import Qty from '../../20_cases/1_3_Qty';



const SizeColorChart = ({ purpose, sizes, cWays, gQtys }) => {
   const SizesColumnSize = () => {
      if (sizes.length < 6) {
         return 5;
      } else {
         return sizes.length;
      }
   };

   const breakDownTable = {
      display: 'grid',
      gridTemplateColumns: `repeat(${SizesColumnSize()}, 1fr)`,
      gridGap: '0',
   };

   const cWayOrder = () => {
      let arr = []
      cWays.map((cWay) => {
         arr.push(cWay.id)
      })
      return arr
   }


   return (
      <section className='row-gap-md round-card bg-cp-1 bd-light'>
         <div className='grid-1-07-6'>
            <div></div>
            <div></div>
            <div style={breakDownTable}>
               {sizes.map((size) => (
                  <Size key={size.id} size={size} gQtys={gQtys} purpose={purpose} />
               ))}
            </div>
         </div>
         <div className='grid-1-07-6 '>
            <div>
               {cWays.map((cWay, idx) => (
                  <ColorWay key={cWay.id} cWay={cWay} purpose={purpose} idx={idx} />
               ))}
            </div>
            <div className='bd-cp-2-r-2px-dotted'>
               {cWays.map((cWay) => {
                  let subtotal = 0;
                  gQtys.map((gQty) => {
                     if (gQty.cWay === cWay.id) {
                        subtotal = subtotal + Number(gQty.gQty);
                     }
                     return subtotal;
                  });
                  return (
                     <div
                        key={`subtotalOf${cWay.id}`}
                        style={{
                           height: 'var(--btn-h-m)',
                        }}
                        className='mt-1 bd-cp-2-b-2px fs-tiny fc-cp-2-c'
                     >
                        <div
                           style={{ textAlign: 'right' }}
                           className='pr-1 pt-07'
                        >
                           {' '}
                           {subtotal.toLocaleString()}
                        </div>
                     </div>
                  );
               })}
            </div>
            {/* <div style={breakDownTable}>
               {sizes.map((size) => (
                  <div
                     key={`Qty${size.id}`}
                     className='bd-cp-2-r-2px-dotted'
                  >
                     {gQtys.map((gQty) => (
                        <Qty key={gQty.id} size={size} gQty={gQty} purpose={purpose} />
                     ))}
                  </div>
               ))}
            </div> */}
            <div style={breakDownTable}>
               {sizes.map((size) => (
                  <div
                     key={`Qty${size.id}`}
                     className='bd-cp-2-r-2px-dotted'
                  >
                     {cWays.map((cWay) => {

                        return gQtys.map((gQty) => {

                           if (gQty.size === size.id && gQty.cWay === cWay.id) {
                              return (
                                 <Qty key={gQty.id} size={size} gQty={gQty} purpose={purpose} />
                              )
                           }

                        })

                     }

                     )}
                  </div>
               ))}
            </div>
         </div>
      </section>
   )
}


SizeColorChart.propTypes = {
   //Set the variable, the company, passedin must be an array.
   purpose: PropTypes.string.isRequired,
   sizes: PropTypes.array.isRequired,
   cWays: PropTypes.array.isRequired,
   gQtys: PropTypes.array.isRequired,

};


export default SizeColorChart
