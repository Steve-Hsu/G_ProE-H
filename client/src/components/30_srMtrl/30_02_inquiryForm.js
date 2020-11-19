import React, { useContext } from 'react'
import NoAndDateHeader from '../elements/formPart/NoAndDateHeader';
import FormTitle from '../elements/formPart/FormTitle';
import SrMtrlContext from '../../context/srMtrl/srMtrlContext';
import InquiryItem from '../30_srMtrl/30_02_01_inquiryItem';

const InquiryForm = () => {
    const srMtrlContext = useContext(SrMtrlContext);
    const { srMtrls, inquirySupplier } = srMtrlContext

    let mtrlIdex = 0

    const loopingMtrls = inquirySupplier === null ? srMtrls : srMtrls.filter((m) => {
        var re = new RegExp(m.supplier, 'i')
        return (
            re.test(inquirySupplier)
        )
    })

    return (
        <div >
            <NoAndDateHeader />
            <FormTitle title='Inquiry' />
            <div className='fs-lead'>
                To : {inquirySupplier ? inquirySupplier.toUpperCase() : 'All suppliers'}
            </div>
            <div className='grid-Inquiry-Mtrl bd-light bg-cp-2-light m-0 p-0 fs-small'>
                {[
                    'No',
                    'Ref_No',
                    'Description',
                    `Price`,
                    `MOQ`,
                    `MOQ Price`,
                ].map((i) => (
                    <div
                        key={`mQuosTitle${i}`}
                        className='bd-light v-center-content p-05 f-wrap'
                    >
                        {i}
                    </div>
                ))}
            </div>
            {loopingMtrls.map((i) => {
                return i.mPrices.map((mP) => {
                    mtrlIdex++
                    return (
                        <InquiryItem key={`inquiryMtrl${mP.id}`}
                            srMtrl={i} mPrice={mP}
                            idx={mtrlIdex}
                            className={'noBreak whenPrintFSSmall'} />
                    )
                })
            })}
        </div>
    )
}

export default InquiryForm
