import Task from '../models/Task.js';
import { isDatabaseReady } from '../config/db.js';
import { sendTaskCompletedEmail, sendTaskCreatedEmail } from '../services/emailService.js';
import getWeatherByLocation from '../services/weatherService.js';
import {
  createMemoryTask,
  deleteMemoryTask,
  findMemoryTaskById,
  getMemoryTasksByUser,
  updateMemoryTask,
} from '../utils/memoryStore.js';

// Safe helper to attach weather without throwing errors
const buildTaskResponse = async (task) => {
  const plainTask = task?.toObject ? task.toObject() : { ...task };
  let weather = null;

  if (plainTask.location && typeof plainTask.location === 'string' && plainTask.location.trim()) {
    try {
      if (typeof getWeatherByLocation === 'function') {
        weather = await getWeatherByLocation(plainTask.location.trim());
      }
    } catch (err) {
      console.warn(`[Weather Service Warning]: Could not fetch weather for "${plainTask.location}":`, err.message);
    }
  }

  return {
    ...plainTask,
    weather,
  };
};

// Safe helper to sanitize form-data inputs
const sanitize = (val) => {
  if (val === undefined || val === null || val === 'undefined' || val === 'null' || val === '') {
    return null;
  }
  return typeof val === 'string' ? val.trim() : val;
};

const filterMemoryTasks = (tasks, { status, priority, startDate, endDate, search }) => {
  let filtered = [...tasks];

  if (status) filtered = filtered.filter((task) => task.status === status);
  if (priority) filtered = filtered.filter((task) => task.priority === priority);

  if (startDate) {
    filtered = filtered.filter((task) => !task.dueDate || new Date(task.dueDate) >= new Date(startDate));
  }

  if (endDate) {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    filtered = filtered.filter((task) => !task.dueDate || new Date(task.dueDate) <= end);
  }

  if (search) {
    const pattern = search.toLowerCase();
    filtered = filtered.filter((task) =>
      (task.title || '').toLowerCase().includes(pattern) || (task.description || '').toLowerCase().includes(pattern)
    );
  }

  return filtered;
};

// @desc    Get all tasks
// @route   GET /api/tasks
export const getTasks = async (req, res, next) => {
  try {
    const { status, priority, startDate, endDate, search, page = 1, limit = 10 } = req.query;
    const pageNumber = Math.max(1, Number(page) || 1);
    const limitNumber = Math.max(1, Number(limit) || 10);
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: 'User unauthorized' });
    }

    if (!isDatabaseReady || !isDatabaseReady()) {
      const tasks = filterMemoryTasks(getMemoryTasksByUser(userId), { status, priority, startDate, endDate, search });
      const paginatedTasks = tasks.slice((pageNumber - 1) * limitNumber, pageNumber * limitNumber);
      const data = await Promise.all(paginatedTasks.map((task) => buildTaskResponse(task)));

      return res.status(200).json({
        data,
        meta: {
          total: tasks.length,
          page: pageNumber,
          lastPage: Math.max(1, Math.ceil(tasks.length / limitNumber) || 1),
        },
      });
    }

    const filter = { user: userId };
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    if (startDate || endDate) {
      filter.dueDate = {};
      if (startDate) filter.dueDate.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.dueDate.$lte = end;
      }
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Task.countDocuments(filter);
    const tasks = await Task.find(filter)
      .sort({ createdAt: -1 })
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber)
      .lean();

    const data = await Promise.all(tasks.map((task) => buildTaskResponse(task)));

    res.status(200).json({
      data,
      meta: {
        total,
        page: pageNumber,
        lastPage: Math.max(1, Math.ceil(total / limitNumber) || 1),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new task
// @route   POST /api/tasks
export const createTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, dueDate, location } = req.body;

    const cleanTitle = sanitize(title);
    if (!cleanTitle) {
      return res.status(400).json({ message: 'Task title is required' });
    }

    const cleanDescription = sanitize(description) || '';
    const cleanStatus = sanitize(status) || 'PENDING';
    const cleanPriority = sanitize(priority) || 'MEDIUM';
    const cleanLocation = sanitize(location) || '';
    const rawDueDate = sanitize(dueDate);
    const cleanDueDate = rawDueDate ? new Date(rawDueDate) : null;
    const fileUrl = req.file?.path || '';

    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ message: 'User unauthorized' });
    }

    let task;

    if (!isDatabaseReady || !isDatabaseReady()) {
      task = createMemoryTask({
        user: userId,
        title: cleanTitle,
        description: cleanDescription,
        status: cleanStatus,
        priority: cleanPriority,
        dueDate: cleanDueDate || undefined,
        location: cleanLocation,
        fileUrl,
      });
    } else {
      task = await Task.create({
        user: userId,
        title: cleanTitle,
        description: cleanDescription,
        status: cleanStatus,
        priority: cleanPriority,
        dueDate: cleanDueDate || undefined,
        location: cleanLocation,
        fileUrl,
      });
    }

    // Fire email asynchronously without blocking the response
    if (req.user?.email && typeof sendTaskCreatedEmail === 'function') {
      try {
        sendTaskCreatedEmail({
          email: req.user.email,
          name: req.user.name || 'User',
          title: task.title,
        }).catch((err) => console.warn('[Email Warning]:', err.message));
      } catch (emailErr) {
        console.warn('[Email Sync Warning]:', emailErr.message);
      }
    }

    const response = await buildTaskResponse(task);
    return res.status(201).json(response);
  } catch (error) {
    console.error('[CreateTask Controller Error]:', error);
    next(error);
  }
};

