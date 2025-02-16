require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan-body");
const userRoutes = require("./routes/index");
const { handleHttpError } = require("./utils/handleError");
const { deleteInactiveUsers } = require("./config/firebase");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());
morgan(app);

app.use("/", userRoutes);

app.use((req, res, next) => {
  handleHttpError(res, "Endpoint Not Found", 404);
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  handleHttpError(res, "Internal Server Error", 500);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    deleteInactiveUsers(); // Delete inactive users on server start
});