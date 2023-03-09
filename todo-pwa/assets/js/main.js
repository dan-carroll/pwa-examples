// Check that service workers are supported
if ('serviceWorker' in navigator) {
  // Use the window load event to keep the page load performant
  window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').then(function(registration) {
          // Registration was successful
          console.log('ServiceWorker registration successful with scope: ', registration.scope);
      }, function(err) {
          // registration failed :(
          console.log('ServiceWorker registration failed: ', err);
      });
    });
}

//creating database structure

// declare database and the todos table

const db = new Dexie("TodoDB");
db.version(1).stores({ todos: "++id, todo" });
//log ("Using Dexie v" + Dexie.semVer);

const form = document.querySelector("#new-task-form");
const input = document.querySelector("#new-task-input");
const list_el = document.querySelector("#tasks");


// Add, Display, and Delete todo data

//add todo
form.onsubmit = async (event) => {
  event.preventDefault();
  const todo = input.value;
  await db.todos.add({ todo });
  console.log ("Added todo: " + todo);
  await getTodos();
  form.reset();
};

//display todo
const getTodos = async () => {
  const allTodos = await db.todos.reverse().toArray();
  console.log ("Got all todos: " + allTodos);
  list_el.innerHTML = allTodos
    .map(
      (todo) => `
    
    <div class="task">
    <div class="content">
    <input id="edit" class="text" readonly="readonly" type="text" value= ${todo.todo}>
    </div>
    <div class="actions">
    <button class="delete" onclick="deleteTodo(event, ${todo.id})">Delete</button>
    </div>
    </div>
    `
    )
    .join("");
};

//delete todo
const deleteTodo = async (event, id) => {
  await db.todos.delete(id);
  console.log ("Todo was deleted.");
  await getTodos();
};


// Display todos on app start (load)
window.onload = getTodos;
