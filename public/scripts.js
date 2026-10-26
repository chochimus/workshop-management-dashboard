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
    this.element = document.createElement('section');
    this.render();
  }
  renderTools(tools) {
    let ul = document.createElement('ul');

    tools.forEach(tool => {
      let li = document.createElement('li');
      li.dataset.id = tool.id;

      let name = document.createElement('p');
      name.textContent = tool.name;
      li.appendChild(name);

      let category = document.createElement('p');
      category.textContent = tool.category;
      li.appendChild(category);

      let condition = document.createElement('p');
      condition.textContent = tool.condition[0].toUpperCase() + tool.condition.slice(1);
      li.appendChild(condition);

      let availability = document.createElement('p');
      availability.textContent = tool.availability ? 'Available' : 'Unavailable';
      availability.classList.add(`${tool.availability ? 'available' : 'unavailable'}`);
      li.appendChild(availability);

      let editButton = document.createElement('button');
      editButton.classList.add('edit-btn');
      editButton.textContent = 'edit';
      li.appendChild(editButton);

      let deleteButton = document.createElement('button');
      deleteButton.classList.add('delete-btn');
      deleteButton.textContent = 'delete';
      li.appendChild(deleteButton);

      ul.appendChild(li);
    });
    return ul;
  }
  async handleToolClick(event) {
    let li = event.target.closest('li');

    if (!li) {
      return;
    }
    let id = li.dataset.id;
    if (event.target.closest('.edit-btn')) {
      await this.handleEditTool(event, id);
    } else if (event.target.closest('.delete-btn')) {
      await this.handleDeleteTool(event, id);
    }
  }
  async handleEditTool(event, id) {
    let tool = await getTool(id);
    let toolNode = document.querySelector(`[data-id="${id}"]`);
    
    let originalChildren = [...toolNode.children];
    let form = this.renderEditToolForm(tool);

    toolNode.replaceChildren(form);

    form.addEventListener('click', event => {
      if (event.target.closest('#cancel-btn')) {
        toolNode.replaceChildren(...originalChildren);
      }
    });

    form.addEventListener('submit', (event) => this.handleEditSubmit(event, id, tool, toolNode, originalChildren));

  }
  async handleEditSubmit(event, id, tool, toolNode, originalChildren) {
    event.preventDefault();

    let form = event.target;
    let formData = new FormData(form);

    let updateData = Object.fromEntries(formData.entries());

    if (updateData.availability !== undefined) {
      updateData.availability = updateData.availability === 'true';
    }

    updateData = Object.fromEntries(
      Object.entries(updateData).filter(([key, value]) => tool[key] !== value)
    );
    
    if (Object.keys(updateData).length === 0) { 
      toolNode.replaceChildren(...originalChildren);
      return;
    }
    try {
      await editTool(id, JSON.stringify(updateData));
      await this.render();
    } catch (error) {
      console.error(error);
      this.renderFormError(form, error);
    }
  }
  async handleDeleteTool(event, id) {
    await deleteTool(id);
    await this.render();
  }
  openNewToolForm(event) {
    event.target.toggle('hidden');
  }
  createTextInput(htmlId, value) {
    let text = htmlId[0].toUpperCase() + htmlId.slice(1) + ': ';

    let div = document.createElement('div');
    div.classList.add('input-wrapper');

    let label = document.createElement('label');
    label.setAttribute('for', htmlId);
    label.textContent = text;
    div.appendChild(label);
    let input = document.createElement('input');
    input.type = 'text';
    input.name = htmlId;
    input.id = htmlId;
    input.value = value ?? '';
    div.appendChild(input);
    
    return div;
  }
  createSelectInput(htmlId, value, options) {
    let text = htmlId[0].toUpperCase() + htmlId.slice(1) + ': ';

    let div = document.createElement('div');
    div.classList.add('input-wrapper');

    let label = document.createElement('label');
    label.setAttribute('for', htmlId);
    label.textContent = text;
    div.appendChild(label);
    let input = document.createElement('select');
    input.name = htmlId;
    input.id = htmlId;
    div.appendChild(input);

    options.forEach(option => {
      let optionElement = document.createElement('option');
      optionElement.textContent = option;
      optionElement.value = option.toLowerCase();
      if (value !== undefined && optionElement.value === value) {
        optionElement.selected = true;
      }
      input.appendChild(optionElement);
    });
    
    return div;
  }
  renderFormError(form, error) {
    let message = document.createElement('p');
    message.classList.add('form-error');
    message.setAttribute('role', 'alert');
    message.textContent = error.message;

    form.querySelector('.form-error')?.remove();
    form.prepend(message);
  }
  renderToolForm({name, category, condition, availability} = {}) {
    let form = document.createElement('form');

    let nameDiv = this.createTextInput('name', name);
    form.appendChild(nameDiv)

    let categoryDiv = this.createTextInput('category', category);
    form.appendChild(categoryDiv);

    let conditionDiv = this.createSelectInput('condition', condition,
      ['New', 'Good', 'Fair', 'Poor']
    );
    form.appendChild(conditionDiv);

    let availabilityDiv = document.createElement('div');
    availabilityDiv.classList.add('input-wrapper');

    let availabilityInput1 = document.createElement('input');
    availabilityInput1.type = 'radio'
    availabilityInput1.name = 'availability';
    availabilityInput1.id = 'availability-true';
    availabilityInput1.value = true;
    availabilityDiv.appendChild(availabilityInput1)
    let availabilityLabel1 = document.createElement('label');
    availabilityLabel1.setAttribute('for', 'availability-true');
    availabilityLabel1.textContent = 'Available';
    availabilityDiv.appendChild(availabilityLabel1);

    let availabilityInput2 = document.createElement('input');
    availabilityInput2.type = 'radio'
    availabilityInput2.name = 'availability';
    availabilityInput2.id = 'availability-false';
    availabilityInput2.value = false;
    availabilityDiv.appendChild(availabilityInput2);
    let availabilityLabel2 = document.createElement('label');
    availabilityLabel2.setAttribute('for', 'availability-false');
    availabilityLabel2.textContent = 'Unavailable';
    availabilityDiv.appendChild(availabilityLabel2);

    if (availability !== undefined) {
      availability 
        ? availabilityInput1.checked = true 
        : availabilityInput2.checked = true;
    }
    form.appendChild(availabilityDiv);

    let controls = document.createElement('div');
    controls.classList.add('form-controle');
    let submit = document.createElement('button');
    submit.type = 'submit';
    submit.textContent = 'Submit';
    submit.id = 'submit-btn';
    let cancel = document.createElement('button');
    cancel.type = 'button';
    cancel.textContent = 'Cancel';
    cancel.id = 'cancel-btn';
    controls.appendChild(submit);
    controls.appendChild(cancel);
    
    form.appendChild(controls);

    return form;
  }
  renderEditToolForm(tool,) {
    return this.renderToolForm(tool);
  }
  async render() {
    try {
      const tools = await getTools();
      
      let h2 = document.createElement('h2');
      h2.textContent = 'Inventory';

      let createToolButton = document.createElement('button');
      createToolButton.textContent = 'New Tool';
      createToolButton.addEventListener('click', this.openNewToolForm.bind(this));

      let newToolForm = this.renderToolForm();
      newToolForm.classList.toggle('hidden');
      newToolForm.addEventListener('submit', this.handleNewSubmit.bind(this));

      let ul = this.renderTools(tools);
      ul.addEventListener('click', this.handleToolClick.bind(this));

      this.element.replaceChildren(h2, createToolButton, ul);
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
async function getTool(id) {
  const response = await fetch(`/api/tools/${id}`);

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error);
  }
  return response.json();
}
async function deleteTool(id) {
  const response = await fetch(`/api/tools/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error);
  }
}
async function editTool(id, updateData) {
  console.log(updateData);
  
  const response = await fetch(`/api/tools/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json"
    },
    body: updateData
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error);
  }
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