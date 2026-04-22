const initialFilters = {
  projectId: null,
  assigneeId: null,
  status: 'all',
  taskType: 'all',
  search: '',
};

const initialState = {
  taskForm: {
    isOpen: false,
    mode: 'create',
    taskId: null,
  },
  filters: { ...initialFilters },
  loading: {
    tasks: false,
    users: false,
    projects: false,
    saveTask: false,
  },
  errors: {
    tasks: null,
    users: null,
    projects: null,
    form: null,
  },
};

export default function uiReducer(state = initialState, action) {
  switch (action.type) {
    case 'OPEN_TASK_FORM':
      return {
        ...state,
        taskForm: {
          isOpen: true,
          mode: action.payload.mode,
          taskId: action.payload.taskId,
        },
        errors: { ...state.errors, form: null },
      };
    case 'CLOSE_TASK_FORM':
      return {
        ...state,
        taskForm: {
          isOpen: false,
          mode: 'create',
          taskId: null,
        },
      };
    case 'SET_FILTERS':
      return {
        ...state,
        filters: { ...state.filters, ...action.payload },
      };
    case 'CLEAR_FILTERS':
      return {
        ...state,
        filters: { ...initialFilters },
      };
    case 'SET_LOADING': {
      const { key, value } = action.payload;
      return {
        ...state,
        loading: { ...state.loading, [key]: value },
      };
    }
    case 'SET_ERROR': {
      const { key, message } = action.payload;
      return {
        ...state,
        errors: { ...state.errors, [key]: message },
      };
    }
    case 'CLEAR_ERROR': {
      const { key } = action.payload;
      return {
        ...state,
        errors: { ...state.errors, [key]: null },
      };
    }
    default:
      return state;
  }
}
