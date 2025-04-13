const boardButton = document.getElementById('add-board-button')
const container = document.querySelector('.container')
const resetBoard = document.getElementById('reset-board')

const closeModalButton = document.querySelector('.close-btn');
let modal = document.getElementById('custom-modal');
const closeboardModal = document.querySelector('.close-board-btn')
const boardModal = document.querySelector('.board-modal')
const warning = document.getElementById('warning')

document.addEventListener('DOMContentLoaded',()=>{
    modal.style.display = 'none'
    boardModal.style.display = 'none'
    warning.style.visibility = 'hidden'
})

closeModalButton.addEventListener('click', () => {
    modal.style.display = 'none';
    warning.style.visibility = 'hidden'
});

closeboardModal.addEventListener('click', () => {
    boardModal.style.display = 'none'
    warning.style.display = 'hidden'
})

window.addEventListener('click', (event) => {
    if (event.target === modal || event.target === boardModal) {
        modal.style.display = 'none';
        boardModal.style.display = 'none'
        warning.style.visibility = 'hidden'
    }
});

resetBoard.addEventListener('click', () => {
    localStorage.clear()
    location.reload()
})

function saveToLocalStorage(){
    const boards = []
    const allBoards = document.querySelectorAll('.board')
    allBoards.forEach((board) => {
        const boardData = {
            name:board.id,
            tasks: []
        }
        // const taskContent = {
        //     taskName:null,
        //     description:null,
        //     date:null
        // }
        const tasks = board.querySelectorAll('.item')
        tasks.forEach((task) => {
            const taskContent = {
            taskName : task.querySelector('.task-name').textContent,
            description : task.querySelector('.description').textContent,
            date : task.querySelector('.date').textContent,
            }
            boardData.tasks.push(taskContent)
        })
        boards.push(boardData)
    })
    localStorage.setItem("boards",JSON.stringify(boards))
}

function loadFromLocalStorage(){
    const savedBoards = JSON.parse(localStorage.getItem("boards"))
    if(!savedBoards) return
    savedBoards.forEach((boards) => {
        createBoard(boards.name)
        const currentBoard = document.getElementById(boards.name)
        const itemBox = currentBoard.querySelector('.item-box')
        
        boards.tasks.forEach((task) => {
            addTask(itemBox, task.taskName, task.description, task.date)
        })
    })
}

function attachItems(){
    const allBoards = document.querySelectorAll('.item-box')
    allBoards.forEach((b) => {
        b.addEventListener('dragover' , (e) => {
            e.preventDefault()
            const flyingElement = document.querySelector('.flying')
            if(!flyingElement) return

            let inplace = document.querySelector('.inplace')
            if(!inplace){
                inplace = document.createElement('div')
                inplace.classList.add('inplace')
                b.appendChild(inplace)
            }

            inplace.style.height = `${flyingElement.offsetHeight}px`
            inplace.style.width = `${flyingElement.offsetWidth}px`
            const afterElement = getDragAfterElement(b, e.clientY)

            if (afterElement == null){
                b.appendChild(inplace)
            }
            else{
                b.insertBefore(inplace, afterElement)
            }
        })
        b.addEventListener('drop', (e) => {
            e.preventDefault()
            const flyingElement = document.querySelector('.flying')
            const inplace = document.querySelector('.inplace')

            if(flyingElement && inplace){
                inplace.replaceWith(flyingElement)
            }
            saveToLocalStorage()
        })

        b.addEventListener('dragleave', (e) => {
            const inplace = document.querySelector('.inplace')
            if(inplace && !b.contains(e.relatedTarget)){
                inplace.remove()
            }
        })
    })
    
}

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.item:not(.flying)')];    
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - (box.top + (box.height / 2));
        
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

function attachDragEvents(item){
    item.addEventListener('dragstart', () => {
        item.classList.add('flying')
    })
    item.addEventListener('dragend', () => {
        item.classList.remove('flying')
    })

}

function deleteTask(button, task){
    button.addEventListener('click', ()=> {
        task.remove()
        saveToLocalStorage()
    })
}

function deleteBoard(button, board){
    button.addEventListener('click', () => {
        board.remove()
        saveToLocalStorage()
    })
}

function editTask(button, item){
    button.addEventListener('click', () => {
        modal.style.display = 'flex'
        const submitButton = document.getElementById('modal-submit')
        let input = document.getElementById('modal-input')
        const description = document.getElementById('description-input')
        input.value = item.children[0].children[0].textContent
        description.value = item.children[0].children[1].textContent

        const submitHandler = () => {
            if(!input.value.trim().length){
                warning.style.visibility = 'visible'
                return
            }
            else{
                item.children[0].children[0].textContent = input.value
                item.children[0].children[1].textContent = description.value
                
                modal.style.display ='none'
                input.value = '';
                description.value = '';
                warning.style.visibility = 'hidden'
                saveToLocalStorage()
            }
        }
        submitButton.addEventListener('click', submitHandler)
    })
}

