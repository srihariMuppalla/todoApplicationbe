const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const isDate = require("date-fns/isDate");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "todoApplication.db");
let database = null;

const initializeDBAndServer = async () => {
  try {
    database = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at: http://localhost:3000/");
    });
  } catch (error) {
    console.log(`DB ERROR: "${error.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const convertData = (data) => {
  return {
    id: data.id,
    todo: data.todo,
    category: data.category,
    priority: data.priority,
    status: data.status,
    dueDate: data.due_date,
  };
};

const hasPriorityAndStatusProperties = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};

const hasCategoryAndStatusProperties = (requestQuery) => {
  return (
    requestQuery.category !== undefined && requestQuery.status !== undefined
  );
};

const hasCategoryAndPriorityProperties = (requestQuery) => {
  return (
    requestQuery.category !== undefined && requestQuery.priority !== undefined
  );
};

//Getting Todos with Different Scenarios

app.get("/todos/", async (request, response) => {
  const {
    status = "",
    search_q = "",
    category = "",
    priority = "",
    dueDate = "",
  } = request.query;
  const requestQuery = request.query;
  let getTodosQuery = "";
  let data = null;
  switch (true) {
    case requestQuery.status !== undefined:
      getTodosQuery = `
            SELECT
            *
            FROM
            todo
            WHERE
            status = "${requestQuery.status}";
            `;
      data = await database.all(getTodosQuery);
      if (data.length > 0) {
        response.send(data.map((each) => convertData(each)));
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }
      break;
    case requestQuery.priority !== undefined:
      getTodosQuery = `
            SELECT
            *
            FROM
            todo
            WHERE
            priority = "${requestQuery.priority}";
            `;
      data = await database.all(getTodosQuery);
      if (data.length > 0) {
        response.send(data.map((each) => convertData(each)));
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;
    case hasPriorityAndStatusProperties(requestQuery):
      getTodosQuery = `
            SELECT
            *
            FROM
            todo
            WHERE
            priority = "${requestQuery.priority}"
            AND status = "${requestQuery.status}";
            `;
      data = await database.all(getTodosQuery);
      if (data.length > 0) {
        response.send(data.map((each) => convertData(each)));
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }
      break;
    case requestQuery.search_q !== undefined:
      getTodosQuery = `
            SELECT
            *
            FROM
            todo
            WHERE
            todo LIKE "%${requestQuery.search_q}%";
            `;
      data = await database.all(getTodosQuery);
      if (data.length > 0) {
        response.send(data.map((each) => convertData(each)));
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;
    case hasCategoryAndStatusProperties(requestQuery):
      getTodosQuery = `
            SELECT
            *
            FROM
            todo
            WHERE
            category = "${requestQuery.category}"
            AND status = "${requestQuery.status}";
            `;
      data = await database.all(getTodosQuery);
      if (data.length > 0) {
        response.send(data.map((each) => convertData(each)));
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }
      break;
    case requestQuery.category !== undefined:
      getTodosQuery = `
            SELECT
            *
            FROM
            todo
            WHERE
            category = "${requestQuery.category}";
            `;
      data = await database.all(getTodosQuery);
      if (data.length > 0) {
        response.send(data.map((each) => convertData(each)));
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;
    case hasCategoryAndPriorityProperties(requestQuery):
      getTodosQuery = `
            SELECT
            *
            FROM
            todo
            WHERE
            category = "${requestQuery.category}"
            AND priority = "${requestQuery.priority}";
            `;
      data = await database.all(getTodosQuery);
      if (data.length > 0) {
        response.send(data.map((each) => convertData(each)));
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;
    default:
      break;
  }
});
