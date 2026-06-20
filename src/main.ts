import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { APP_CONFIG } from "./config/app.config";

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.listen(APP_CONFIG.port, () => {
  console.log(`Server running on port ${APP_CONFIG.port}`);
});
