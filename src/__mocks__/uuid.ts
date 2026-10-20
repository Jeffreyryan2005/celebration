// UUID mock for Jest (uuid v14 is ESM-only)
let counter = 0;
export const v4 = () => `mock-uuid-${++counter}`;
export default { v4 };
