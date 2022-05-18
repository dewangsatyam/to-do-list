let addBtn = document.querySelector(".add-btn"); //for implementing wht happens when click plus
let addFlag = false;

let modalCont = document.querySelector(".modal-cont");
let taskAreaCont = document.querySelector(".textarea-cont");
let mainCont = document.querySelector(".main-cont");

let colors = ["lightpink", "lightblue", "lightgreen", "black"];
let modalPriorityColor = colors[colors.length - 1]; //black-by default
let allPriorityColors = document.querySelectorAll(".priority-color"); //selects all colours

let removeFlag = false;

let removeBtn = document.querySelector(".remove-btn");

let lockClass = "fa-lock";
let unlockClass = "fa-lock-open";

let toolBoxColors = document.querySelectorAll(".color");
let ticketsArr = []; //will store array of objects and objects will be tickets
//if there are items in local storage
if (localStorage.getItem("jira_tickets")) {
  // Retrieve and display tickets
  ticketsArr = JSON.parse(localStorage.getItem("jira_tickets"));
  ticketsArr.forEach((ticketObj) => {
    createTicket(
      ticketObj.ticketColor,
      ticketObj.ticketKaValue,
      ticketObj.ticketID
    );
  });
}

// selelcting tickets according to priority
for (let i = 0; i < toolBoxColors.length; i++) {
  //add actionlistener on the toolbox priority color if clicked
  toolBoxColors[i].addEventListener("click", function (e) {
    //currentcolor selected
    let currentToolBoxColor = toolBoxColors[i].classList[0];
    //filter tickets which have currentToolBoxColor
    let filteredTickets = ticketsArr.filter((ticketObj, idx) => {
      return currentToolBoxColor === ticketObj.ticketColor;
    });
    //remove all previous tickets onscreen
    let allTicketsCont = document.querySelectorAll(".ticket-cont");
    for (let i = 0; i < allTicketsCont.length; i++) {
      allTicketsCont[i].remove();
    }
    //display the filtered tickets
    filteredTickets.forEach((ticketObj, idx) => {
      createTicket(
        ticketObj.ticketColor,
        ticketObj.ticketKaValue,
        ticketObj.ticketID
      );
    });
  });
  //double click par sari tickets wapis
  toolBoxColors[i].addEventListener("dblclick", (e) => {
    // Remove previous tickets
    let allTicketsCont = document.querySelectorAll(".ticket-cont");
    for (let i = 0; i < allTicketsCont.length; i++) {
      allTicketsCont[i].remove();
    }

    ticketsArr.forEach((ticketObj, idx) => {
      createTicket(
        ticketObj.ticketColor,
        ticketObj.ticketKaValue,
        ticketObj.ticketID
      );
    });
  });
}

addBtn.addEventListener("click", function (e) {
  //Display the Modal

  // addFlag , true - Modal Display
  //addFlag , false - Modal Hide

  addFlag = !addFlag; //click krne par negation hoga

  if (addFlag == true) {
    modalCont.style.display = "flex";
  } else {
    modalCont.style.display = "none";
  }
});

//Generating a ticket
modalCont.addEventListener("keydown", function (e) {
  let key = e.key;
  if (key == "Shift") {
    createTicket(modalPriorityColor, taskAreaCont.value);
    modalCont.style.display = "none"; //after ticket is generated bigtask writting should disapper
    addFlag = false; //after ticket has been added
    taskAreaCont.value = ""; //after ticket is added ,make the value of it null so freshcontent can be added to another ticket
    setModalToDefault();
  }
});
//function for creating ticket or generating ticket
function createTicket(ticketColor, ticketKaValue, ticketID) {
  let id = ticketID || shortid(); //shortid generates random id
  let ticketCont = document.createElement("div");
  ticketCont.setAttribute("class", "ticket-cont");

  ticketCont.innerHTML = `<div class="ticket-color ${ticketColor}"></div>
        <div class="ticket-id">#${id}</div>
        <div class="task-area">${ticketKaValue}</div>
        <div class="ticket-lock">
          <i class="fa-solid fa-lock"></i>
        </div>`;

  mainCont.appendChild(ticketCont); //append this div of ticketCont into mainCont where mainCont is the parent
  handleRemoval(ticketCont, id);

  handleLock(ticketCont, id);

  handleColor(ticketCont, id);
  //now store the tickets as objects in an array ticketArr
  //create object of ticket and add to array
  if (!ticketID) {
    ticketsArr.push({ ticketColor, ticketKaValue, ticketID: id });
    //in local storage we pass the array of ticket object
    localStorage.setItem("jira_tickets", JSON.stringify(ticketsArr));
  } //give ticketId as id otherwise it comes undefined
}

