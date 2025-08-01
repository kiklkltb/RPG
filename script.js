// // --- 1. Данные персонажа ---
let character = {
    name: "Герой",
    level: 1,
    exp: 0,
    expNeeded: 100,
    statPoints: 0,
    totalStatPoints: 0,
    stats: {
        str: 1, agi: 1, int: 1, vit: 1, luk: 1, cha: 1, acc: 1, wis: 1
    },
    abilities: [],
    dailyTasks: [],
    lastLoginDate: null,
    yellowMandatoryCompleted: false,
    redMandatoryCompleted: false
};

// --- 2. Элементы DOM для обновления ---
const charNameEl = document.getElementById('char-name');
const charLevelEl = document.getElementById('char-level');
const charExpEl = document.getElementById('char-exp');
const expNeededEl = document.getElementById('exp-needed');
const statPointsEl = document.getElementById('stat-points');
const expBarEl = document.getElementById('exp-bar');
const statsListEl = document.querySelector('.stats-list ul');
const charRankEl = document.getElementById('char-rank');
const resetStatsBtn = document.getElementById('reset-stats-btn');
const taskListEl = document.getElementById('task-list');
const timerEl = document.getElementById('timer');
const abilitiesEl = document.getElementById('character-abilities');
const newNameInputEl = document.getElementById('new-name-input');
const levelUpMessageEl = document.getElementById('level-up-message');
const notificationContainerEl = document.getElementById('notification-container');
const battleBtnEl = document.getElementById('battle-btn');
const battleLogEl = document.getElementById('battle-log');


// --- 3. Функции сохранения и загрузки прогресса ---
function saveProgress() {
    localStorage.setItem('myRpgCharacter', JSON.stringify(character));
}

function loadProgress() {
    const savedCharacter = localStorage.getItem('myRpgCharacter');
    if (savedCharacter) {
        try {
            character = JSON.parse(savedCharacter);
        } catch (e) {
            console.error("Failed to parse saved character data. Starting a new game.");
            // Если данные повреждены, начинаем новую игру
            localStorage.removeItem('myRpgCharacter');
        }
    }
}

// --- 4. Функции обновления интерфейса и ранга ---
function getRank() {
    const level = character.level;
    if (level >= 999) return "Трансцендентный";
    if (level >= 900) return "Пробужденный";
    if (level >= 700) return "Ранг SSS";
    if (level >= 500) return "Ранг SS";
    if (level >= 300) return "Ранг S";
    if (level >= 200) return "Ранг A";
    if (level >= 100) return "Ранг B";
    if (level >= 50) return "Ранг C";
    if (level >= 20) return "Ранг D";
    if (level >= 10) return "Ранг E";
    if (level >= 5) return "Охотник-Новичок";
    return "Новичок";
}

function getRankClass(rank) {
    if (rank === "Трансцендентный") return "rank-transcendent";
    if (rank === "Пробужденный") return "rank-awakened";
    if (rank === "Ранг SSS") return "rank-sss-rank";
    if (rank === "Ранг SS") return "rank-ss-rank";
    if (rank === "Ранг S") return "rank-s-rank";
    if (rank === "Ранг A") return "rank-a-rank";
    if (rank === "Ранг B") return "rank-b-rank";
    if (rank === "Ранг C") return "rank-c-rank";
    if (rank === "Ранг D") return "rank-d-rank";
    if (rank === "Ранг E") return "rank-e-rank";
    if (rank === "Охотник-Новичок") return "rank-novice-hunter";
    return "rank-novice";
}


