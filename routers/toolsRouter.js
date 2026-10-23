import express from 'express';
import {
  handleGetAllTools,
  handlePostTool,
  handleGetToolById,
  handleUpdateToolById,
  handleDeleteToolById
} from '../handlers/toolHandler.js';

const toolsRouter = express.Router();

toolsRouter
  .route('/')
  .get(handleGetAllTools)
  .post(handlePostTool);

toolsRouter
  .route('/:id')
  .get(handleGetToolById)
  .patch(handleUpdateToolById)
  .delete(handleDeleteToolById);

export default toolsRouter;