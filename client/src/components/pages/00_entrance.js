import React from 'react'


const Entrance = (props) => {
    const goDirector = () => {
        //Jump to other page while keeping authenticated
        props.history.push('/api/case/director');
    };
    return (
        <div className='container-with-navbar backgroundImg h-100vh w-100vw  '>
            <div className='grid-2'>
                <div>
                    <div style={{ position: 'absolute', top: '0.5rem', left: '2.2rem' }}>
                        <h1 className='syen-regular'>
                            <span className='fc-cp-2'>G</span><span >-Pro</span>
                            <span className='fc-gray-5 '>E</span>
                        </h1>
                    </div>

                </div>
                <div style={{ display: 'grid', placeItems: 'center start', opacity: '1' }} className='h-80vh'>
                    <div className='fs-lead bg-blurGlass round-area' style={{ lineHeight: '200%' }}>
                        {/* A shortcut from making BOM to order summary. */}
                        <div className='fs-small'>App for garment industry</div>
                        <div className='fs-large fw-bold syen-regular'>
                            Simplify the process from BOM to PO.
                        </div>
                        <div>
                            <a onClick={goDirector} className='cursor'>
                                <i className='fas fa-sign-out-alt'></i>{' '}
                                <span className='hide-lg'>Get Start</span>
                            </a>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}

export default Entrance
