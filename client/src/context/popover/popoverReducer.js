import {
  TOGGLE_POPOVER,
  CURRENT_ADD,
  CURRENT_DELETE,
  TOGGLE_LOADING,
  ADD_DOUBLECHECK_VALUE,
} from '../types';

export default (state, action) => {
  switch (action.type) {
    case TOGGLE_POPOVER:
      return {
        ...state,
        popover: action.payload,
      };
    case CURRENT_ADD:
      return {
        ...state,
        current: action.payload,
      };
    case CURRENT_DELETE:
      return {
        ...state,
        doubleCheck: null,
        current: null,
      };
    case TOGGLE_LOADING:
      return {
        ...state,
        isLoading: !state.isLoading,
      };
    case ADD_DOUBLECHECK_VALUE:
      return {
        ...state,
        doubleCheck: action.payload,
      };
    default:
  }
};
