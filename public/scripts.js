class DashboardUI {
  constructor() {
    this.render();
  }
  renderUpcomingSessions() {

  }
  renderToolData() {

  }
  render() {
    let h2 = document.createElement('h2');
    h2.textContent = 'filler';
    this.element = h2;
  }
}

class SessionsUI {
  constructor() {
    this.element = document.createElement('section');
    this.render();
  }
  renderSessions(sessions) {
    let ul = document.createElement('ul');
    sessions.forEach(session => {
      let li = document.createElement('li');
      li.dataset.id = session.id;

      let title = document.createElement('p');
      title.textContent = session.title;
      li.appendChild(title);

      let startTime = document.createElement('p');
      startTime.textContent = session.startTime;
      li.appendChild(startTime);

      let endTime = document.createElement('p');
      endTime.textContent = session.endTime;
      li.appendChild(endTime);

      let capacity = document.createElement('p');
      capacity.textContent = session.capacity;
      li.appendChild(capacity);

      let bookingCount = document.createElement('p');
      bookingCount.textContent = session.bookingCount;
      li.appendChild(bookingCount);

      let editButton = document.createElement('button');
      editButton.textContent = 'Edit';
      editButton.classList.add('edit-btn');
      li.appendChild(editButton);

      let deleteButton = document.createElement('button');
      deleteButton.textContent = 'Delete';
      deleteButton.classList.add('delete-btn');
      li.appendChild(deleteButton);

      ul.appendChild(li);
    });
    return ul;
  }
  handleLiClick(event) {
    let li = event.target.closest('li');

    if (!li) {
      return;
    }
    let id = li.dataset.id;
    if (event.target.classList.contains('edit-btn')) {
      this.handleEditClick(event, id);
    } else if (event.target.classList.contains('delete-btn')) {
      this.handleDeleteClick(event, id);
    }
  }
  handleEditClick(event, id) {
    
  }
  handleDeleteClick(event, id) {

  }
  openNewSessionForm(event) {

  }
  async render() {
    try {
      const sessions = await getSessions();
      let h2 = document.createElement('h2');
      h2.textContent = 'Sessions';

      let createSession = document.createElement('button');
      createSession.textContent = 'New Session';
      createSession.addEventListener('click', this.openNewSessionForm.bind(this));

      let ul = this.renderSessions(sessions);
      ul.addEventListener('click', this.handleLiClick.bind(this));

      this.element.replaceChildren(h2, createSession, ul);
    } catch(error) {
      this.renderError(error);
    }
  }
  renderError(error) {
    const message = document.createElement('p');
    message.textContent = error.message;
    this.element.replaceChildren(message);
  }
}

class InventoryUI {
  constructor() {
    this.element = document.createElement('ul');
    this.render();
  }
  renderTools(tools) {
    this.element.replaceChildren(...tools.map(tool => {
      let li = document.createElement('li');
      li.dataset.id = tool.id;

      let name = document.createElement('p');
      name.textContent = tool.name;
      li.appendChild(name);

      let category = document.createElement('p');
      category.textContent = tool.category;
      li.appendChild(category);

      let condition = document.createElement('p');
      condition.textContent = tool.condition;
      li.appendChild(condition);

      let availability = document.createElement('p');
      availability.textContent = tool.availability;
      li.appendChild(availability);

      return li;
    }));
  }
  async render() {
    try {
      const tools = await getTools();
      this.renderTools(tools);
    } catch(error) {
      this.renderError(error);
    }
  }
  renderError(error) {
    const message = document.createElement('p');
    message.textContent = error.message;
    this.element.replaceChildren(message);
  }
}

async function handleNavClick(e) {
  const link = e.target.closest('a');

  if (!link || !e.currentTarget.contains(link)) {
    return;
  }

  e.preventDefault();

  switch (link.id) {
    case 'overviewLink':
      renderView(new DashboardUI());
      break;
    case 'sessionsLink':
      renderView(new SessionsUI());
      break;
    case 'inventoryLink':
      renderView(new InventoryUI());
      break;
  }
}

async function getSessions() {
  const response = await fetch('/api/sessions');

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error);
  }
  return response.json();
}

async function getTools() {
  const response = await fetch('/api/tools');

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error);
  }
  return response.json();
}

function renderView(view) {
  let mainContentContainer = document.getElementById('content-window');
  mainContentContainer.replaceChildren(view.element);
}

async function main() {
  let nav = document.querySelector('nav');
  nav.addEventListener('click', handleNavClick);
  renderView(new DashboardUI());
}

document.addEventListener('DOMContentLoaded', main);