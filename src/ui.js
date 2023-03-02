
/* import {tasksData} from */
import * as main from  './main.js';



const taskList = document.querySelector('#tasklist');
const modal = document.querySelector('#modal');
const messBox = document.querySelector('#mess');
const statusButton = document.querySelector('#modal .options .button');

modal.querySelectorAll('section button').forEach(button => {
    button.addEventListener('click', (ev) => {
        const section = ev.target.closest('section');
        const input = section.querySelector('input[name="'+ev.target.dataset.action+'"]')
        main.actions({
            actionName: ev.target.dataset.action,
            addr: section.dataset.addr || null,
            value: input ? input.value.trim() : ev.target.dataset.value ? ev.target.dataset.value : null,
        });
        closeModal();
    })
});

modal.querySelectorAll('section .selector .button').forEach(button => {
    button.addEventListener('click', (ev) => {
        ev.target.nextElementSibling.classList.add('show');
    });
});



document.querySelector('#control button').addEventListener('click', (ev) => showModal(ev.target, 'addcat'))
modal.querySelectorAll('section > .close').forEach(el => el.addEventListener('click', closeModal));
modal.querySelectorAll('section .options > .close').forEach(el => el.addEventListener('click', (ev) => ev.target.offsetParent.classList.remove('show')));



// Закрытие модального слоя для редактирования
function closeModal(){
    modal.querySelectorAll('section').forEach(el => el.classList.add('hidden'));
    modal.classList.add('hidden');
    modal.querySelectorAll('section .options').forEach(el => el.classList.remove('show'));
}




// Отображение модального слоя с выбранным разделом.
function showModal(obj, sectionClass){
    modal.classList.remove('hidden');
    const activeSection = modal.querySelector('.'+sectionClass);
    activeSection.classList.remove('hidden');
    if(!obj.dataset.addr) return;
    activeSection.dataset.addr = obj.dataset.addr;
    const addr = obj.dataset.addr.split(',');
    switch(sectionClass){
        case 'category':
            activeSection.querySelector('input[name="editcat"]').value = main.tasksData.categories[addr[0]].title;
            break;
        case 'task':
            activeSection.querySelector('input[name="edittask"]').value = main.tasksData.categories[addr[0]].tasks[addr[1]].text;
            break;
        case 'subtask':
            console.log(main.tasksData.categories[addr[0]].tasks[addr[1]].subtasks[addr[2]].text)
            activeSection.querySelector('input[name="editsubtask"]').value = main.tasksData.categories[addr[0]].tasks[addr[1]].subtasks[addr[2]].text;
            break;
    }
}


export function updateMessenger(mess){
    messBox.classList.add('show');
    messBox.textContent = mess;
    setTimeout(() => {
        messBox.classList.remove('show');
        setTimeout(() => {
            messBox.textContent = '';
        }, 1000);
    }, 2000);
}


// Вывод списка задач по категориям
export function showTasks(){
    let tasksHTML = '';
    main.tasksData.categories.forEach((cat, key) => {
        tasksHTML += `<section><h2 class="cat" data-addr="${key}"> ${cat.title}</h2>`;
        if(cat.tasks){
            let taskHTML = '';
            cat.tasks.forEach((task, tn)=> {
                let subtaskHTML = '';
                if(task.subtasks){
                    task.subtasks.forEach((subtask, tsn) => {
                        subtaskHTML += `<div data-addr="${key},${tn},${tsn}" data-complete="${subtask.complete}" class="subtask"><span>${tsn+1}.</span> ${subtask.text}</div>\n`;
                    });
                }
                taskHTML += `
                    <div data-complete="${task.complete}" class="task">
                        <h3 data-addr="${key},${tn}">
                            <span>${tn+1}</span>
                            ${task.text}
                        </h3>
                        ${subtaskHTML}
                    </div>
                `;
            });
            tasksHTML += taskHTML;
        }
        tasksHTML += '</section>';
    });

    taskList.innerHTML = tasksHTML;

    document.querySelectorAll('h2.cat').forEach((el) => {
        el.addEventListener('click', (ev) => showModal(ev.target, 'category'));
    });
    document.querySelectorAll('div.task h3').forEach((el) => {
        el.addEventListener('click', (ev) => {
            const target = ev.target.tagName === 'SPAN' ? ev.target.closest('h3') : ev.target;
            showModal(target, 'task');
        });
    });
    document.querySelectorAll('div.subtask').forEach((el) => {
        el.addEventListener('click', (ev) => {
            const target = ev.target.tagName === 'SPAN' ? ev.target.closest('div.subtask') : ev.target;
            showModal(target, 'subtask');
        });
    });
}