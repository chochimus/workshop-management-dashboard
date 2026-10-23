import path from 'node:path';
import { readFile, writeFile } from 'node:fs/promises';

let manager;
const filePath = path.join(import.meta.dirname, '..','data', 'dataStorage.json');

class SessionManager {
  constructor(sessions=[], bookings=[]) {
    this.sessions = sessions;
    this.bookings = bookings;
  }
  getNextSessionID() {
    return this.sessions.length === 0 ? 1 : Math.max(...this.sessions.map(session => session.id)) + 1;
  }
  getNextBookingID() {
    return this.bookings.length === 0 ? 1 : Math.max(...this.bookings.map(booking => booking.id)) + 1;
  }
  getSessions() {
    return [...this.sessions];
  }
  getBookings(sessionId) {
    this.getSession(sessionId);
    return this.bookingsForSession(Number(sessionId));
  }
  bookingsForSession(sessionId) {
    return this.bookings.filter(booking => booking.sessionId === sessionId);
  }
  getSession(id) {
    if (!this.isValidId(id)) {
      const err = new Error('Invalid id');
      err.status = 400;
      throw err;
    }

    const session = this.sessions.find(session => session.id === Number(id));
    
    if (!session) {
      const err = new Error('No matching session');
      err.status = 404;
      throw err;
    }

    return session;
  }
  async createSession(data) {
    if (!this.isValidSessionPost(data)) {
      const err = new Error('Invalid session data');
      err.status = 422;
      throw err;
    }

    const session = {
      ...data,
      id:this.getNextSessionID(), 
    };
    const updatedSessions = [...this.sessions, session];
    await writeFile(filePath, JSON.stringify({sessions: updatedSessions, bookings: this.bookings}));
    this.sessions = updatedSessions;
    return session;
  }
  async createBooking(sessionId, data) {
    if (!this.isValidId(sessionId)) {
      const err = new Error('Invalid id');
      err.status = 400;
      throw err;
    }

    const sessionIndex = this.sessions.findIndex(session => session.id === Number(sessionId));

    if (sessionIndex === -1) {
      const err = new Error('No matching session');
      err.status = 404;
      throw err;
    }

    if (!this.isValidBooking(data)) {
      const err = new Error('Invalid booking data');
      err.status = 422;
      throw err;
    }

    if (this.sessionAtCapacity(sessionIndex)) {
      const err = new Error('Session fully booked');
      err.status = 409;
      throw err;
    }

    const booking = {id: this.getNextBookingID(), sessionId: Number(sessionId), attendeeName: data.attendeeName, createdAt: new Date().toISOString()}
    const updatedBookings = [...this.bookings, booking];
    await writeFile(filePath, JSON.stringify({sessions: this.sessions, bookings: updatedBookings}));
    this.bookings = updatedBookings;
    return booking;
  }
  async updateSession(id, data) {
    if (!this.isValidId(id)) {
      const err = new Error('Invalid id');
      err.status = 400;
      throw err;
    }

    const existingSessionIndex = this.sessions.findIndex(session => session.id === Number(id));

    if (existingSessionIndex === -1) {
      const err = new Error('No matching session');
      err.status = 404;
      throw err;
    }

    if (!this.isValidSessionUpdate(data)) {
      const err = new Error('Invalid session data');
      err.status = 422;
      throw err;
    }

    if (
      data.capacity !== undefined && 
      data.capacity < this.bookingsForSession(Number(id)).length
    ) {
      const err = new Error('Capacity cannot be less than the number of current bookings.');
      err.status = 409;
      throw err;
    }

    const updatedSession = {
      ...this.sessions[existingSessionIndex],
      ...data
    }

    if (!this.hasValidSessionTimes(updatedSession)) {
      const err = new Error('Invalid session data');
      err.status = 422;
      throw err;
    }

    const updatedSessions = [...this.sessions];

    updatedSessions[existingSessionIndex] = updatedSession;
    await writeFile(filePath, JSON.stringify({sessions: updatedSessions, bookings: this.bookings}))
    this.sessions = updatedSessions;
    return updatedSession;
  }
  async deleteSession(id) {
    if (!this.isValidId(id)) {
      const err = new Error('Invalid id');
      err.status = 400;
      throw err;
    }

    const session = this.sessions.find(session => session.id === Number(id));

    if (!session) {
      const err = new Error('No matching session');
      err.status = 404;
      throw err;
    }

    if (this.bookingsForSession(Number(id)).length > 0) {
      const err = new Error('Cannot delete session with existing bookings.');
      err.status = 409;
      throw err;
    }

    const updatedSessions = this.sessions.filter(session => session.id !== Number(id));
    await writeFile(filePath, JSON.stringify({sessions: updatedSessions, bookings: this.bookings}));
    this.sessions = updatedSessions;
  }
  async deleteBooking(id) {
    if (!this.isValidId(id)) {
      const err = new Error('Invalid id');
      err.status = 400;
      throw err;
    }

    const booking = this.bookings.find(booking => booking.id === Number(id));

    if (!booking) {
      const err = new Error('Booking not found');
      err.status = 404;
      throw err;
    }

    const updatedBookings = this.bookings.filter(booking => booking.id !== Number(id));
    await writeFile(filePath, JSON.stringify({sessions: this.sessions, bookings: updatedBookings}));
    this.bookings = updatedBookings;
  }
  sessionAtCapacity(sessionIndex) {
    let {id, capacity} = this.sessions[sessionIndex];
    let totalBookings = this.bookings.reduce((totalBookings, booking) => {
      if (booking.sessionId === id) {
        totalBookings += 1;
      }
      return totalBookings;
    }, 0);
    return totalBookings >= capacity;
  }
  isValidId(id) {
    return /^\d+$/.test(id) && Number(id) > 0;
  }
  isValidObject(data) {
    return (data !== null && typeof data === 'object' && !Array.isArray(data));
  }
  isValidBooking(data) {
    return (this.isValidObject(data) &&
      Object.keys(data).length === 1 &&
      typeof data.attendeeName === 'string' &&
      data.attendeeName.trim().length > 0 &&
      data.attendeeName.length <= 100
    );
  }
  isValidSessionUpdate(data) {
    return (this.isValidObject(data) &&
      Object.keys(data).length > 0 &&
      this.isValidSession(data)
    );
  }
  isValidSessionPost(data) {
    return (this.isValidObject(data) && 
      Object.keys(data).length === 4 && 
      this.isValidSession(data) &&
      this.hasValidSessionTimes(data)
    );
  }