function updateUI() {
    charNameEl.textContent = character.name;
    charLevelEl.textContent = character.level;
    charExpEl.textContent = character.exp;
    expNeededEl.textContent = character.expNeeded;
    statPointsEl.textContent = character.statPoints;

    const currentRank = getRank();
    charRankEl.textContent = currentRank;
    charRankEl.className = getRankClass(currentRank);

    if (character.abilities.length > 0) {
        const sortedAbilities = character.abilities.slice().sort((a, b) => {
            const getIndex = r => ["Common", "Uncommon", "Rare", "Very Rare", "Epic", "Legendary", "Mythic", "Divine", "??? / Hidden"].indexOf(r || "");
            const ar = abilitiesList.find(x => x.name === a)?.rarity || "";
            const br = abilitiesList.find(x => x.name === b)?.rarity || "";
            if (ar !== br) return getIndex(ar) - getIndex(br);
            return a.localeCompare(b);
        });

        const abilityHTML = sortedAbilities.map(name => {
            const ability = abilitiesList.find(a => a.name === name);
            if (!ability) return `<span>${name}</span>`;
            let color = '#777';
            let style = '';
            switch (ability.rarity) {
                case 'Common': color = '#999'; break;
                case 'Uncommon': color = '#4caf50'; break;
                case 'Rare': color = '#2196f3'; break;
                case 'Very Rare': color = '#9c27b0'; break;
                case 'Epic': color = '#ff5722'; break;
                case 'Legendary': color = '#fbc02d'; break;
                case 'Mythic': color = '#673ab7'; break;
                case 'Divine': color = '#e91e63'; break;
                case '??? / Hidden':
                    color = '#000';
                    style = 'animation: flicker 1s infinite alternate;';
                    break;
            }

            let description = ability.name;
            let displayedName = ability.name;

            if (ability.rarity === "??? / Hidden") {
                if (character.level >= ability.revealLevel) {
                    // Способность раскрылась
                    description = ability.description;
                    // Можно изменить редкость, чтобы сменился цвет
                    color = '#e91e63'; // Например, на цвет "Divine"
                    style = '';
                    showNotification(`Способность "${ability.name}" раскрыта!`, 'success');
                    // Нужно обновить редкость в abilitiesList, чтобы она не была "???" при следующей загрузке
                    ability.rarity = 'Divine';
                } else {
                    // Способность ещё скрыта
                    description = ability.hint;
                    displayedName = "???"; // Отображаем как "???"
                    // Здесь можно использовать тот же цвет и стиль, что и раньше
                    color = '#000';
                    style = 'animation: flicker 1s infinite alternate;';
                }
            }

            return `<span title="${description}" style="color:${color};${style}">${displayedName}</span>`;
        }).join(', ');

        abilitiesEl.innerHTML = `Способности: ${abilityHTML}`;
    } else {
        abilitiesEl.innerHTML = '';
    }

    const expPercentage = (character.exp / character.expNeeded) * 100;
    expBarEl.style.width = `${expPercentage}%`;

    document.getElementById('stat-str').textContent = character.stats.str;
    document.getElementById('stat-agi').textContent = character.stats.agi;
    document.getElementById('stat-int').textContent = character.stats.int;
    document.getElementById('stat-vit').textContent = character.stats.vit;
    document.getElementById('stat-luk').textContent = character.stats.luk;
    document.getElementById('stat-cha').textContent = character.stats.cha;
    document.getElementById('stat-acc').textContent = character.stats.acc;
    document.getElementById('stat-wis').textContent = character.stats.wis;

    const addStatButtons = document.querySelectorAll('.add-stat-btn');
    addStatButtons.forEach(button => {
        button.style.display = character.statPoints > 0 ? 'inline' : 'none';
    });
    resetStatsBtn.style.display = character.totalStatPoints > 0 ? 'inline' : 'none';

    renderTasks();
}

function showLevelUpMessage() {
    levelUpMessageEl.classList.add('show');
    setTimeout(() => {
        levelUpMessageEl.classList.remove('show');
    }, 1500);
}

