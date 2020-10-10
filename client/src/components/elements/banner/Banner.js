import React from 'react';

const Banner = ({ purpose, onClick, label }) => {
  const result = (purpose) => {
    switch (purpose) {
      case 'case':
      case 'mPrice':
        return (
          <div className='card bd-radius-s bd-light bg-cp-1 w-100 h-20vh'>
            <a onClick={onClick} className='cursor'>
              <i className='fas fa-sign-out-alt'></i>{' '}
              <span className='hide-lg'>{label}</span>
            </a>
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
          <div className='card bd-radius-s bd-light bg-cp-1 w-100 h-20vh'>
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
