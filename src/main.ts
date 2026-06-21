import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { APP_CONFIG } from "./config/app.config";
import { errorHandler } from "./infrastructure/middlewares/errorHandler";
import userRoutes from "./infrastructure/modules/user/routes/userRoutes";
import profileRoutes from "./infrastructure/modules/profile/routes/profileRoutes";

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(errorHandler);

app.use("/api/user", userRoutes);
app.use("/api/profile", profileRoutes);

app.listen(APP_CONFIG.port, () => {
  console.log(`Server running on port ${APP_CONFIG.port}`);
});
