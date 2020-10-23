import React from 'react'
import TopLabelTiny from '../elements/Label/TopLabelTiny';
import DeleteBtnSmall from '../elements/btns/DeleteBtnSmall';


const MtrlLeadTimeItem = ({ id, caseMtrlId, date, qty, unit, idx, updateLeadTime, deleteLeadTime }) => {

   const onChange = (e) => {
      e.preventDefault();
      updateLeadTime(e, caseMtrlId);
   }

   const dateFormat = () => {
      const d = new Date(date)
      const value = d.toISOString().slice(0, 10)
      return value
   }

   const deleteBtn = (e) => {
      e.preventDefault();
      deleteLeadTime(e)
   }

   const numberUnit = (n) => {
      let check = String(n)
      switch (check) {
         case '1':
            return 'st';
         case '2':
            return 'nd';
         case '3':
            return 'rd';
         default:
            return 'th'
      }
   }

   return (
      <div className='card bg-gray-2 bd-radius-s bd-light hover-cp-2-light flexBox py-0 px-05'>
         <div className='fs-large mx-1 my-0 center-content ' style={{ height: '4.5rem' }}>
            <div>{idx + 1}<span className='fs-normal'>{numberUnit(idx + 1)}</span></div>
         </div>
         <div className='mr-05' style={{ flex: '1 1 auto' }}>
            <TopLabelTiny label='Date' />
            {/* <div style={{ flex: '0 1 3rem' }}>Date : </div> */}
            {/* <div className='w-100'> */}
            <input
               type='date'
               id={id}
               name='date'
               onChange={onChange}
               value={dateFormat() || ''}
            />
            {/* </div> */}
         </div>
         <div className='mr-05' style={{ flex: '1 1 auto' }}>
            <TopLabelTiny label='Qantity' />
            {/* <div style={{ flex: '0 1 3rem' }}>Qty : </div> */}

            <input
               type='number'
               id={id}
               name='qty'
               min='0'
               onChange={onChange}
               value={qty || ''}
            />


         </div>
         <div style={{ width: '25px' }}>
            <DeleteBtnSmall name={caseMtrlId} value={id} onClick={deleteBtn} />
         </div>

      </div>
   )
}

export default MtrlLeadTimeItem