//changing priority colours for modalContainer ie bigtask one
allPriorityColors.forEach(function (colorElem) {
  colorElem.addEventListener("click", function (e) {
    allPriorityColors.forEach(function (priorityColorElem) {
      priorityColorElem.classList.remove("active");
    }); //sabpar active remove krdo
    colorElem.classList.add("active"); //jispar click hua hai ie colorElem uspar active lagado

    modalPriorityColor = colorElem.classList[0]; //we will get the colour of the colorElem
    //and change it from black to the colorElem wala colour
  });
});

//remove button click -Remove tickets function-remove when this is set to true and willkeep delelting till we press the cross again
removeBtn.addEventListener("click", function () {
  removeFlag = !removeFlag;
  if (removeFlag == true) {
    removeBtn.style.color = "red";
  }
  if (removeFlag == false) {
    removeBtn.style.color = "white";
  }
});
//handles ticket removal when cross ispressed and is true
function handleRemoval(ticket, id) {
  ticket.addEventListener("click", function () {
    if (!removeFlag) return;

    let idx = getTicketIdx(id); // idx

    // localStorgae removal of ticket

    let deletedElement = ticketsArr.splice(idx, 1);

    //deleteElements.push(deletedElement)

    let strTicketArray = JSON.stringify(ticketsArr);

    localStorage.setItem("jira_tickets", strTicketArray);

    ticket.remove(); // ui removal
  });
}

//Lock and unlock tickets
function handleLock(ticket, id) {
  let ticketLockElem = ticket.querySelector(".ticket-lock");
  let ticketLock = ticketLockElem.children[0];

  //textarea
  let ticketTaskArea = ticket.querySelector(".task-area");

  ticketLock.addEventListener("click", function () {
    //get ticketidx from the tickets array
    let ticketIdx = getTicketIdx(id);

    if (ticketLock.classList.contains(lockClass)) {
      ticketLock.classList.remove(lockClass);
      ticketLock.classList.add(unlockClass);
      ticketTaskArea.setAttribute("contenteditable", "true");
    } else {
      ticketLock.classList.remove(unlockClass);
      ticketLock.classList.add(lockClass);
      ticketTaskArea.setAttribute("contenteditable", "false");
    }
    //modify data in local storage
    ticketsArr[ticketIdx].ticketKaValue = ticketTaskArea.innerText;
    localStorage.setItem("jira_tickets", JSON.stringify(ticketsArr)); //now completely update local storage
  });
}

//for changing priority colour of small ticket
function handleColor(ticket, id) {
  let ticketColor = ticket.querySelector(".ticket-color");
  ticketColor.addEventListener("click", function (e) {
    //get ticketidx from the tickets array
    let ticketIdx = getTicketIdx(id);
    let currentTicketColor = ticketColor.classList[1];
    //get ticket index-from the colours array
    let currentTicketColorIdx = colors.findIndex((color) => {
      return currentTicketColor === color;
    }); //findIdx is a higher order function
    currentTicketColorIdx++;
    let newTicketColorIdx = currentTicketColorIdx % colors.length;
    let newTicketColor = colors[newTicketColorIdx];
    ticketColor.classList.remove(currentTicketColor);
    ticketColor.classList.add(newTicketColor);

    //after we get ticketidx->modify data in localstorage (priority colour change)
    ticketsArr[ticketIdx].ticketColor = newTicketColor;
    localStorage.setItem("jira_tickets", JSON.stringify(ticketsArr)); //now completely update local storage
  });
}
function getTicketIdx(id) {
  let ticketIdx = ticketsArr.findIndex((ticketObj) => {
    return ticketObj.ticketID === id;
  });
  return ticketIdx;
}
//to make deafult value of priority color as black in small ticket and bid ticket
function setModalToDefault() {
  // modalCont.style.display = "none";
  // textareaCont.value = "";
  modalPriorityColor = colors[colors.length - 1];
  allPriorityColors.forEach((priorityColorElem, idx) => {
    priorityColorElem.classList.remove("active");
  });
  allPriorityColors[allPriorityColors.length - 1].classList.add("active");
}
