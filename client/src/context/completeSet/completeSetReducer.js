import {
  UPDATE_ERROR,
  OS_LIST_DOWNLOAD,
  OS_DOWNLOAD,
  CSPAGE_SWITCH,
  CS_CURRENT,
  DEFAULT,
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
      }
    case UPDATE_ERROR:
      return { ...state, csError: action.payload };
    case OS_LIST_DOWNLOAD:
      return { ...state, osHeads: action.payload };
    case OS_DOWNLOAD:
      return { ...state, currentOS: action.payload };
    case CSPAGE_SWITCH:
      return { ...state, csPage: action.payload };
    case CS_CURRENT:
      const targetId = action.payload;
      return {
        ...state,
        csPage: 'completeSet',
        currentCompleteSet: state.currentOS.caseList.find(({ _id }) => _id === targetId)
      }
    default:
  }
};