// НОВАЯ ФУНКЦИЯ: Показать уведомление
function showNotification(message, type = 'info') {
    const notificationEl = document.createElement('div');
    notificationEl.classList.add('notification', type);
    notificationEl.textContent = message;

    notificationContainerEl.appendChild(notificationEl);

    // Показываем уведомление с небольшой задержкой, чтобы сработал CSS-transition
    setTimeout(() => {
        notificationEl.classList.add('show');
    }, 10);

    // Удаляем уведомление через несколько секунд
    setTimeout(() => {
        notificationEl.classList.remove('show');
        notificationEl.addEventListener('transitionend', () => {
            notificationEl.remove();
        });
    }, 3000);
}
// --- 5. Функция для получения опыта и проверки уровня ---
function gainExp(amount) {
    character.exp += amount;

    while (character.exp >= character.expNeeded) {
        character.exp -= character.expNeeded;
        character.level += 1;
        character.statPoints += 5;
        character.expNeeded = Math.floor(character.expNeeded * 1.5);
    }

    if (character.level > oldLevel) {
        showLevelUpMessage();
    }

    updateUI();
    saveProgress();
}

// НОВАЯ ФУНКЦИЯ: Мини-игра "Сражение"
function startBattle() {
    const monsterLevel = Math.floor(character.level * (0.8 + Math.random() * 0.4));
    const monsterStrength = Math.floor(monsterLevel * 5 + Math.random() * 20);
    const playerStrength = character.stats.str * character.level;

    battleLogEl.innerHTML = `<p>Вы нашли монстра Ур. ${monsterLevel} со силой ${monsterStrength}!</p>`;

    if (playerStrength > monsterStrength) {
        const expGained = monsterStrength * 5;
        gainExp(expGained);
        battleLogEl.innerHTML += `<p><strong>Победа!</strong> Вы одолели монстра и получили ${expGained} опыта.</p>`;
        showNotification(`Вы победили! Получено ${expGained} опыта.`, 'success');
    } else {
        const expLost = Math.floor(character.expNeeded * 0.1);
        character.exp = Math.max(0, character.exp - expLost);
        battleLogEl.innerHTML += `<p><strong>Поражение...</strong> Монстр оказался сильнее. Вы потеряли ${expLost} опыта.</p>`;
        showNotification(`Вы проиграли... Потеряно ${expLost} опыта.`, 'error');
        updateUI();
        saveProgress();
    }
}

// --- 6. Функции для ежедневных заданий ---
const allTasks = {
    easy: [
        { text: 'Почитать манхву', exp: 10 },
        { text: 'Играть в шахматы', exp: 15 },
    ],
    medium: [
        { text: 'Учить английский', exp: 40 },
        { text: 'Читать Библию', exp: 50 },
    ],
    hard: [
        { text: 'Тренировка с Эспандером', exp: 100 },
        { text: 'Тренировка кроссфита', exp: 120 }
    ],
    divine: [
        { text: 'Тренировка с железом', exp: 300 }
    ],
    bonus: [
        { text: 'Поиграть в футбол', exp: 20, statBonus: { vit: 1, agi: 1 } }
    ],
    mandatory: {
        yellow: { text: 'Не скачивать игры', statPoints: 1, penalty: 'level' },
        red: { text: '🔞🎰', statPoints: 2, penalty: 'death' }
    }
};

function generateDailyTasks() {
    character.dailyTasks = [];

    allTasks.easy.forEach(task => character.dailyTasks.push({ ...task, completed: false, type: 'easy' }));
    allTasks.medium.forEach(task => character.dailyTasks.push({ ...task, completed: false, type: 'medium' }));
    allTasks.hard.forEach(task => character.dailyTasks.push({ ...task, completed: false, type: 'hard' }));
    allTasks.divine.forEach(task => character.dailyTasks.push({ ...task, completed: false, type: 'divine' }));
    allTasks.bonus.forEach(task => character.dailyTasks.push({ ...task, completed: false, type: 'bonus' }));

    character.dailyTasks.push({ ...allTasks.mandatory.yellow, completed: false, type: 'mandatory-yellow' });
    character.dailyTasks.push({ ...allTasks.mandatory.red, completed: false, type: 'mandatory-red' });

    character.yellowMandatoryCompleted = false;
    character.redMandatoryCompleted = false;

    saveProgress();
}