function returnDate() {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();

    const getAmPm = hours >= 12 ? "PM" : "AM";

    const hours12 = hours % 12 === 0 ? 12 : hours % 12;

    const modifiedHour = hours12 < 10 ? `0${hours12}` : `${hours12}`;
    const modifiedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;

    const finalDate = `${day}/${month}/${year} ${modifiedHour}:${modifiedMinutes} ${getAmPm}`;
    return finalDate;
}

function addTask(parentBoard, taskText, descriptionText, dateText) {
    const itemCard = document.createElement('div');
    const taskContent = document.createElement('div');
    const taskName = document.createElement('h3');
    const description = document.createElement('p');
    const date = document.createElement('p');
    const buttonBox = document.createElement('div');
    const editButton = document.createElement('button');
    const deleteButton = document.createElement('button');

    // Set content for task
    taskName.classList.add('task-name');
    taskName.innerText = taskText;

    description.classList.add('description');
    description.innerText = descriptionText;

    date.classList.add('date');
    date.innerText = dateText;

    // Set up buttons
    editButton.innerText = 'Edit';
    deleteButton.innerText = 'Delete';

    // Add classes
    itemCard.classList.add('item');
    taskContent.classList.add('task-content');
    buttonBox.classList.add('buttons');

    // Make the item draggable
    itemCard.setAttribute('draggable', true);
    attachDragEvents(itemCard);

    // Append elements
    taskContent.appendChild(taskName);
    taskContent.appendChild(description);
    taskContent.appendChild(date);

    buttonBox.appendChild(editButton);
    buttonBox.appendChild(deleteButton);

    itemCard.appendChild(taskContent);
    itemCard.appendChild(buttonBox);

    parentBoard.appendChild(itemCard);

    // Attach functionality to buttons
    deleteTask(deleteButton, itemCard);
    editTask(editButton, itemCard);

    // Save to local storage
    saveToLocalStorage();
}

function addTaskToBoard(button){
    button.addEventListener('click', () => {
        modal.style.display = 'flex'
        const submitButton = document.getElementById('modal-submit')
        let input = document.getElementById('modal-input')
        const description = document.getElementById('description-input')
        const parentBoard = button.parentElement
        const itemB = parentBoard.children[1]
        const date = returnDate()

        input.addEventListener('input', () => {
            warning.style.visibility = 'hidden'
        })

        const submitHandler = () => {
            if(!input.value.trim().length){
                warning.style.visibility = 'visible'
                return
            }
            console.log(date)
            addTask(itemB, input.value, description.value, date)
            modal.style.display ='none'
            input.value = '';
            description.value = '';
            warning.style.visibility = 'hidden'

            submitButton.removeEventListener('click', submitHandler)
        }
        submitButton.addEventListener('click', submitHandler)
    })
}



function createBoard(input){
    const newBoard = document.createElement('div')
    const boardContent = document.createElement('div')
    const deleteBoardBtn = document.createElement('button')
    const text = document.createElement('h3')
    const itemBox = document.createElement('div')
    const taskB = document.createElement('button')

    boardContent.classList.add('board-content')
    deleteBoardBtn.classList.add('delete-board')

    deleteBoardBtn.innerHTML = '<i class="fas fa-trash-alt"></i>'
    deleteBoardBtn.title = "Delete Board"

    boardContent.appendChild(text)
    boardContent.appendChild(deleteBoardBtn)

    text.textContent = input
    taskB.textContent = "Add task"
    newBoard.id = `${text.textContent}`
    deleteBoard(deleteBoardBtn,newBoard)
    addTaskToBoard(taskB)

    itemBox.classList.add('item-box')
    taskB.classList.add('add-task-button')
    newBoard.classList.add('board')

    newBoard.appendChild(boardContent)
    newBoard.appendChild(itemBox)
    newBoard.appendChild(taskB)
    
    container.append(newBoard)

    newBoard.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
    saveToLocalStorage()
}

boardButton.addEventListener('click', () => {

    const boardModal = document.querySelector('.board-modal')
    boardModal.style.display = 'flex'

    const input = document.getElementById('board-input')
    const boardCreateButton = document.getElementById('create-board-btn')

    boardCreateButton.addEventListener('click', () => {
        boardModal.style.display = 'none'
        if(!input.value.trim().length) return
        createBoard(input.value)
        attachItems()
        input.value = ''
    })
})

function defaultLayout(){
    if(localStorage.getItem("boards")){
        loadFromLocalStorage()
        attachItems()
    }else {
        createBoard("To Do")
        createBoard("In Progress")
        createBoard("Done")
        attachItems()
        saveToLocalStorage()
    }
    
}

defaultLayout()