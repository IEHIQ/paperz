"use strict";
let gameField = document.querySelector(".game"); //поле игры
gameField.style.left = ((document.documentElement.clientWidth/2) - (gameField.clientWidth/2)) + 'px';
//центруем поле игры
let persons = document.querySelector(".persons"); //поле с людьми

let MAN_NAMES = ["Прохор", "Антуан", "Евгений", "Гарри", "Артур"];
let MAN_SURNAMES = ["Шувалов", "Цветков", "Галкин", "Прохоров", "Дружко"];

let WOMAN_NAMES = ["Глория", "Млада", "Рената", "Дарина", "Екатерина"];
let WOMAN_SURNAMES = ["Самойлова", "Кабанова", "Лукина", "Миронова", "Румянцева"];

let COUNTRIES = ["Россия", "Расея", "США", "Америка", "Турция", "Терция", "Украина", "Укроина", "Малайзия", "Малазия"];
let CAPITALS = ["Москва", "Масква", "Вашингтон", "Нашингтон", "Анкара", "Анкарась", "Киев", "Киви", "Куала-Лумпур", "Коала-Лемур"];

let VISIT_PURPOSES = ["Дипломатия", "Шпионаж", "Работа", "Торговля оружием", "Туризм", "Торговля", "Посещение родственников", "नृत्य", "Шоппинг", "Оказание услуг деньгомена"];

let VISIT_DURATIONS = [10, 15, 3, 5, 1];

function RandomInt(ceil) { //рандом целого числа от 0 до ceil-1
    return Math.floor(Math.random() * Math.floor(ceil));
} 

function GetStringDate(offset = 0) { //получение строки с датой в виде dd.mm.yyyy 
    let now = new Date();
    if (offset)
        now.setDate(now.getDate() + offset);
    return (now.getDate() + '.' + (now.getMonth() + 1) + '.' + now.getFullYear());
}

class Person { //класс человека
    constructor () {
        this.setProperties(this.generatePropArray());
    }

    HTMLify() { //перевод объекта "человек" в строку с html кодом для отображения на странице
        return `${this.surname}&nbsp;${this.name}<br>${this.country},&nbsp;${this.capital}<br>Цель визита: ${this.visitPurpose}<br>Дата въезда: ${this.entryDate}<br>Дата выезда: ${this.departureDate}`    
    }

    setProperties(propArray) { //установка полей объекта в соответствии со значениями в массива propArray
        this.watched = false;
        this.isGood = propArray[0];
        this.gender = propArray[1];
        if (this.gender) {
            this.name = MAN_NAMES[propArray[2]];
            this.surname = MAN_SURNAMES[propArray[3]];
        }
        else {
            this.name = WOMAN_NAMES[propArray[2]];
            this.surname = WOMAN_SURNAMES[propArray[3]];
        }
        if (this.isGood) {
            this.country = COUNTRIES[propArray[4]];
            this.capital = CAPITALS[propArray[4]];
            this.visitPurpose = VISIT_PURPOSES[propArray[5]];
            this.entryDate = GetStringDate();
            this.departureDate = GetStringDate((RandomInt(VISIT_DURATIONS[propArray[5]/2]) + 1));
        }
        else {
            this.country = COUNTRIES[propArray[4]];
            this.capital = CAPITALS[propArray[5]];
            this.visitPurpose = VISIT_PURPOSES[propArray[6]];
            this.entryDate = GetStringDate(-propArray[7]);
            this.departureDate = GetStringDate((RandomInt(VISIT_DURATIONS[propArray[6]]) + 1));
        }
    }

    generatePropArray() { //генерация рандомного propArray
        let propArray = new Array();
        propArray.push(RandomInt(2)); //isGood
        propArray.push(RandomInt(2)); //gender
        propArray.push(RandomInt(5)); //name
        propArray.push(RandomInt(5)); //surname
        if (propArray[0]) { //~if (IsGood)
            propArray.push(RandomInt(5) * 2); //country/capital
            propArray.push(RandomInt(5) * 2); //visitPurpose/departureDate
        }
        else {
            propArray.push(RandomInt(10)); //country
            propArray.push((RandomInt(4) * 2) + 1); //capital
            propArray.push(RandomInt(10)); //visitPurpose/departureDate
            propArray.push(RandomInt(3)); //entryDate
        }
        return propArray;
    }
}

