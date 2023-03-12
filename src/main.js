const { invoke } = window.__TAURI__.tauri;
const fs = window.__TAURI__.fs;


import Journal from './journal.js';
import * as ui from './ui.js';

export const journal = new Journal(fs);




// Генерация списка задач по файлу списка задач
(async () => {
    await journal.getJournalData();
    ui.showState();
    ui.showTasks();
})();




export async function actions(params){

    async function saveAndUpdate(mess){
        journal.data.updateCount++;
        ui.showTasks();
        await journal.saveData();
        ui.updateMessenger(mess);
    }

    const addr = params.addr ? params.addr.split(',') : params.addr;
    switch(params.actionName){
        case 'addcat':
            if(!params.value) return;
            journal.data.categories.push({title: params.value});
            saveAndUpdate('Категория добавлена.');
            break;
        case 'editcat':
            if(!params.value) return;
            journal.data.categories[addr[0]].title = params.value;
            saveAndUpdate('Категория обновлена.');
            break;
        case 'deletecat':
            let dlt = await confirm("Удалить категорию?");
            if(!dlt) return;
            let newCats = [];
            journal.data.categories.forEach((el, index) => {
                if(index != +addr[0]){
                    newCats.push(el);
                }
            });
            journal.data.categories = newCats;
            saveAndUpdate('Категория удалена.');
            break;
        case 'newtask':
            if(!params.value) return;
            if(!journal.data.categories[addr[0]].tasks) journal.data.categories[addr[0]].tasks = [];
            journal.data.categories[addr[0]].tasks.push({
                text: params.value,
                complete: false,
            });
            saveAndUpdate('Задача добавлена.');
            break;
        case 'edittask':
            journal.data.categories[addr[0]].tasks[addr[1]].text = params.value;
            saveAndUpdate('Задача обновлена.');
            break;
        case 'deletetask':
            let dlttask = await confirm("Удалить задачу?");
            if(!dlttask) return;
            let newTasks = [];
            journal.data.categories[addr[0]].tasks.forEach((el, index) => {
                if(index != +addr[1]){
                    newTasks.push(el);
                }
            });
            journal.data.categories[addr[0]].tasks = newTasks;
            saveAndUpdate('Задача удалена.');
            break;
        case 'newsubtask':
            if(!params.value) return;
            if(!journal.data.categories[addr[0]].tasks[addr[1]].subtasks) journal.data.categories[addr[0]].tasks[addr[1]].subtasks = [];
            journal.data.categories[addr[0]].tasks[addr[1]].subtasks.push({
                text: params.value,
                complete: false,
            });
            saveAndUpdate('Подзадача добавлена.');
            break;
        case 'editsubtask':
            if(!params.value) return;
            journal.data.categories[addr[0]].tasks[addr[1]].subtasks[addr[2]].text = params.value;
            saveAndUpdate('Подзадача обновлена.');
            break;
        case 'deletesubtask':
            let dltsubtask = await confirm("Удалить подзадачу?");
            if(!dltsubtask) return;
            let newSubTasks = [];
            journal.data.categories[addr[0]].tasks[addr[1]].subtasks.forEach((el, index) => {
                if(index != +addr[2]){
                    newSubTasks.push(el);
                }
            });
            journal.data.categories[addr[0]].tasks[addr[1]].subtasks = newSubTasks;
            saveAndUpdate('Подзадача удалена.');
            break;
        case 'changestat':
            if(addr.length == 2){
                journal.data.categories[addr[0]].tasks[addr[1]].complete = params.value;
            }else if(addr.length == 3){
                journal.data.categories[addr[0]].tasks[addr[1]].subtasks[addr[2]].complete = params.value;
            }
            saveAndUpdate('Статус задачи обновлен.');
            break;
    }
 
}