function getTaskLevelClass(task) {
    if (task.type === 'mandatory-yellow') return 'task-level-yellow-mandatory';
    if (task.type === 'mandatory-red') return 'task-level-red-mandatory';

    const exp = task.exp;
    if (exp <= 15) return 'task-level-easy';
    if (exp <= 50) return 'task-level-medium';
    if (exp <= 150) return 'task-level-hard';
    if (exp > 150) return 'task-level-divine';
    return '';
}

function renderTasks() {
    taskListEl.innerHTML = '';
    character.dailyTasks.forEach((task, index) => {
        const taskItem = document.createElement('div');
        taskItem.classList.add('task-item', getTaskLevelClass(task));
        if (task.completed) {
            taskItem.classList.add('completed');
        }

        const taskText = document.createElement('span');
        taskText.textContent = task.text;
        taskItem.appendChild(taskText);

        const taskBtn = document.createElement('button');
        taskBtn.classList.add('complete-task-btn');
        taskBtn.dataset.index = index;

        if (task.type === 'mandatory-yellow' || task.type === 'mandatory-red') {
            taskBtn.textContent = `Выполнить (+${task.statPoints} очко)`;
        } else if (task.type === 'bonus') {
            taskBtn.textContent = `Выполнить (+${task.exp} EXP, +1 к характеристикам)`;
        }
        else {
            taskBtn.textContent = `Выполнить (+${task.exp} EXP)`;
        }

        if (task.completed) {
            taskBtn.disabled = true;
            taskBtn.textContent = 'Выполнено';
        }

        taskItem.appendChild(taskBtn);
        taskListEl.appendChild(taskItem);
    });
}

function completeTask(index) {
    const task = character.dailyTasks[index];
    if (task && !task.completed) {
        if (task.type === 'mandatory-yellow') {
            character.statPoints += task.statPoints;
            character.yellowMandatoryCompleted = true;
            showNotification('Вы успешно выполнили обязательное задание и получили 1 очко характеристик!');
        } else if (task.type === 'mandatory-red') {
            character.statPoints += task.statPoints;
            character.redMandatoryCompleted = true;
            showNotification('Вы успешно выполнили опасное задание и получили 2 очка характеристик!');
        } else if (task.type === 'bonus') {
            gainExp(task.exp);
            for (const stat in task.statBonus) {
                character.stats[stat] += task.statBonus[stat];
                character.totalStatPoints += 1;
            }
            showNotification(`Вы выполнили бонусное задание! Получено +${task.statBonus.vit} VIT и +${task.statBonus.agi} AGI!`);
        } else {
            gainExp(task.exp);
        }
        task.completed = true;
        saveProgress();
        updateUI();
    }
}

// --- 7. Функции для способностей ---
let abilitiesList = [];

async function loadAbilities() {
    const res = await fetch('abilities.json');
    const data = await res.json();
    abilitiesList = data;
}
function randomAbilityEvent() {
    const chance = Math.random();
    if (chance <= 0.6) {
        const newAbility = abilitiesList[Math.floor(Math.random() * abilitiesList.length)];
        if (!character.abilities.includes(newAbility)) {
            character.abilities.push(newAbility);
            showNotification(`Вам повезло! Вы получили новую способность: "${newAbility}"!"`);
        } else {
            showNotification("Вы получили уже имеющуюся способность. Ничего не произошло.");
        }
    } else if (chance > 0.6 && chance <= 0.7) {
        if (character.abilities.length > 0) {
            const lostAbility = character.abilities.splice(Math.floor(Math.random() * character.abilities.length), 1)[0];
            showNotification(`Внимание! Вы потеряли способность: "${lostAbility}".`);
        } else {
            showNotification("Вам повезло! У вас не было способностей, чтобы их отнять.");
        }
    } else {
        showNotification("Сегодня ничего особенного не произошло.");
    }
    saveProgress();
}

