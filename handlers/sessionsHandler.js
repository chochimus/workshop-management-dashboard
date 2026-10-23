import { manager } from '../managers/SessionManager.js'; 

export function handleGetSessions(req, res, next) {
  try {
    const sessions = manager.getSessions();
    res.status(200).json(sessions);
  } catch (error) {
    next(error);
  }
}

export async function handlePostSession(req, res, next) {
  try {
    const sessionData = req.body;
    const session = await manager.createSession(sessionData);
    res.status(201).json(session);
  } catch (error) {
    next(error);
  }
}

export function handleGetSession(req, res, next) {
  try {
    const id = req.params.id;
    const session = manager.getSession(id);
    res.status(200).json(session);
  } catch (error) {
    next(error);
  }
}

export async function handlePatchSession(req, res, next) {
  try {
    const id = req.params.id;
    const data = req.body;
    const session = await manager.updateSession(id, data);
    res.status(200).json(session);
  } catch (error) {
    next(error);
  }
}

export async function handleDeleteSession(req, res, next) {
  try {
    const id = req.params.id;
    await manager.deleteSession(id);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
}