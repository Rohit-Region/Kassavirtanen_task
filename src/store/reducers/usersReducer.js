const normalize = (users) => {
  const byId = {};
  const allIds = [];
  for (const u of users) {
    byId[u.id] = u;
    allIds.push(u.id);
  }
  return { byId, allIds };
};

const initialState = { byId: {}, allIds: [] };

export default function usersReducer(state = initialState, action) {
  switch (action.type) {
    case 'FETCH_USERS_SUCCESS':
      return normalize(action.payload);
    default:
      return state;
  }
}
