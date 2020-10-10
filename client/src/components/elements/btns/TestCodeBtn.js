import React from 'react';

const TestCodeBtn = ({ label, name }) => {
  const type_1 = () => {
    const p = new Promise((resolve) => {
      setTimeout(() => {
        resolve('The message sent by Promise');
      }, 5000);
    });

    Promise.all([p]).then((result) => {
      console.log('The set time out ', result[0]);
    });
  };

  const type_1_error = () => {
    const p = new Promise((resolve, reject) => {
      let test = false;
      setTimeout(() => {
        if (test) {
          resolve('The message sent by Promise');
        } else {
          reject('Something went wrong');
        }
      }, 3000);
    }).catch((err) => {
      return err;
    });

    Promise.all([p]).then((result) => {
      console.log('The set time out ', result[0]);
    });
  };

  const type_2 = async () => {
    let p = '2';

    await new Promise((resolve) => {
      setTimeout(() => {
        p = 'The message sent by Promise';
        return resolve(p);
      }, 5000);
    });

    console.log('The set time out', p);
  };

  const type_3 = async () => {
    let por = await new Promise((resolve) => {
      setTimeout(() => {
        let p = 'The message sent by Promise';
        resolve(p);
      }, 5000);
    }).then((result) => {
      return result;
    });
    console.log('the por', por);
  };

  const type_3_err = async () => {
    let test = false;
    try {
      let por = await new Promise((resolve, reject) => {
        setTimeout(() => {
          let p = 'The message sent by Promise';
          if (test) {
            resolve(p);
          } else {
            reject('Something went wrong');
          }
        }, 2000);
      }).then((result) => {
        return result;
      });
      console.log('the por', por);
    } catch (err) {
      console.log('err', err);
    }
  };

  const type_4 = async () => {
    const por = await new Promise((resolve) => {
      setTimeout(() => {
        let p = 'The message sent by Promise';
        resolve(p);
      }, 3000);
    }).then((result) => {
      result = result + ' and Then';
      return result;
    });

    Promise.all([por]).then((por) => {
      console.log('The result :', por[0]);
    });
  };

  const type_5 = async () => {
    let p = 2;
    await new Promise((resolve) => {
      setTimeout(() => {
        p = 'The message sent by Promise';
        return resolve(p);
      }, 3000);
    }).then(() => {
      setTimeout(() => {
        p = p + ' and the Then()';
      }, 3000);
    });

    setTimeout(() => {
      console.log('The result ', p);
    }, 7000);
  };

  const type_6 = async () => {
    const pro = await new Promise((resolve, reject) => {
      setTimeout(() => {
        let test = false;
        let p = 'The message sent by Promise';
        if (test) {
          return resolve(p);
        } else {
          return reject('Something went wrong');
        }
      }, 2000);
    }).catch((err) => {
      return err;
    });

    console.log('The result', pro);
  };

  const type_7 = async () => {
    let pro = 1;
    let arr = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1];

    await arr.map(async (i) => {
      setTimeout(() => {
        pro = pro + i;
        return pro;
      }, 500);
    });

    console.log('The result', pro);
  };

  return (
    <button
      name={name}
      className='btn btn-sq sq-block center-content'
      onClick={type_7}
    >
      {label}
    </button>
  );
};

export default TestCodeBtn;
