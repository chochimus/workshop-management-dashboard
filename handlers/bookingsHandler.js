import { manager } from "../managers/SessionManager.js";

export function handleGetBookings(req, res, next) {
  try {
    const sessionId = req.params.id;
    const bookings = manager.getBookings(sessionId);
    res.status(200).json(bookings);
  } catch (error) {
    next(error);
  }
}

export async function handlePostBooking(req, res, next) {
  try {
    const sessionId = req.params.id;
    const data = req.body;
    const booking = await manager.createBooking(sessionId, data);
    res.status(201).json(booking);
  } catch (error) {
    next(error);
  }
}

export async function handleDeleteBooking(req, res, next) {
  try {
    const bookingId = req.params.id;
    await manager.deleteBooking(bookingId);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
}