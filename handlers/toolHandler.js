import { 
  manager
} from "../managers/ToolManager.js";

function handleGetAllTools(req, res, next) {
  try {
    const category = req.query.category;
    const availability = req.query.availability;
    let result = manager.getTools(category, availability);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

async function handlePostTool(req, res, next) {
  try {
    const tool = req.body;
    const newTool = await manager.createTool(tool);
    return res.status(201).json(newTool);
  } catch (error) {
    next(error);
  }
}

function handleGetToolById(req, res, next) {
  try {
    const id = req.params.id;
    const tool = manager.getTool(id);
    return res.status(200).json(tool);
  } catch (error) {
    next(error);
  }
}

async function handleUpdateToolById(req, res, next) {
  try {
    const id = req.params.id;
    const tool = req.body;
    const updatedTool = await manager.updateTool(id, tool);
    return res.status(200).json(updatedTool);
  } catch (error) {
    next(error);
  }
}

async function handleDeleteToolById(req, res, next) {
  try {
    const id = req.params.id;
    await manager.deleteTool(id);
    return res.status(204).end();
  } catch (error) {
    next(error);
  }
}

export { 
  handleGetAllTools,
  handlePostTool,
  handleGetToolById,
  handleUpdateToolById,
  handleDeleteToolById
}