import React, { useContext } from 'react'
import CompleteSetContext from '../../context/completeSet/completeSetContext'
const CompleteSetPage = () => {
    const completeSetContext = useContext(CompleteSetContext)
    const { currentCompleteSet } = completeSetContext
    const { caseId, cNo, style, client, caseType, cWays, sizes, gQtys, mtrls } = currentCompleteSet
    return (
        <div>
            yes
        </div>
    )
}

export default CompleteSetPage
