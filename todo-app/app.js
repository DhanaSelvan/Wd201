/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
const express = require("express");
const app = express();
const { Todo } = require("./models");
const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));

const path = require("path");
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "/public")));

app.set("view engine", "ejs");

app.get("/", async (requeset, response) => {
  let allTodos = await Todo.getTodo();
  let overDue = await Todo.overDue();
  let dueLater = await Todo.dueLater();
  let dueToday = await Todo.dueToday();
  let completed = await Todo.completed();
  if (requeset.accepts("html")) {
    response.render("index", {
      title: "Todo application",
      allTodos,
      overDue,
      dueToday,
      dueLater,
      completed,
    });
  } else {
    response.json({
      overDue,
      dueLater,
      dueToday,
      completed,
    });
  }
});

app.get("/todos", async (_request, response) => {
  console.log("Processing list of all Todos ...");

  try {
    let Todos = await Todo.findAll();
    return response.send(Todos);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.get("/todos/:id", async function (request, response) {
  try {
    const todo = await Todo.findByPk(request.params.id);
    return response.json(todo);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.post("/todos", async (request, response) => {
  try {
    await Todo.addTodo({
      title: request.body.title,
      dueDate: request.body.dueDate,
      completed: false,
    });
    return response.redirect("/");
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.put("/todos/:id/markAsCompleted", async function (request, response) {
  const todo = await Todo.findByPk(request.params.id);
  try {
    const updatedTodo = await todo.markAsCompleted();
    return response.json(updatedTodo);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.delete("/todos/:id", async function (request, response) {
  console.log("We have to delete a Todo with ID: ", request.params.id);
  try {
    await Todo.remove(request.params.id);
    return response.json({ success: true });
  } catch (error) {
    return response.status(422).json(error);
  }
});

module.exports = app;
