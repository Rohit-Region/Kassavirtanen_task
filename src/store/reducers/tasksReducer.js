const normalizeTasks = (tasks) => {
  const byId = {};
  const allIds = [];
  for (const task of tasks) {
    byId[task.id] = task;
    allIds.push(task.id);
  }
  return { byId, allIds };
};

const initialState = {
  byId: {},
  allIds: [],
};

export default function tasksReducer(state = initialState, action) {
  switch (action.type) {
    case 'FETCH_TASKS_SUCCESS':
      return normalizeTasks(action.payload);
    default:
      return state;
  }
}
