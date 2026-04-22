import { combineReducers } from 'redux';
import tasksReducer from './tasksReducer';
import usersReducer from './usersReducer';
import projectsReducer from './projectsReducer';
import uiReducer from './uiReducer';

export default combineReducers({
  tasks: tasksReducer,
  users: usersReducer,
  projects: projectsReducer,
  ui: uiReducer,
});
