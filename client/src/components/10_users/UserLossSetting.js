import React, { Fragment, useContext } from 'react';
import SqBtnLarge from '../../components/elements/btns/SqBtnLarge';
import UserContext from '../../context/user/userContext';
import GoBackBtnSpinSmall from '../elements/btns/GoBackBtnSpinSmall';

const UserLossSetting = ({ style }) => {
  const userContext = useContext(UserContext);
  const {
    users,
    togglePanel,
    openLossSets,
    openLossCategory,
    lossSetInputUpdate,
    lossInputUpdate,
    uploadLoss,
  } = userContext;

  const onClickLossSets = (e) => {
    e.target.name = 'lossSets';
    togglePanel(e);
  };

  const onClickLossCategory = (e) => {
    e.target.name = e.target.id;
    togglePanel(e);
  };

  const onChangeLossSet = (e) => {
    const num = e.target.value;

    if (num <= 9999999) {
      lossSetInputUpdate(e);
    } else {
      e.target.value = 9999999;
      lossSetInputUpdate(e);
    }
  };

  const onChange = (e) => {
    const num = e.target.value;
    if (num <= 99 && String(num).length < 5) {
      lossInputUpdate(e);
    } else {
      if (String(num).length > 4) {
        const negative = String(num).length - 4;
        e.target.value = String(num).slice(0, -negative);
      } else {
        e.target.value = 99;
        lossInputUpdate(e);
      }
    }
  };

  const onClickUploadLoss = (e) => {
    uploadLoss(e);
  };

  return (
    <div className='round-area bd-light bg-cp-1 mt-1' style={style}>
      <div className='text-primary fs-lead'>Setting loss</div>
      <div className='flexBox'>
        <GoBackBtnSpinSmall onClick={onClickLossSets} />
        <div className='ml-05'>Loss set</div>
      </div>

      {openLossSets ? (
        <div className='bd-light bg-cp-1-light round-area py-0'>
          {users
            ? users.length > 0
              ? ['set1', 'set2', 'set3', 'set4', 'set5'].map((i, idx) => {
                  return (
                    <div
                      key={`lossSetOf${i}`}
                      className='flexBox bd-light-b py-03 bg-cp-1-light'
                      style={i === 'set5' ? { borderBottom: 0 } : null}
                    >
                      <div
                        className='v-center-content'
                        style={{ flex: '0 0 3rem' }}
                      >
                        {`Set-${idx + 1}`} :{' '}
                      </div>
                      <div
                        className='center-content mr-05'
                        style={{ flex: '1 1' }}
                      >
                        {idx === 0
                          ? `0 ~ `
                          : `${
                              users[0].loss.sets[`${idx - 1}`][`set${idx}`] + 1
                            } ~ `}
                      </div>
                      <div className='mr-05' style={{ flex: '0 0 7rem' }}>
                        <input
                          id={`inputoflosssetof${idx}${i}`}
                          type='number'
                          name={i}
                          value={users[0].loss.sets[idx][i] || ''}
                          onChange={onChangeLossSet}
                        />
                      </div>
                      <div className='v-center-content' style={{ flex: '0 0' }}>
                        PCS
                      </div>
                    </div>
                  );
                })
              : 'Add new user first'
            : null}
        </div>
      ) : null}
      <div className='text-primary fs-lead'>Loss Category</div>
      {[
        'Fabric',
        'Woven',
        'Knit',
        'Interfacing',
        'Insulation',
        'Zipper',
        'Elastic',
        'Label',
        'Thread',
        'Other',
      ].map((i) => {
        return (
          <div>
            <div className='flexBox'>
              <GoBackBtnSpinSmall id={i} onClick={onClickLossCategory} />
              <div className='ml-05'>{i}</div>
            </div>
            {openLossCategory.includes(i) ? (
              <div className='bd-light bg-cp-1-light round-area py-0'>
                {users
                  ? users.length > 0
                    ? [
                        'loss1',
                        'loss2',
                        'loss3',
                        'loss4',
                        'loss5',
                        'loss6',
                      ].map((i2, idx2) => {
                        return (
                          <div
                            key={`lossGetagoryOf${i2}`}
                            className='flexBox bd-light-b py-03 bg-cp-1-light'
                            style={i2 === 'loss6' ? { borderBottom: 0 } : null}
                          >
                            <div
                              style={{ flex: '1 1 ' }}
                              className='mr-05 v-center-content'
                            >
                              {i2 == 'loss1'
                                ? `0`
                                : i2 == 'loss6'
                                ? `Above`
                                : Object.values(
                                    users[0].loss.sets[idx2 - 1]
                                  )[0]}
                              {' ~'}
                            </div>
                            <div
                              style={{ flex: '1 1' }}
                              className='h-scatter-content mr-05'
                            >
                              {i2 != 'loss6'
                                ? `${Object.values(users[0].loss.sets[idx2])[0]}
                                  PCS`
                                : `${
                                    Object.values(users[0].loss.sets[4])[0] + 1
                                  } PCS`}
                            </div>
                            <div className='mr-05' style={{ flex: '0 0 7rem' }}>
                              <input
                                type='number'
                                id={`input${i.toLowerCase()}`}
                                maxLength='4'
                                min='0'
                                max='99'
                                name={i2}
                                value={users[0].loss[i.toLowerCase()][i2] || ''}
                                onChange={onChange}
                              />
                            </div>
                            <div className='center-content'>%</div>
                          </div>
                        );
                      })
                    : 'Add new user first'
                  : null}
              </div>
            ) : null}
          </div>
        );
      })}

      <div className='h-scatter-content'>
        <div></div>
        <SqBtnLarge
          className='mt-1'
          onClick={onClickUploadLoss}
          label={`Save`}
        />
      </div>
    </div>
  );
};

export default UserLossSetting;
