import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDatabase } from "./infrastructure/database/connection";
import { container } from "./infrastructure/container";
import { errorHandler } from "./infrastructure/http/middlewares/error.middleware";

dotenv.config();

const app = express();

// Global Middlewares
app.use(cors());
app.use(express.json());

app.use("/api", container.createRouter());

// Global Error Handler Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectDatabase();
    app.listen(PORT, () => {
      console.log(`Server is running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

// Only start listening if this file is run directly
if (require.main === module) {
  startServer();
}

export { app };
