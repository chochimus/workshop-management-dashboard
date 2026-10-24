import express from 'express';
import { initializeData } from './managers/SessionManager.js';
import { initializeTools } from './managers/ToolManager.js';
import sessionsRouter from './routers/sessionsRouter.js';
import bookingsRouter from './routers/bookingRouter.js';
import toolsRouter from './routers/toolsRouter.js';

const app = express();
const port = 3000;
await initializeData();
await initializeTools();

app.use(express.static('public'));
app.use(express.json());

app.use('/api/sessions', sessionsRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/tools', toolsRouter);

app.use((err, req, res, next) => {
  let statusCode = err.status || 500;
  return res.status(statusCode).json({error: `${err.message}`});
})

app.listen(port, () => {
  console.log(`Listening on port: ${port}`);
});