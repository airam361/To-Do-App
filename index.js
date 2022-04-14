import {
  getToDos,
  deleteToDo,
  updateStatusToDo,
  editTitleToDo,
  createToDo,
} from "./httpRequests.js";

let pageState = {
  currentPage: 1,
  itemsPerPage: 10,
};

let list = document.querySelector(".items");
let loading = document.querySelector(".lds-dual-ring");
let textareaForm = document.querySelector("form .control textarea");
let btnForm = document.querySelector("form .form-actions button");
let selectFilter = document.querySelector(".options__filter select");
let btnSearch = document.querySelector(".options__search-box button");
let inputSearch = document.querySelector(".options__search-box input");
let pagination = document.querySelector(".pagination");
let selectItemsPerPage = document.querySelector(
  ".options__items-per-page select"
);

// Helpers
const resetForm = () => {
  btnForm.innerHTML = "Add TO DO";
  btnForm.setAttribute("dataid", "");
  textareaForm.value = "";
};

const idGenerator = () => {
  return new Date().getTime();
};

const getItemId = (element) => {
  return Number(element.getAttribute("dataid"));
};

const getImageByStatusTodo = (item) => {
  let image = "";
  if (JSON.parse(item["completed"])) {
    return (image = "./images/done.png");
  } else {
    return (image = "./images/pending.png");
  }
};

const filterAndSearchLink = () => {
  if (inputSearch.value.trim() === "" && selectFilter.value === "") {
    return "";
  } else if (inputSearch.value.trim() === "") {
    return `&completed=${selectFilter.value}`;
  } else if (selectFilter.value === "") {
    return `&title_like=${inputSearch.value}`;
  } else {
    return `&completed=${selectFilter.value}&q=${inputSearch.value}`;
  }
};

// Templates
const createItemTodoTemplate = (item) => {
  let image = getImageByStatusTodo(item);
  return `
  <li class="item" id="row_${item["id"]}">
    <div class="item__status">
      <button type="button" class="status" dataid=${item["id"]} status=${item["completed"]}>
        <img src=${image} />
      </button>
    </div>
    <div class="item__text">
      ${item["title"]}
    </div>
    <div class="item__actions" >
      <button type="button" class="edit" dataid=${item["id"]}>
        <img src="./images/edit.png" />
      </button>
      <button type="button" class="delete" dataid=${item["id"]}>
        <img src="./images/delete.png" />
      </button>
    </div>
  </li>
  `;
};

const createPaginationTemplate = (totalItems) => {
  let totalPages = Math.ceil(totalItems / pageState.itemsPerPage);
  let template = "";
  if (pageState.currentPage === 1) {
    template = '<a href="#" rel="prev" style="visibility:hidden">&laquo;</a>';
  } else {
    template = `<a href="#" rel="prev" page="${
      pageState.currentPage - 1
    }">&laquo;</a>`;
  }
  for (let i = 1; i <= totalPages; i++) {
    template += `<a class="${
      pageState.currentPage === i ? "active-page" : ""
    }" href="#" page="${i}">${i}</a>`;
  }
  if (pageState.currentPage === totalPages) {
    template += '<a href="#" rel="next" style="visibility:hidden">&raquo;</a>';
  } else {
    template += `<a href="#" rel="next" page="${
      pageState.currentPage + 1
    }">&raquo;</a>`;
  }
  return template;
};

// Events creators
const createPaginationEvents = () => {
  let pages = document.querySelectorAll(".pagination a");
  pages.forEach((item) => item.addEventListener("click", pageHandler));
};

const createToDosEvents = () => {
  let statusBtn = document.querySelectorAll(".status");
  let editBtn = document.querySelectorAll(".edit");
  let deleteBtn = document.querySelectorAll(".delete");

  statusBtn.forEach((item) =>
    item.addEventListener("click", clickStatusHandler)
  );

  editBtn.forEach((item) => item.addEventListener("click", clickEditHandler));

  deleteBtn.forEach((item) =>
    item.addEventListener("click", clickDeleteHandler)
  );
};

// Handlers
const pageHandler = (event) => {
  if (
    pageState.currentPage === Number(event.currentTarget.getAttribute("page"))
  ) {
    return;
  }
  pageState.currentPage = Number(event.currentTarget.getAttribute("page"));
  displayToDos();
};

const submitHandler = (event) => {
  event.preventDefault();
  if (textareaForm.value.trim() === "") {
    textareaForm.focus();
    return;
  }

  let btnDescript = event.currentTarget.innerHTML;
  const itemId = getItemId(event.currentTarget);

  if (btnDescript === "Add TO DO") {
    let newId = idGenerator();
    createToDo(newId, textareaForm.value).then((response) => {
      if (response.status === 201) {
        displayToDos();
      } else {
        alert("Could not create new ToDo!");
        return false;
      }
    });
  }
  if (btnDescript === "Edit TO DO") {
    editTitleToDo(itemId, textareaForm.value).then((response) => {
      if (response.status === 200) {
        displayToDos();
      } else {
        alert("Could not edit!");
        return false;
      }
    });
  }
  resetForm();
};

const clickStatusHandler = (event) => {
  const itemId = getItemId(event.currentTarget);
  const status = JSON.parse(event.currentTarget.getAttribute("status"));
  updateStatusToDo(itemId, !status).then((response) => {
    if (response.status === 200) {
      displayToDos();
    } else {
      alert("Could not update status!");
      return false;
    }
  });
};

const clickEditHandler = (event) => {
  const itemId = getItemId(event.currentTarget);
  let itemText = document.querySelector(
    `[id=row_${itemId}] .item__text`
  ).innerHTML;
  btnForm.innerHTML = "Edit TO DO";
  btnForm.setAttribute("dataid", itemId);
  textareaForm.value = itemText.trim();
};

const clickDeleteHandler = (event) => {
  const itemId = getItemId(event.currentTarget);
  deleteToDo(itemId).then((response) => {
    if (response.status === 200) {
      displayToDos();
    } else {
      alert("Could not delete!");
      return false;
    }
  });
};

const displayToDos = () => {
  let specialLink = filterAndSearchLink();

  loading.style.display = "inline-block";

  getToDos(specialLink, pageState.currentPage, pageState.itemsPerPage).then(
    (dataArr) => {
      loading.style.display = "none";
      list.innerHTML = "";
      dataArr[0].forEach(
        (item) => (list.innerHTML += createItemTodoTemplate(item))
      );
      createToDosEvents();
      pagination.innerHTML = createPaginationTemplate(dataArr[1]);
      createPaginationEvents();
    }
  );
};

//Events
btnForm.addEventListener("click", submitHandler);

selectFilter.addEventListener("change", () => {
  pageState.currentPage = 1;
  displayToDos();
});

btnSearch.addEventListener("click", () => {
  pageState.currentPage = 1;
  displayToDos();
});

inputSearch.addEventListener("keyup", (event) => {
  if (event.keyCode === 13) {
    pageState.currentPage = 1;
    displayToDos();
  }
});

selectItemsPerPage.addEventListener("click", (event) => {
  pageState.itemsPerPage = event.currentTarget.value;
  displayToDos();
});

window.addEventListener("load", displayToDos);
