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
  console.log ("Got all todos: " + JSON.stringify(allTodos));
  list_el.innerHTML = allTodos
    .map(
      (todo) => `
    
    <div class="task">
    <div class="content">
    <input id="edit" class="text" readonly="readonly" type="text" value= ${JSON.stringify(todo.todo)}>
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




// Initialize deferredPrompt for use later to show browser install prompt.
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  // Stash the event so it can be triggered later.
  deferredPrompt = e;
  // Optionally, send analytics event that PWA install promo was shown.
  console.log(`'beforeinstallprompt' event was fired.`);
});

buttonInstall.addEventListener('click', async () => {
  // Show the install prompt
  deferredPrompt.prompt();
  // Wait for the user to respond to the prompt
  const { outcome } = await deferredPrompt.userChoice;
  // Optionally, send analytics event with outcome of user choice
  console.log(`User response to the install prompt: ${outcome}`);
  // We've used the prompt, and can't use it again, throw it away
  deferredPrompt = null;
});

window.addEventListener('appinstalled', () => {
  // Hide the install button
  document.getElementById('buttonInstall').style.visibility= 'hidden';
  // Clear the deferredPrompt so it can be garbage collected
  deferredPrompt = null;
  // Optionally, send analytics event to indicate successful install
  console.log('PWA was installed');
});


function getPWADisplayMode() {
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  if (document.referrer.startsWith('android-app://')) {
    return 'twa';
  } else if (navigator.standalone || isStandalone) {
    return 'standalone';
  }
  return 'browser';
}

window.matchMedia('(display-mode: standalone)').addEventListener('change', (evt) => {
  let displayMode = 'browser';
  if (evt.matches) {
    displayMode = 'standalone';
  }
  // Log display mode change to analytics
  console.log('DISPLAY_MODE_CHANGED', displayMode);
});