  isValidSession(data) {
    const sessionProperties = ['title', 'startTime', 'endTime', 'capacity'];
    for (const property of Object.keys(data)) {
      if (!sessionProperties.includes(property)) {
        return false;
      }
      switch (property) {
        case 'title':
          if (
            typeof data[property] !== 'string' || 
            data[property].length > 100 ||
            data[property].trim().length === 0
          ) return false;
          break;
        case 'startTime':
        case 'endTime':
          if (!this.isValidDateTime(data[property])) return false;
          break;
        case 'capacity':
          if (
            !Number.isInteger(data[property]) || 
            data[property] <= 0
          ) return false;
          break;
      }
    }

    return true;
  }
  isValidDateTime(value) {
    if (typeof value !== 'string') return false;

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return false;

    return date.toISOString() === value;
  }
  
  hasValidSessionTimes(session) {
    return Date.parse(session.endTime) > Date.parse(session.startTime);
  }
}

async function initializeData() {
  try { 
    let fileData = await readFile(filePath, 'utf8');
    let { sessions, bookings } = JSON.parse(fileData);
    manager = new SessionManager(sessions, bookings);
  } catch (error) {
    if (error.code === 'ENOENT') {
      manager = new SessionManager();
      await writeFile(filePath, JSON.stringify({sessions: [], bookings: []}));
    } else {
      throw error;
    }
  }
}

export { 
  initializeData,
  manager
};