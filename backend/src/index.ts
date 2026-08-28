/**
 * Server bootstrap — entry point.
 *
 * Loads environment configuration, creates the Express app,
 * and starts the HTTP server. All app configuration lives in app.ts.
 */
import 'dotenv/config';
import { createApp } from './app';

const PORT = process.env.PORT || 5000;

const app = createApp();

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

export default app;
