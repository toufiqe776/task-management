const memoryUsers = [];
const memoryTasks = [];

const generateId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export const resetMemoryStore = () => {
  memoryUsers.length = 0;
  memoryTasks.length = 0;
};

export const getMemoryUsers = () => memoryUsers;
export const getMemoryTasks = () => memoryTasks;

export const createMemoryUser = (user) => {
  const record = {
    ...user,
    _id: user._id || generateId(),
    createdAt: user.createdAt || new Date().toISOString(),
    updatedAt: user.updatedAt || new Date().toISOString(),
  };

  memoryUsers.push(record);
  return record;
};

export const findMemoryUserByEmail = (email) =>
  memoryUsers.find((user) => user.email?.toLowerCase() === String(email).trim().toLowerCase());

export const findMemoryUserById = (id) => memoryUsers.find((user) => user._id.toString() === id.toString());

export const createMemoryTask = (task) => {
  const record = {
    ...task,
    _id: task._id || generateId(),
    createdAt: task.createdAt || new Date().toISOString(),
    updatedAt: task.updatedAt || new Date().toISOString(),
  };

  memoryTasks.push(record);
  return record;
};

export const getMemoryTasksByUser = (userId) =>
  memoryTasks.filter((task) => task.user?.toString() === userId.toString());

export const findMemoryTaskById = (id) => memoryTasks.find((task) => task._id.toString() === id.toString());

export const updateMemoryTask = (id, updater) => {
  const taskIndex = memoryTasks.findIndex((task) => task._id.toString() === id.toString());

  if (taskIndex === -1) {
    return null;
  }

  const updated = {
    ...memoryTasks[taskIndex],
    ...updater,
    updatedAt: new Date().toISOString(),
  };

  memoryTasks[taskIndex] = updated;
  return updated;
};

export const deleteMemoryTask = (id) => {
  const taskIndex = memoryTasks.findIndex((task) => task._id.toString() === id.toString());

  if (taskIndex === -1) {
    return false;
  }

  memoryTasks.splice(taskIndex, 1);
  return true;
};
