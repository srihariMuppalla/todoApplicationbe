const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
var { isValid, isDate } = require("date-fns");

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

const categoryCheck = (category) => {
  switch (true) {
    case category === "HOME":
      return false;
      break;
    case category === "WORK":
      return false;
      break;
    default:
      return true;
      break;
  }
};

const statusCheck = (status) => {
  switch (true) {
    case status === "TO DO":
      return false;
      break;
    case status === "IN PROGRESS":
      return false;
      break;
    case status === "DONE":
      return false;
      break;
    default:
      return true;
      break;
  }
};

const priorityCheck = (priority) => {
  switch (true) {
    case priority === "HIGH":
      return false;
      break;
    case priority === "LOW":
      return false;
      break;
    case priority === "MEDIUM":
      return false;
      break;
    default:
      return true;
      break;
  }
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
      response.status(400);
      response.send("Invalid Request");
      break;
  }
});

//To GET Todo With Todo ID

app.get("/todos/:todoId", async (request, response) => {
  const { todoId } = request.params;
  const getTodoQuery = `
    SELECT 
    *
    FROM
    todo
    WHERE
    id = ${todoId};
    `;
  const data = await database.get(getTodoQuery);
  if (data !== undefined) {
    response.send(convertData(data));
  } else {
    response.status(400);
    response.send("Invalid Todo Id");
  }
});

//GET todo by Date

app.get("/agenda/", async (request, response) => {
  const { date } = request.query;
  const requestDate = isDate(new Date(date));
  console.log(requestDate);
  const dueDate = isValid(parseInt(date));
  console.log(dueDate);
  if (requestDate) {
    const getTodosQuery = `
        SELECT 
        *
        FROM
        todo
        WHERE
        due_date = ${date};
        `;
    const data = await database.all(getTodosQuery);
    if (data.length > 0) {
      response.send(data.map((each) => convertData(each)));
    } else {
      response.status(400);
      response.send("Invalid Due Date");
    }
  } else {
    response.status(400);
    response.send("Invalid Due Date");
  }
});

//POST todo API

app.post("/todos/", async (request, response) => {
  const { id, todo, category, priority, status, dueDate } = request.body;
  switch (true) {
    case categoryCheck(category):
      response.status(400);
      response.send("Invalid Todo Category");
      break;
    case priorityCheck(priority):
      response.status(400);
      response.send("Invalid Todo Priority");
      break;
    case statusCheck(status):
      response.status(400);
      response.send("Invalid Todo Status");
      break;
    case dueDate === undefined:
      response.status(400);
      response.send("Invalid Due Date");
      break;
    default:
      const postTodoQuery = `
        INSERT INTO
        todo (id, todo, category, priority, status, due_date)
        VALUES
        (${id}, "${todo}", "${category}", "${priority}", "${status}", "${dueDate}");
     `;
      await database.run(postTodoQuery);
      response.send("Todo Successfully Added");
  }
});

//UPDATE data API

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  console.log(todoId);
  const { todo, category, priority, status, dueDate } = request.body;
  const requestQuery = `
    SELECT
    *
    FROM
    todo
    WHERE
    id = ${todoId};
    `;
  const requestData = await database.get(requestQuery);
  console.log(requestData);
  let updateQuery = "";
  if (requestData !== undefined) {
    switch (true) {
      case todo !== undefined:
        updateQuery = `
              UPDATE
              todo
              SET
              todo = "${todo}"
              WHERE
              id = ${todoId};
              `;
        await database.run(updateQuery);
        response.send("Todo Updated");
        break;
      case category !== undefined:
        switch (true) {
          case category === "HOME":
            updateQuery = `
                    UPDATE
                    todo
                    SET
                    category = "${category}"
                    WHERE
                    id = ${todoId};
                    `;
            await database.run(updateQuery);
            response.send("Category Updated");
            break;
          case category === "WORK":
            updateQuery = `
                    UPDATE
                    todo
                    SET
                    category = "${category}"
                    WHERE
                    id = ${todoId};
                    `;
            await database.run(updateQuery);
            response.send("Category Updated");
            break;
          default:
            response.status(400);
            response.send("Invalid Todo Category");
            break;
        }
        break;
      case status !== undefined:
        switch (true) {
          case status === "TO DO":
            updateQuery = `
                    UPDATE
                    todo
                    SET
                    status = "${status}"
                    WHERE
                    id = ${todoId};
                    `;
            await database.run(updateQuery);
            response.send("Status Updated");
            break;
          case status === "DONE":
            updateQuery = `
                    UPDATE
                    todo
                    SET
                    status = "${status}"
                    WHERE
                    id = ${todoId};
                    `;
            await database.run(updateQuery);
            response.send("Status Updated");
            break;
          case status === "IN PROGRESS":
            updateQuery = `
                    UPDATE
                    todo
                    SET
                    status = "${status}"
                    WHERE
                    id = ${todoId};
                    `;
            await database.run(updateQuery);
            response.send("Status Updated");
            break;
          default:
            response.status(400);
            response.send("Invalid Todo Status");
            break;
        }
        break;
      case priority !== undefined:
        switch (true) {
          case priority === "HIGH":
            updateQuery = `
                    UPDATE
                    todo
                    SET
                    priority = "${priority}"
                    WHERE
                    id = ${todoId};
                    `;
            await database.run(updateQuery);
            response.send("Priority Updated");
            break;
          case priority === "LOW":
            updateQuery = `
                    UPDATE
                    todo
                    SET
                    priority = "${priority}"
                    WHERE
                    id = ${todoId};
                    `;
            await database.run(updateQuery);
            response.send("Priority Updated");
            break;
          case priority === "MEDIUM":
            updateQuery = `
                    UPDATE
                    todo
                    SET
                    priority = "${priority}"
                    WHERE
                    id = ${todoId};
                    `;
            await database.run(updateQuery);
            response.send("Priority Updated");
            break;
          default:
            response.status(400);
            response.send("Invalid Todo Priority");
            break;
        }
        break;
      default:
        const validDate = isValid(dueDate);
        if (validDate) {
          updateQuery = `
            UPDATE
                todo
            SET
                due_date = "${dueDate}"
            WHERE
                id = ${todoId};
            `;
          await database.run(updateQuery);
          response.send("Due Date Updated");
        } else {
          response.status(400);
          response.send("Invalid Due Date");
        }
        break;
    }
  } else {
    response.status(400);
    response.send("Invalid Todo Id");
  }
});

//DELETE API

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodoQuery = `
  DELETE FROM
    todo
  WHERE
    id = ${todoId};`;

  await database.run(deleteTodoQuery);
  response.send("Todo Deleted");
});
module.exports = app;
