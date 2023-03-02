const { invoke } = window.__TAURI__.tauri;
const fs = window.__TAURI__.fs;


import Journal from './journal.js';
import * as ui from './ui.js';

const journal = new Journal(fs);
export let tasksData = {categories: []};




// Генерация списка задач по файлу списка задач
(async () => {
    const exist = await journal.taskfileCheck();
    if(exist === true){
        tasksData = await journal.readTaskfile();
        ui.showTasks(tasksData);
    };
})();




export async function actions(params){

    async function saveAndUpdate(mess){
        ui.showTasks();
        await journal.saveData(tasksData);
        ui.updateMessenger(mess);
    }

    const addr = params.addr ? params.addr.split(',') : params.addr;
    switch(params.actionName){
        case 'addcat':
            if(!params.value) return;
            tasksData.categories.push({title: params.value});
            saveAndUpdate('Категория добавлена.');
            break;
        case 'editcat':
            if(!params.value) return;
            tasksData.categories[addr[0]].title = params.value;
            saveAndUpdate('Категория обновлена.');
            break;
        case 'deletecat':
            let dlt = await confirm("Удалить категорию?");
            if(!dlt) return;
            let newCats = [];
            tasksData.categories.forEach((el, index) => {
                if(index != +addr[0]){
                    newCats.push(el);
                }
            });
            tasksData.categories = newCats;
            saveAndUpdate('Категория удалена.');
            break;
        case 'newtask':
            if(!params.value) return;
            if(!tasksData.categories[addr[0]].tasks) tasksData.categories[addr[0]].tasks = [];
            tasksData.categories[addr[0]].tasks.push({
                text: params.value,
                complete: false,
            });
            saveAndUpdate('Задача добавлена.');
            break;
        case 'edittask':
            tasksData.categories[addr[0]].tasks[addr[1]].text = params.value;
            saveAndUpdate('Задача обновлена.');
            break;
        case 'deletetask':
            let dlttask = await confirm("Удалить задачу?");
            if(!dlttask) return;
            let newTasks = [];
            tasksData.categories[addr[0]].tasks.forEach((el, index) => {
                if(index != +addr[1]){
                    newTasks.push(el);
                }
            });
            tasksData.categories[addr[0]].tasks = newTasks;
            saveAndUpdate('Задача удалена.');
            break;
        case 'newsubtask':
            if(!params.value) return;
            if(!tasksData.categories[addr[0]].tasks[addr[1]].subtasks) tasksData.categories[addr[0]].tasks[addr[1]].subtasks = [];
            tasksData.categories[addr[0]].tasks[addr[1]].subtasks.push({
                text: params.value,
                complete: false,
            });
            saveAndUpdate('Подзадача добавлена.');
            break;
        case 'editsubtask':
            if(!params.value) return;
            tasksData.categories[addr[0]].tasks[addr[1]].subtasks[addr[2]].text = params.value;
            saveAndUpdate('Подзадача обновлена.');
            break;
        case 'deletesubtask':
            let dltsubtask = await confirm("Удалить подзадачу?");
            if(!dltsubtask) return;
            let newSubTasks = [];
            tasksData.categories[addr[0]].tasks[addr[1]].subtasks.forEach((el, index) => {
                if(index != +addr[2]){
                    newSubTasks.push(el);
                }
            });
            tasksData.categories[addr[0]].tasks[addr[1]].subtasks = newSubTasks;
            saveAndUpdate('Подзадача удалена.');
            break;
        case 'changestat':
            if(addr.length == 2){
                tasksData.categories[addr[0]].tasks[addr[1]].complete = params.value;
            }else if(addr.length == 3){
                tasksData.categories[addr[0]].tasks[addr[1]].subtasks[addr[2]].complete = params.value;
            }
            saveAndUpdate('Статус задачи обновлен.');
            break;
    }
    //console.log(params);

}










/* const taskFileExist = await fs.exists('tasks-filed.json', { dir: fs.BaseDirectory.Document });
if(!taskFileExist){
    const r = await fs.writeTextFile('app.txt', 'file contents', { dir: fs.BaseDirectory.Document });
    console.log(r);
}else{
    console.log('еееее')
}

 */
/*
BASE DIRs:
Audio"        C:\\Users\\Pavel\\Music\\
Cache"        C:\\Users\\Pavel\\AppData\\Local\\      recursive: false ONLY
Config"       C:\\Users\\Pavel\\AppData\\Roaming\\    recursive: false ONLY
Data"         C:\\Users\\Pavel\\AppData\\Roaming\\    recursive: false ONLY
LocalData"    C:\\Users\\Pavel\\AppData\\Local\\      recursive: false ONLY
Desktop"      C:\\Users\\Pavel\\Desktop\\
Document"     C:\\Users\\Pavel\\Documents\\           recursive: false ONLY
Download"     C:\\Users\\Pavel\\Downloads\\
Executable"   Uncaught path:
Font"         Uncaught path:
Home"         C:\\Users\\Pavel\\                      recursive: false ONLY
Picture"      C:\\Users\\Pavel\\Pictures\
Public"       C:\\Users\\Public\\                     recursive: false ONLY
Runtime"      Uncaught path:
Template"     []
Video"        C:\\Users\\Pavel\\Videos\
Resource"     E:\\My Projects\\Services\\task-manager\\src-tauri\\target\\debug\
App"          Uncaught path:
Log"          Uncaught path:
Temp"         C:\\Users\\Pavel\\AppData\\Local\\Temp\\
AppConfig"    Uncaught path:
AppData"      Uncaught path:
AppLocalData" C:\\Users\\Pavel\\AppData\\Local\\com.tauri.dev\\
AppCache"     C:\\Users\\Pavel\\AppData\\Local\\com.tauri.dev\\
AppLog"       Uncaught path:

*/


/* const entries = await fs.readDir('C:\\', { recursive: false });
console.log(entries) */

/*
function processEntries(entries) {
    for (const entry of entries) {
        console.log(`Entry: ${entry.path}`);
        if (entry.children) {
            processEntries(entry.children)
        }
    }
}



let greetInputEl;
let greetMsgEl;

async function greet() {
    // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
    greetMsgEl.textContent = await invoke("greet", { name: greetInputEl.value });
}

window.addEventListener("DOMContentLoaded", () => {
    greetInputEl = document.querySelector("#greet-input");
    greetMsgEl = document.querySelector("#greet-msg");
    document
        .querySelector("#greet-button")
        .addEventListener("click", () => greet());
});

*/