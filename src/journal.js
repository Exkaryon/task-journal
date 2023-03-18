export default class Journal {

    baseDir = null;
    fileName = 'tasks-file.json';
    remoteAddr = 'http://127.0.0.5:85/taskdata_dispenser.php?app_enter_key=tauri_app'; // Для релиза необходим https!
    data = null;
    onlyType = false;               // Будет обновлятся/считываться только локальный или удаленный файл. local/remote
    state = {                       // Состояние доступности файлов журнала, их идентификаторы и данные.
        remote: {
            access: false,
            id: null,
            upDate: null,
        },
        local: {
            access: false,
            id: null,
            upDate: null,
        }
    };

    constructor(fs){
        this.fs = fs;
        this.baseDir = this.baseDir || this.fs.BaseDirectory.Document;
    }



    // Проверка наличия локального файла задач и его чтение.
    async readLocalTaskfile(){
        const taskFileExist = await this.fs.exists(this.fileName, { dir: this.baseDir });
        await new Promise((resolve, reject) => {setTimeout(() => resolve(), 2000)});
        if(!taskFileExist){
            console.warn('Локальный файл журнала не найден!');
            return false;
        }
        this.state.local.access = true;
        const content = await this.fs.readTextFile(this.fileName, { dir: this.baseDir });
        return JSON.parse(content);
    }



    // Проверка наличия удаленного файла задач и его чтение.
    async readRemoteTaskfile(){
        let mscData = null;
        //alert(this.remoteAddr);
        
        try {
            let response = await fetch(this.remoteAddr);
            mscData = await response.json();
            this.state.remote.access = true;
        } catch (error) {
            console.warn('Удаленный файл журнала недоступен!');
            alert(error);
        }
        return mscData;
    }



    // Проверка актуальности контента файлов задач.
    async getJournalData(){
        this.state.remote.data = await this.readRemoteTaskfile();
        this.state.local.data = await this.readLocalTaskfile();

        if(this.state.remote.access && this.state.local.access){
            if(this.state.remote.data.id == this.state.local.data.id){
                this.data = this.state.remote.data.updateCount >= this.state.local.data.updateCount ? this.state.remote.data : this.state.local.data;
            }else{
                const local = await confirm('Доступны локальный и удаленный файлы, но их Id не совпадает!\nИспользовать локальный файл?');
                this.data = local ? this.state.local.data : this.state.remote.data;
                this.onlyType = local ? 'local' : 'remote';
            }
        }else if (this.state.remote.access && !this.state.local.access){
            this.data = this.state.remote.data;
        }else if (!this.state.remote.access && this.state.local.access){
            this.data = this.state.local.data;
            this.onlyType = 'local';
        }else{
            this.data = {
                id: Date.now(),
                updateCount: 0,
                categories: []
            };
        }
    }


    // Сохранение файлов.
    async saveData(){
        const content = JSON.stringify(this.data);

        if(this.onlyType == 'remote'){
            this.writeRemoteTaskfile(content);
        }else if(this.onlyType == 'local'){
            this.writeLocalTaskfile(content);
        }else{
            this.writeRemoteTaskfile(content);
            this.writeLocalTaskfile(content);
        }

    }


    async writeRemoteTaskfile(content){
        let response = await fetch(this.remoteAddr+'&data='+content);
        const result = await response.text(); 
        console.log('Удаленный файл: '+result);
    }

    async writeLocalTaskfile(content){
        await this.fs.writeTextFile(this.fileName, content, { dir: this.baseDir });
        console.log('Локальный журнал обновлен.')
    }
}
