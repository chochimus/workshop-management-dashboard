import express from 'express';
import {
  handleDeleteBooking
} from '../handlers/bookingsHandler.js';

const bookingsRouter = express.Router();

bookingsRouter
  .route('/:id')
  .delete(handleDeleteBooking);

export default bookingsRouter;
