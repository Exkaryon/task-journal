export default class Journal {

    baseDir = null;
    fileName = 'tasks-file.json';

    constructor(fs){
        this.fs = fs;
        this.baseDir = this.baseDir || this.fs.BaseDirectory.Document;
    }

    
    // Проверка наличия файла задач.
    async taskfileCheck(){
        const taskFileExist = await this.fs.exists(this.fileName, { dir: this.baseDir });
        await new Promise((resolve, reject) => {setTimeout(() => resolve(), 2000)});

        if(!taskFileExist){
            console.log('Файл журнала не найден!');
            return false;
        }
        return true;
    }


    // Чтение файла задач.
    async readTaskfile(){
        const content = await this.fs.readTextFile(this.fileName, { dir: this.baseDir });
        return JSON.parse(content);
    }

    // Сохранение файла задач.
    async saveData(tasksData){
        const content = JSON.stringify(tasksData);
        await this.fs.writeTextFile(this.fileName, content, { dir: this.baseDir });
        return true; 
    }
}
