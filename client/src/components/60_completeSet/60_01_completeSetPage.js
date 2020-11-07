import React, { useContext } from 'react'
import CompleteSetContext from '../../context/completeSet/completeSetContext'

//component
import SizeColorChart from '../../components/elements/chart/sizeColorChart'
const CompleteSetPage = () => {
    const completeSetContext = useContext(CompleteSetContext)
    const { currentCompleteSet } = completeSetContext
    const { caseId, cNo, style, client, caseType, cWays, sizes, gQtys, mtrls } = currentCompleteSet
    return (
        <div>
            <SizeColorChart purpose='completeSet' sizes={sizes} cWays={cWays} gQtys={gQtys} />
        </div>
    )
}

export default CompleteSetPage