function addPersonCard(pers) { //создание карточки человека и её добавление в поле с людьми на странице
    let lastPersonNode = document.createElement("div");
    lastPersonNode.innerHTML = pers.HTMLify();
    lastPersonNode.classList.add("personCard");
    persons.prepend(lastPersonNode);
}

let indicator1 = document.getElementById("1");
let indicator2 = document.getElementById("2"); //три индикатора ошибок
let indicator3 = document.getElementById("3");

let errors = [indicator1, indicator2, indicator3]; //массив для удобного "включения" индикаторов ошибок

let acceptButton = document.querySelector(".accept"); //кнопка "пропустить человека"
let declineButton = document.querySelector(".decline"); //кнопка "запретить проход человеку"
let startScreen = document.querySelector(".start_screen"); //стартовый экран
let endScreen = document.querySelector(".end_screen"); //экран конца игры
let winScreen = document.querySelector(".win_screen"); //экран выигрыша
let lastPerson; //последний пришедший человек
let wrongcount = 0; //кол-во ошибок
let rightcount = 0; //кол-во верных выборов
let timerText = document.querySelector(".timer"); //текст 10-секундного таймера 
let timer; //секундный таймер (раз в секунду уменьшает текст таймера на странице)
let game; //таймер игры (проверки и добавление нового человека раз в 10 секунд)


function gameOver(splash) { //функция конца игры
    timerText.style.display = "none";
    splash.style.display = "block";
    hideButtons();
    clearInterval(game);
    clearInterval(timer);
}

function hideButtons() { //скрытие кнопок пропуска/запрета пропуска
    acceptButton.disabled = true;
    declineButton.disabled = true;
}

function showButtons() { //показ кнопок пропуска/запрета пропуска
    acceptButton.disabled = false;
    declineButton.disabled = false;
}

function wrong() { //неправильное решение
    errors[wrongcount].classList.add("bad");
    persons.firstChild.classList.add("bad");
    wrongcount++;
    if(wrongcount >= 3)
        gameOver(endScreen);
}

function right() { //правильное решение
    persons.firstChild.classList.add("good");
    rightcount ++;
    if(rightcount >= 30)
        gameOver(winScreen);
}

function acceptClicked() { //клик по кнопке "пропустить"
    lastPerson.watched = true;
    resetIntervals();
    if (!lastPerson.isGood)
        wrong();
    else
        right();
    lastPerson = new Person();
    addPersonCard(lastPerson);
}

function declineClicked() { //клик по кнопке "запретить"
    lastPerson.watched = true;
    resetIntervals();
    if (lastPerson.isGood)
        wrong();
    else
    {
        right();
        persons.firstChild.remove();
    }
    lastPerson = new Person();
    addPersonCard(lastPerson);
}

function resetValues() { //сброс значений для рестарта игры
    wrongcount = 0;
    rightcount = 0;
    errors.forEach(indicator => {
        indicator.classList.remove("bad");
    });
    persons.innerHTML = "";
    timerText.style.display = "block";
    showButtons();
}

function reduceTimer() { timerText.innerText--; } //секундный таймер (раз в секунду уменьшает текст таймера на странице)

function gameCycle() { //итерация игрового цикла
    timerText.innerText = 10;
    if(!lastPerson.watched)
        wrong();
    lastPerson = new Person();
    addPersonCard(lastPerson);
}

function resetIntervals() // сброс интервалов по клику на кнопки пропуска/запрета пропуска
{
    clearInterval(timer);
    clearInterval(game);
    timerText.innerText = 10;
    timer = setInterval(reduceTimer, 1000);
    game = setInterval(gameCycle, 10000);
}

function start() { //клик по кнопке "Начать игру"/"Ещё раз" (запуск цикла игры и таймера)
    endScreen.style.display = "none";
    startScreen.style.display = "none";
    winScreen.style.display = "none";
    showButtons();
    resetValues();
    lastPerson = new Person();
    addPersonCard(lastPerson);
    timerText.innerText = 10;
    timer = setInterval(reduceTimer, 1000);
    game = setInterval(gameCycle, 10000);
}
