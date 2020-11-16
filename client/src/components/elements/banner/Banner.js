import React from 'react';

const Banner = ({ purpose, onClick, label, title, smTitle, className }) => {

  const result = (purpose) => {
    switch (purpose) {
      case 'case':
      case 'mPrice':
      case 'completeset':
        return (
          <div className={`card hover-moveUp  bd-radius-s bd-light w-100 h-7rem flexBox ${className}`}>
            <div className='fs-max f-lineHeight-70' style={{ flex: '1 1 auto' }}>
              {title}{smTitle ? (<span className='ml-05 fs-halfMax'>{smTitle}</span>) : null}
            </div>
            <div style={{ flex: '0 1 13rem' }}>
              <a onClick={onClick} className='cursor'>
                <i className='fas fa-sign-out-alt'></i>{' '}
                <span className='hide-lg'>{label}</span>
              </a>
            </div>
          </div>
        );
      case 'quotation':
      case 'purchase':
        let option1 = '';
        let option2 = '';
        if (purpose === 'quotation') {
          option1 = 'material';
          option2 = 'garment';
        } else if (purpose === 'purchase') {
          option1 = 'caseSelector';
          option2 = 'osSelector';
        }
        return (
          <div className={`card hover-moveUp bd-radius-s bd-light w-100 h-7rem flexBox ${className}`}>
            <div className='fs-max f-lineHeight-70' style={{ flex: '1 1 auto' }}>
              {title}{smTitle ? (<span className='ml-05 fs-halfMax'>{smTitle}</span>) : null}
            </div>
            <div style={{ flex: '0 1 13rem' }}>
              <div>
                <a onClick={onClick[0][option1]} className='cursor'>
                  <i className='fas fa-sign-out-alt'></i>{' '}
                  <span className='hide-lg'>{label[0]}</span>
                </a>
              </div>
              <div>
                <a onClick={onClick[1][option2]} className='cursor'>
                  <i className='fas fa-sign-out-alt'></i>{' '}
                  <span className='hide-lg'>{label[1]}</span>
                </a>
              </div>
            </div>
          </div>
        );
      // case 'purchase':
      //   return (
      //     <div className='card bd-radius-s bd-light bg-cp-1 w-100 h-20vh'>
      //       <div>
      //         <a onClick={onClick[0].materialQuo} className='cursor'>
      //           <i className='fas fa-sign-out-alt'></i>{' '}
      //           <span className='hide-lg'>{label[0]}</span>
      //         </a>
      //       </div>
      //       <div>
      //         <a onClick={onClick[1].garmentQuo} className='cursor'>
      //           <i className='fas fa-sign-out-alt'></i>{' '}
      //           <span className='hide-lg'>{label[1]}</span>
      //         </a>
      //       </div>
      //     </div>
      //   );
      default:
    }
  };

  return result(purpose);
};

export default Banner;
