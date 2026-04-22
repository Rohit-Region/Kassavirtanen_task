import { createSelector } from 'reselect';

const selectTasksState = (state) => state.tasks;
const selectUsersState = (state) => state.users;
const selectProjectsState = (state) => state.projects;

export const selectAllTasks = createSelector([selectTasksState], (tasks) =>
  tasks.allIds.map((id) => tasks.byId[id]).filter(Boolean)
);

export const selectUsersArray = createSelector([selectUsersState], (users) =>
  users.allIds.map((id) => users.byId[id]).filter(Boolean)
);

export const selectProjectsArray = createSelector([selectProjectsState], (projects) =>
  projects.allIds.map((id) => projects.byId[id]).filter(Boolean)
);

export const selectTaskForm = (state) => state.ui.taskForm;
export const selectFilters = (state) => state.ui.filters;
export const selectLoading = (state) => state.ui.loading;
export const selectErrors = (state) => state.ui.errors;

export const selectTaskById = (taskId) => (state) =>
  taskId ? state.tasks.byId[taskId] : null;

export const selectTasksWithAssignees = createSelector(
  [selectAllTasks, selectUsersState],
  (taskList, users) =>
    taskList.map((task) => ({
      ...task,
      assigneeName: task.assigneeId ? users.byId[task.assigneeId]?.name ?? null : null,
    }))
);
