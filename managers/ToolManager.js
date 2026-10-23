import fs from 'node:fs/promises';
import path from 'node:path';

let manager;
const fullPath = path.join(import.meta.dirname, '..','data', 'toolsData.json');

async function initializeTools() {
  try {
    const data = await fs.readFile(fullPath, 'utf8');
    const { tools } = JSON.parse(data);
    manager = new ToolManager(tools);
  } catch (error) {
    if (error.code === 'ENOENT') {
      manager = new ToolManager();
      await fs.writeFile(fullPath, JSON.stringify({tools: []}));
    } else {
      throw error;
    }
  }
}

class ToolManager {
  constructor(tools = []) {
    this.tools = tools;
  }
  getNextToolID() {
    return this.tools.length === 0 ? 1 : Math.max(...this.tools.map(tool => tool.id)) + 1;
  }
  getTools(category, availability) {
    let toolsToReturn = [...this.tools];

    if (availability !== undefined && !['true', 'false'].includes(availability)) {
      const err = new Error('Availability query not recognized');
      err.status = 400;
      throw err;
    }
    if (typeof category === 'string') {
      toolsToReturn = toolsToReturn.filter(tool => tool.category === category);
    }
    if (availability !== undefined) {
      availability = availability === 'true';
      toolsToReturn = toolsToReturn.filter(tool => tool.availability === availability);
    }

    return toolsToReturn;
  }
  async createTool(tool) {
    if (!this.isValidToolPost(tool)) {
      const err = new Error('Invalid tool data');
      err.status = 422;
      throw err;
    }

    const newTool = {
      ...tool,
      id: this.getNextToolID()
    };

    const updatedTools = [...this.tools, newTool]
    await fs.writeFile(fullPath, JSON.stringify({tools: updatedTools}));
    this.tools = updatedTools;
    return newTool;
  }
  getTool(id) {
    if (!this.isValidId(id)) {
      const err = new Error('Invalid id');
      err.status = 400;
      throw err;
    }
    const tool = this.tools.find(tool => tool.id === Number(id));

    if (!tool) {
      const err = new Error('Tool not found');
      err.status = 404;
      throw err;
    }

    return tool;
  }
  async updateTool(id, data) {
    if (!this.isValidId(id)) {
      const err = new Error('Invalid id');
      err.status = 400;
      throw err;
    }

    const toolIndex = this.tools.findIndex(tool => tool.id === Number(id));

    if (toolIndex === -1) {
      const err = new Error('Tool not found');
      err.status = 404;
      throw err;
    }

    if (!this.isValidToolUpdate(data)) {
      const err = new Error('Invalid tool data');
      err.status = 422;
      throw err;
    }

    const updatedTool = {
      ...this.tools[toolIndex],
      ...data
    }

    const updatedTools = [...this.tools];
    updatedTools[toolIndex] = updatedTool;

    await fs.writeFile(fullPath, JSON.stringify({tools: updatedTools}));
    this.tools = updatedTools;
    return updatedTool;
  }
  async deleteTool(id) {
    if (!this.isValidId(id)) {
      const err = new Error('Invalid id');
      err.status = 400;
      throw err;
    }

    const toolToDeleteIndex = this.tools.findIndex(tool => tool.id === Number(id));

    if (toolToDeleteIndex === -1) {
      const err = new Error('Tool not found');
      err.status = 404;
      throw err;
    }

    const updatedTools = this.tools.filter(tool => tool.id !== Number(id));
    await fs.writeFile(fullPath, JSON.stringify({tools: updatedTools}));
    this.tools = updatedTools;
  }
  isValidId(id) {
    return /^\d+$/.test(id) && Number(id) > 0;
  }

  isValidObject(data) {
    return data !== null && typeof data === 'object' && !Array.isArray(data);
  }

  isValidToolPost(data) {
    return this.isValidObject(data) && Object.entries(data).length === 4 && this.isValidTool(data);
  }

  isValidToolUpdate(data) {
    return this.isValidObject(data) && Object.entries(data).length >= 1 && this.isValidTool(data);
  }

  isValidTool(data) {
    const validToolProperties = ['name', 'category', 'condition', 'availability'];

    const entries = Object.entries(data);

    for (let [property, value] of entries) {
      if (!validToolProperties.includes(property)) {
        return false;
      } 
      switch (property) {
        case 'name':
          if (typeof value !== 'string' || value.trim().length === 0 || value.trim().length > 50) {
            return false;
          }
          break;
        case 'category':
          if (typeof value !== 'string' || value.trim().length === 0 || value.trim().length > 50) {
            return false;
          }
          break;
        case 'condition':
          if (!['new', 'good', 'fair', 'poor'].includes(value)) {
            return false;
          }
          break;
        case 'availability':
          if (typeof value !== 'boolean') {
            return false;
          }
          break;
      }
    }
    return true;
  }
}

export {
  initializeTools,
  manager
}