import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} from '../controllers/taskController.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getTasks)
  .post(upload.single('file'), createTask);

router.route('/:id')
  .put(upload.single('file'), updateTask)
  .delete(deleteTask);

export default router;