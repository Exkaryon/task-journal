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
        return this.encodeDecodeData(mscData, false)
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
        const encodedData = this.encodeDecodeData(JSON.parse(content), true);       // Для глубокого клонирования используется методы кодирования JSON.
        const encodedContent = JSON.stringify(encodedData);

        let response = await fetch(this.remoteAddr+'&data='+encodedContent);
        const result = await response.text(); 
        console.log('Удаленный файл: '+result);
    }

    async writeLocalTaskfile(content){
        await this.fs.writeTextFile(this.fileName, content, { dir: this.baseDir });
        console.log('Локальный журнал обновлен.')
    }



    // Метод кодирования/декодирования строк (для хранения/извлечения данных на общедоступных сетевых ресурсах)
    encodeDecodeData(data, enc){
        data.categories.forEach((cat, key) => {
            data.categories[key].title = enc ? this.encode(cat.title) : this.decode(cat.title);
            cat.tasks.forEach((task, k) => {
                if(cat.tasks){
                    data.categories[key].tasks[k].text = enc ? this.encode(task.text) : this.decode(task.text);
                    if(task.subtasks){
                        task.subtasks.forEach((subtask, stk) => {
                            data.categories[key].tasks[k].subtasks[stk].text = enc ? this.encode(subtask.text) : this.decode(subtask.text);
                        });
                    }
                }
            });
        });

        return data;
    }


    encode(str){
        // Кодирование данных.
        const encodedChars = str.split('').map(value => value.charCodeAt(0) * 7);   // 7 - ключевой символ
        const charsNums = encodedChars.map(val => val.toString().length);
        const encodedData = (function(str, symbNums, strLength){
            // Подготовка строки, которая описывает сколько цифр содержится в каждом закодированном символе.
            let numString = '';
            symbNums.forEach(element => {
                let elemStr = element.toString();
                let num = elemStr.split('').length;
                if(num < 2){                            // Все числа должны быть одинаковой длинны, чтобы потом можно было раскодировать опираясь на позиции, где в каком месте находятся те или иные группы цифр и к чему они относятся. 
                    for(let i = 0; i < 2 - num; i++){   // Длина строки не может быть больше 2, но может быть меньше, поэтому тем, которые меньше, добавим лишний ноль спереди.
                        elemStr = '0'+ elemStr;
                    }
                }
                numString += elemStr;
            }); 
            // Подготовка строки с закодированными символами.
            let cryptoString = str.join('');
            // Структура закодироваанной строки: [число символов в исходной строке + число цифр в каждом закодированном символе + склееная закодированная строка]
            return (strLength.toString().split('').length < 2 ? '0' + strLength : strLength) +''+ numString +''+ cryptoString;
        })(encodedChars, charsNums, charsNums.length);
        return encodedData;
    }


    decode(encodedStr){
        // Кол-во символов в закодированной строке.
        const encodedStrLength = encodedStr.slice(0, 2);
        // Числа, описывающие, сколько цифр для каждого закодированного символа в строке.
        const charsNums = encodedStr.slice(2, encodedStrLength * 2 + 2);
        let numbersPerCharsArray = [];
        for(let i = 0; i < encodedStrLength; i++){
            numbersPerCharsArray.push(charsNums.slice(i*2, i*2 + 2));
        }
        // Получение массива закодированных символов закодированной строки в массив.
        const encodedCharsString = encodedStr.slice(encodedStrLength * 2 + 2);
        const encodedCharsArray = [];
        let start = 0;
        numbersPerCharsArray.forEach((val, key) => {
            encodedCharsArray.push(encodedCharsString.slice(start, start + parseInt(val)));
            start += parseInt(val);
        });
        // Раскодирование символов закодировонной строки и сборка их в строку.
        let decodedString = encodedCharsArray.map((encodedChar) => {
            const result = parseInt(encodedChar) / 7;       // 7 - ключевой символ
            if(!Number.isInteger(result)) return '--';
            return String.fromCharCode(result);
        }).join('');
        return decodedString;
    }

}
