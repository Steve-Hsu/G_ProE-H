import { SEARCHBAR_TOGGLE_LIST, SEARCHBAR_SEARCH_INDEX } from '../types';

export default (state, action) => {
  switch (action.type) {
    case SEARCHBAR_SEARCH_INDEX:
      return {
        ...state,
        isQuery: true,
        indexList: action.payload,
      };
    case SEARCHBAR_TOGGLE_LIST:
      return {
        ...state,
        isQuery: false,
        indexList: [],
      };
    default:
  }
};
