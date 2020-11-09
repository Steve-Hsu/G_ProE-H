import {
  UPDATE_ERROR,
  OS_LIST_DOWNLOAD,
  OS_DOWNLOAD,
  CSPAGE_SWITCH,
  CS_CURRENT,
  DEFAULT,
  NEW_CS_ORDER,
} from '../types';

export default (state, action) => {
  switch (action.type) {
    case DEFAULT:
      return {
        osHeads: [],
        csPage: null,
        currentOS: {},
        currentCompleteSet: {},
        csError: null,
        newCsOrder: null,
      }
    case UPDATE_ERROR:
      return { ...state, csError: action.payload };
    case OS_LIST_DOWNLOAD:
      return { ...state, osHeads: action.payload };
    case OS_DOWNLOAD:
      return {
        ...state,
        currentOS: {
          ...action.payload,
          caseList: action.payload.caseList.sort((a, b) => {
            if (a.cNo < b.cNo) {
              return -1
            }
            if (a.cNo > b.cNo) {
              return 1
            }
            return 0;
          })
        },
        newCsOrder: action.payload.csOrder.length === 0 ? action.payload.caseList.sort((a, b) => {
          if (a.cNo < b.cNo) {
            return -1
          }
          if (a.cNo > b.cNo) {
            return 1
          }
          return 0;
        }).map((c) => {
          console.log("in the reducde", c)
          return c.cNo
        }) :
          action.payload.csOrder
      };
    case CSPAGE_SWITCH:
      return { ...state, csPage: action.payload };
    case CS_CURRENT:
      const targetId = action.payload;
      return {
        ...state,
        csPage: 'completeSet',
        currentCompleteSet: state.currentOS.caseList.find(({ _id }) => _id === targetId)
      }
    case NEW_CS_ORDER:
      return {
        ...state,
        newCsOrder: action.payload
      }
    default:
  }
};
