class TelegramClicker {
    constructor() {
        this.balance = 0;
        this.totalClicks = 0;
        this.lastClickTime = 0;
        this.cooldown = 1000; // 1 секунда
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.updateDisplay();
        
        // Инициализация Telegram Web App
        if (this.isTelegramWebApp()) {
            Telegram.WebApp.ready();
            Telegram.WebApp.expand();
            console.log('Telegram Web App инициализирован');
        }
    }
    
    isTelegramWebApp() {
        return window.Telegram && window.Telegram.WebApp;
    }
    
    bindEvents() {
        // Обработчик клика
        document.getElementById('clickButton').addEventListener('click', () => {
            this.handleClick();
        });
        
        // Обновление баланса
        document.getElementById('refreshBalance').addEventListener('click', () => {
            this.getBalanceFromBot();
        });
        
        // Получение топа
        document.getElementById('getTop').addEventListener('click', () => {
            this.showTop();
        });
    }
    
    handleClick() {
        const now = Date.now();
        
        // Проверка кулдауна
        if (now - this.lastClickTime < this.cooldown) {
            this.showMessage('⏳ Слишком быстро! Подождите 1 секунду');
            return;
        }
        
        this.lastClickTime = now;
        this.totalClicks++;
        
        // Анимация клика
        this.createCoinAnimation();
        
        // Отправка данных в бота
        if (this.isTelegramWebApp()) {
            Telegram.WebApp.sendData('click:' + Date.now());
        } else {
            // Для тестирования вне Telegram
            this.balance++;
            this.updateDisplay();
            this.showMessage('✅ +1 сережник! (тестовый режим)');
        }
        
        // Обновляем отображение
        document.getElementById('totalClicks').textContent = this.totalClicks;
    }
    
    createCoinAnimation() {
        const button = document.getElementById('clickButton');
        const coin = document.createElement('div');
        coin.textContent = '+1 💎';
        coin.className = 'coin-animation';
        coin.style.position = 'absolute';
        coin.style.left = '50%';
        coin.style.transform = 'translateX(-50%)';
        
        button.parentNode.appendChild(coin);
        
        setTimeout(() => {
            coin.remove();
        }, 1000);
    }
    
    getBalanceFromBot() {
        if (this.isTelegramWebApp()) {
            Telegram.WebApp.sendData('get_balance');
            this.showMessage('🔄 Запрос отправлен боту...');
        } else {
            // Для тестирования
            this.balance += 5;
            this.updateDisplay();
            this.showMessage('💎 +5 сережников (тестовый режим)');
        }
    }
    
    updateDisplay() {
        document.getElementById('balance').textContent = `${this.balance} сережников 💎`;
        document.getElementById('totalClicks').textContent = this.totalClicks;
    }
    
    showTop() {
        const topList = document.getElementById('topList');
        topList.innerHTML = '<div class="top-item" style="font-weight: bold; border-bottom: 2px solid #333;"><span>Игрок</span><span>Баланс</span></div>';
        
        // Заглушка для тестирования
        const mockTop = [
            { name: 'Алексей', coins: 150 },
            { name: 'Мария', coins: 120 },
            { name: 'Иван', coins: 95 },
            { name: 'Вы', coins: this.balance },
            { name: 'Дмитрий', coins: 65 }
        ];
        
        mockTop.forEach(player => {
            const item = document.createElement('div');
            item.className = 'top-item';
            item.innerHTML = `
                <span>${player.name}</span>
                <span>${player.coins} 💎</span>
            `;
            if (player.name === 'Вы') {
                item.style.fontWeight = 'bold';
                item.style.color = '#e74c3c';
                item.style.background = '#fff0f0';
            }
            topList.appendChild(item);
        });
    }
    
    showMessage(text) {
        const clickInfo = document.getElementById('clickInfo');
        const originalText = clickInfo.textContent;
        
        clickInfo.textContent = text;
        clickInfo.style.color = '#e74c3c';
        clickInfo.style.fontWeight = 'bold';
        
        setTimeout(() => {
            clickInfo.textContent = originalText;
            clickInfo.style.color = '#666';
            clickInfo.style.fontWeight = 'normal';
        }, 2000);
    }
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
    new TelegramClicker();
});
