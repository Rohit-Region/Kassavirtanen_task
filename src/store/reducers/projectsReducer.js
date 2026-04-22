const normalize = (projects) => {
  const byId = {};
  const allIds = [];
  for (const p of projects) {
    byId[p.id] = p;
    allIds.push(p.id);
  }
  return { byId, allIds };
};

const initialState = { byId: {}, allIds: [] };

export default function projectsReducer(state = initialState, action) {
  switch (action.type) {
    case 'FETCH_PROJECTS_SUCCESS':
      return normalize(action.payload);
    default:
      return state;
  }
}