// --- 8. Обработчики событий ---
statsListEl.addEventListener('click', (event) => {
    if (event.target.classList.contains('add-stat-btn')) {
        const statType = event.target.dataset.stat;
        if (character.statPoints > 0) {
            character.statPoints -= 1;
            character.stats[statType] += 1;
            character.totalStatPoints += 1;
            updateUI();
            saveProgress();
        }
    }
});

resetStatsBtn.addEventListener('click', () => {
    const totalPoints = character.totalStatPoints;
    if (confirm(`Вы уверены, что хотите сбросить все характеристики? Вы получите обратно ${totalPoints} очков.`)) {
        for (const stat in character.stats) {
            character.stats[stat] = 1;
        }
        character.statPoints += totalPoints;
        character.totalStatPoints = 0;
        updateUI();
        saveProgress();
    }
});

taskListEl.addEventListener('click', (event) => {
    if (event.target.classList.contains('complete-task-btn')) {
        const taskIndex = parseInt(event.target.dataset.index);
        completeTask(taskIndex);
    }
});

battleBtnEl.addEventListener('click', startBattle);

// --- 9. Инициализация и таймер ---
async function initializeGame() {
    await loadAbilities();
    const today = new Date().toDateString();

    // Загружаем сохраненный прогресс
    loadProgress();

    // Если это первый вход или новый день
    if (!character.lastLoginDate || character.lastLoginDate !== today) {
        // Проверка обязательных заданий, если это не первый вход
        if (character.lastLoginDate) {
            if (!character.yellowMandatoryCompleted) {
                character.level = Math.max(1, character.level - 1);
                showNotification('Вы не выполнили жёлтое обязательное задание! Ваш уровень понижен на 1.');
            }
            if (!character.redMandatoryCompleted) {
                alert('Вы не выполнили красное обязательное задание! Ваш персонаж умер, и прогресс сброшен.');
                localStorage.removeItem('myRpgCharacter');
                location.reload();
                return;
            }
        }

        // Сбрасываем задания на новый день и запускаем случайное событие
        character.lastLoginDate = today;
        generateDailyTasks();
        randomAbilityEvent();
    }

    updateUI();
    saveProgress();
}

function updateTimer() {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    const timeLeft = midnight.getTime() - now.getTime();

    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

    timerEl.textContent = `${hours}ч ${minutes}м ${seconds}с`;
}

document.addEventListener('DOMContentLoaded', () => {
    initializeGame();
    setInterval(updateTimer, 1000);
});


function claimDailyAbility() {
    const today = new Date().toDateString();
    if (character.lastAbilityClaim === today) {
        showNotification("Вы уже получали способность сегодня. Попробуйте завтра!");
        return;
    }
    const chance = Math.random();
    if (chance <= 0.6) {
        const pool = abilitiesList;
        const ability = pool[Math.floor(Math.random() * pool.length)];
        if (!character.abilities.includes(ability.name)) {
            character.abilities.push(ability.name);
            showNotification(`Поздравляем! Вы получили способность: "${ability.name}" [${ability.rarity}]`);
        } else {
            showNotification("Вы получили уже имеющуюся способность. Ничего не произошло.");
        }
    } else if (chance > 0.6 && chance <= 0.7) {
        if (character.abilities.length > 0) {
            const lostAbility = character.abilities.splice(Math.floor(Math.random() * character.abilities.length), 1)[0];
            showNotification(`Внимание! Вы потеряли способность: "${lostAbility}".`);
        } else {
            showNotification("Вам повезло! У вас не было способностей, чтобы их отнять.");
        }
    } else {
        showNotification("Сегодня ничего особенного не произошло.");
    }
    character.lastAbilityClaim = today;
    updateUI();
    saveProgress();
}
function changeName() {
    const newName = newNameInputEl.value.trim();
    if (newName && newName.length >= 3 && newName.length <= 20) {
        character.name = newName;
        updateUI();
        saveProgress();
        showNotification(`Имя персонажа изменено на "${newName}"!`);
    } else {
        alert("Имя должно быть от 3 до 20 символов.");
    }
}