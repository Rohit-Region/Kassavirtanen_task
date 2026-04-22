import { call, put, takeLatest, select } from 'redux-saga/effects';
import { mockApi } from '../../api/mockApi';
import {
  FETCH_TASKS_REQUEST,
  fetchTasksSuccess,
  fetchTasksFailure,
  CREATE_TASK_REQUEST,
  createTaskFailure,
  UPDATE_TASK_REQUEST,
  updateTaskFailure,
  DELETE_TASK_REQUEST,
  deleteTaskFailure,
  fetchTasksRequest,
} from '../actions/taskActions';
import {
  FETCH_USERS_REQUEST,
  fetchUsersSuccess,
  fetchUsersFailure,
  FETCH_PROJECTS_REQUEST,
  fetchProjectsSuccess,
  fetchProjectsFailure,
} from '../actions/referenceActions';
import { setLoading, setError, clearError, closeTaskForm } from '../actions/uiActions';

const selectFilters = (state) => state.ui.filters;

function* fetchTasksSaga(action) {
  const filters = action.payload ?? (yield select(selectFilters));
  try {
    yield put(setLoading('tasks', true));
    yield put(clearError('tasks'));
    const response = yield call([mockApi, mockApi.fetchTasks], filters);
    yield put(fetchTasksSuccess(response.data));
  } catch (e) {
    yield put(fetchTasksFailure(e.message));
    yield put(setError('tasks', e.message));
  } finally {
    yield put(setLoading('tasks', false));
  }
}

function* fetchUsersSaga() {
  try {
    yield put(setLoading('users', true));
    yield put(clearError('users'));
    const response = yield call([mockApi, mockApi.fetchUsers]);
    yield put(fetchUsersSuccess(response.data));
  } catch (e) {
    yield put(fetchUsersFailure(e.message));
    yield put(setError('users', e.message));
  } finally {
    yield put(setLoading('users', false));
  }
}

function* fetchProjectsSaga() {
  try {
    yield put(setLoading('projects', true));
    yield put(clearError('projects'));
    const response = yield call([mockApi, mockApi.fetchProjects]);
    yield put(fetchProjectsSuccess(response.data));
  } catch (e) {
    yield put(fetchProjectsFailure(e.message));
    yield put(setError('projects', e.message));
  } finally {
    yield put(setLoading('projects', false));
  }
}

function* createTaskSaga(action) {
  try {
    yield put(setLoading('saveTask', true));
    yield put(clearError('form'));
    yield call([mockApi, mockApi.createTask], action.payload);
    const filters = yield select(selectFilters);
    yield put(fetchTasksRequest(filters));
    yield put(closeTaskForm());
  } catch (e) {
    yield put(createTaskFailure(e.message));
    yield put(setError('form', e.message));
  } finally {
    yield put(setLoading('saveTask', false));
  }
}

function* updateTaskSaga(action) {
  const { taskId, updates } = action.payload;
  try {
    yield put(setLoading('saveTask', true));
    yield put(clearError('form'));
    yield call([mockApi, mockApi.updateTask], taskId, updates);
    const filters = yield select(selectFilters);
    yield put(fetchTasksRequest(filters));
    yield put(closeTaskForm());
  } catch (e) {
    yield put(updateTaskFailure(e.message));
    yield put(setError('form', e.message));
  } finally {
    yield put(setLoading('saveTask', false));
  }
}

function* deleteTaskSaga(action) {
  const taskId = action.payload;
  try {
    yield put(setLoading('tasks', true));
    yield put(clearError('tasks'));
    yield call([mockApi, mockApi.deleteTask], taskId);
    const filters = yield select(selectFilters);
    yield put(fetchTasksRequest(filters));
  } catch (e) {
    yield put(deleteTaskFailure(e.message));
    yield put(setError('tasks', e.message));
  } finally {
    yield put(setLoading('tasks', false));
  }
}

export function* taskSagas() {
  yield takeLatest(FETCH_TASKS_REQUEST, fetchTasksSaga);
  yield takeLatest(FETCH_USERS_REQUEST, fetchUsersSaga);
  yield takeLatest(FETCH_PROJECTS_REQUEST, fetchProjectsSaga);
  yield takeLatest(CREATE_TASK_REQUEST, createTaskSaga);
  yield takeLatest(UPDATE_TASK_REQUEST, updateTaskSaga);
  yield takeLatest(DELETE_TASK_REQUEST, deleteTaskSaga);
}
