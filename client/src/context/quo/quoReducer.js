import {
  // CASE_LIST_DOWNLOAD,
  QUOFORM_SWITCH,
  QUOFORM_SELECTOR_SWITCH,
  QUOFORM_DOWNLOAD,
  QUOTATION_DOWNLOAD,
  QUOPAGE_SWITCH,
  QUOFORM_DELETE,
  QUOFORM_UPDATE,
  CURRETQUOFORM_UPDATE,
  CURRETQUOFORM_MQUOS_UPDATE,
  UPDATE_ERROR,
  QUOFORM_REPLACE_ONE,
  DEFAULT,
} from '../types';

export default (state, action) => {
  switch (action.type) {
    case DEFAULT:
      return {
        quotateFor: null,
        isQuotating: null,
        openQuoForm: null,
        quotation: {
          quoForms: [],
          theCase: null,
        },
        currentQuoForm: null,
        quoError: null,
      }
    // case CASE_LIST_DOWNLOAD:
    //   return { ...state, caseList: action.payload };
    case QUOFORM_SELECTOR_SWITCH:
      return { ...state, isQuotating: action.payload };
    case QUOFORM_SWITCH:
      if (action.payload) {
        return {
          ...state,
          openQuoForm: action.payload,
          currentQuoForm: state.quotation.quoForms.find(({ _id }) => {
            return _id === action.payload;
          }),
        };
      } else {
        return {
          ...state,
          openQuoForm: null,
          currentQuoForm: null
        };
      }

    case QUOFORM_DOWNLOAD:
      return {
        ...state,
        quotation: {
          ...state.quotation,
          versionNum: action.payload.versionNum,
          quoForms: action.payload.quoForms,
        },
      };
    case QUOTATION_DOWNLOAD:
      return { ...state, quotation: action.payload };
    case QUOPAGE_SWITCH:
      return { ...state, quotateFor: action.payload };
    case QUOFORM_DELETE:
      return {
        ...state,
        quotation: {
          ...state.quotation,
          quoForms: state.quotation.quoForms.filter((quoForm) => {
            return quoForm._id !== action.payload;
          }),
        },
      };
    case QUOFORM_UPDATE:
      return {
        ...state,
        quotation: {
          ...state.quotation,
          quoForms: action.payload,
        },
      };
    case QUOFORM_REPLACE_ONE:
      return {
        ...state,
        quotation: {
          ...state.quotation,
          quoForms: state.quotation.quoForms.map((qF) => {
            if (qF._id === action.payload._id) {
              qF = action.payload;
            }
            return qF
          }),
        },
      };
    case CURRETQUOFORM_UPDATE:
      return {
        ...state,
        currentQuoForm: action.payload,
      };
    case CURRETQUOFORM_MQUOS_UPDATE:
      return {
        ...state,
        currentQuoForm: {
          ...state.currentQuoForm,
          mQuos: action.payload.mQuos,
          mQuosTotal: action.payload.mQuosTotal,
          fob: Math.round(((
            Number(state.currentQuoForm.cm) +
            Number(state.currentQuoForm.otherExpensesTotal) +
            Number(action.payload.mQuosTotal)
          ) + Number.EPSILON) * 100) / 100

        },
      };
    case UPDATE_ERROR:
      return {
        ...state,
        quoError: action.payload
      }

    default:
  }
};