// @desc    Update a task
// @route   PUT /api/tasks/:id
export const updateTask = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ message: 'User unauthorized' });
    }

    const taskId = req.params.id;
    let task;
    let previousStatus;

    if (!isDatabaseReady || !isDatabaseReady()) {
      task = findMemoryTaskById(taskId);
      if (!task || task.user.toString() !== userId.toString()) {
        return res.status(404).json({ message: 'Task not found' });
      }

      previousStatus = task.status;
      const allowedFields = ['title', 'description', 'status', 'priority', 'dueDate', 'location'];

      allowedFields.forEach((field) => {
        if (req.body[field] !== undefined) {
          const clean = sanitize(req.body[field]);
          task[field] = field === 'dueDate' && clean ? new Date(clean) : clean;
        }
      });

      if (req.file?.path) {
        task.fileUrl = req.file.path;
      }

      task = updateMemoryTask(taskId, task);
    } else {
      task = await Task.findOne({ _id: taskId, user: userId });
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }

      previousStatus = task.status;
      const allowedFields = ['title', 'description', 'status', 'priority', 'dueDate', 'location'];

      allowedFields.forEach((field) => {
        if (req.body[field] !== undefined) {
          const clean = sanitize(req.body[field]);
          task[field] = field === 'dueDate' && clean ? new Date(clean) : clean;
        }
      });

      if (req.file?.path) {
        task.fileUrl = req.file.path;
      }

      task = await task.save();
    }

    if (previousStatus !== 'DONE' && task.status === 'DONE' && req.user?.email && typeof sendTaskCompletedEmail === 'function') {
      try {
        sendTaskCompletedEmail({
          email: req.user.email,
          name: req.user.name || 'User',
          title: task.title,
        }).catch((err) => console.warn('[Email Warning]:', err.message));
      } catch (emailErr) {
        console.warn('[Email Sync Warning]:', emailErr.message);
      }
    }

    const response = await buildTaskResponse(task);
    return res.status(200).json(response);
  } catch (error) {
    console.error('[UpdateTask Controller Error]:', error);
    next(error);
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
export const deleteTask = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ message: 'User unauthorized' });
    }

    const taskId = req.params.id;

    if (!isDatabaseReady || !isDatabaseReady()) {
      const task = findMemoryTaskById(taskId);
      if (!task || task.user.toString() !== userId.toString()) {
        return res.status(404).json({ message: 'Task not found' });
      }

      deleteMemoryTask(taskId);
      return res.status(200).json({ message: 'Task deleted successfully' });
    }

    const task = await Task.findOne({ _id: taskId, user: userId });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await task.deleteOne();
    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('[DeleteTask Controller Error]:', error);
    next(error);
  }
};