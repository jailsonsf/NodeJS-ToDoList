const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(400).json({ error: 'Usuário não cadastrado' });
  }

  request.user = user;
  next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const user = users.find((user) => user.username === username);

  if (user) {
    return response.status(400).json({ error: 'Username já existe!' });
  }

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(newUser);
  return response.status(201).json(newUser);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const user = request.user;
  const todos = user.todos;

  return response.status(200).json(todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const user = request.user;
  const { title, deadline } = request.body;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(todo);
  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const user = request.user;
  const { id } = request.params;
  const { title, deadline } = request.body;

  user.todos.find((todo) => {
    if (todo.id === id) {
      todo.title = title;
      todo.deadline = new Date(deadline);

      return response.status(200).json(todo);
    }
  });

  return response.status(404).json({ error: "Tarefa não existe!" });
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const user = request.user;
  const { id } = request.params;

  user.todos.find((todo) => {
    if (todo.id === id) {
      todo.done = true
      return response.json(todo);
    }
  });

  return response.status(404).json({ error: "Tarefa não existe!" });
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const user = request.user;
  const { id } = request.params;

  let todoToDelete;

  user.todos.find((todo) => {
    if (todo.id === id) {
      todoToDelete = todo;
      user.todos.splice(todoToDelete, 1);
      return response.status(204).json({ msg: "Tarefa deletada!" });
    }
  });

  return response.status(404).json({ error: "Tarefa não existe!" });
});

module.exports = app;