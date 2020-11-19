import React from 'react'

const InquiryItem = ({ srMtrl, mPrice, idx, className }) => {
    return (
        <div className={`grid-Inquiry-Mtrl m-0 p-0 bd-light bd-no-t ${className}`}>
            {/* No */}
            <div className='bd-light bd-no-t v-center-content px-05 fs-small'>{idx}</div>
            {/* Ref_no */}
            <div className='bd-light bd-no-t v-center-content px-05'>{srMtrl.ref_no}</div>
            {/* Description */}
            <div className='bd-light bd-no-t v-center-content px-05'>{
                mPrice.sizeSPEC && mPrice.mColor ? `${mPrice.sizeSPEC} | ${mPrice.mColor}` : mPrice.sizeSPEC || mPrice.mColor}
            </div>
            {/* Unit Price */}
            <div className='bd-light bd-no-t v-center-content px-05'>{mPrice.mPrice ? `${mPrice.mPrice} ${mPrice.currency} / ${mPrice.unit}` : null}</div>
            {/* MOQ */}
            <div className='bd-light bd-no-t v-center-content px-05'>{mPrice.moq ? `${mPrice.moq} ${mPrice.unit}` : null}</div>
            {/* MOV */}
            <div className='bd-light bd-no-t v-center-content px-05'>{mPrice.moqPrice ? `${mPrice.moqPrice} ${mPrice.currency} / ${mPrice.unit}` : null}</div>
        </div>
    )
}

export default InquiryItem
