class TelegramClicker {
    constructor() {
        this.balance = 0;
        this.totalClicks = 0;
        this.clickQueue = 0;
        this.isProcessing = false;
        this.userData = {};
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.loadUserData();
        
        if (this.isTelegramWebApp()) {
            Telegram.WebApp.ready();
            Telegram.WebApp.expand();
            this.setupTelegramTheme();
            console.log('⚡ Кликер готов! Можно кликать очень быстро!');
        }
        
        // Авто-сохранение каждые 30 секунд
        setInterval(() => this.saveUserData(), 30000);
    }
    
    setupTelegramTheme() {
        // Подстраиваемся под тему Telegram
        if (Telegram.WebApp.colorScheme === 'dark') {
            document.body.style.background = 'linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%)';
            document.querySelector('.container').style.background = '#2d2d2d';
            document.querySelector('.container').style.color = '#ffffff';
        }
    }
    
    isTelegramWebApp() {
        return window.Telegram && window.Telegram.WebApp;
    }
    
    bindEvents() {
        const clickButton = document.getElementById('clickButton');
        
        // Обработчики для быстрого клика
        clickButton.addEventListener('mousedown', () => this.startAutoClick());
        clickButton.addEventListener('touchstart', () => this.startAutoClick());
        clickButton.addEventListener('mouseup', () => this.stopAutoClick());
        clickButton.addEventListener('touchend', () => this.stopAutoClick());
        clickButton.addEventListener('mouseleave', () => this.stopAutoClick());
        
        // Обычный клик
        clickButton.addEventListener('click', () => this.handleSingleClick());
        
        // Кнопки управления
        document.getElementById('refreshBalance').addEventListener('click', () => {
            this.getBalanceFromBot();
        });
        
        document.getElementById('getTop').addEventListener('click', () => {
            this.getLiveTop();
        });
    }
    
    startAutoClick() {
        this.autoClickInterval = setInterval(() => {
            this.handleSingleClick();
        }, 50); // 20 кликов в секунду!
    }
    
    stopAutoClick() {
        if (this.autoClickInterval) {
            clearInterval(this.autoClickInterval);
            this.autoClickInterval = null;
        }
    }
    
    handleSingleClick() {
        this.totalClicks++;
        this.clickQueue++;
        this.updateDisplay();
        
        // Создаем анимацию
        this.createCoinAnimation();
        
        // Отправляем клики в бота пачками
        if (this.clickQueue >= 5 || !this.isProcessing) {
            this.sendClicksToBot();
        }
    }
    
    sendClicksToBot() {
        if (this.clickQueue === 0 || this.isProcessing) return;
        
        this.isProcessing = true;
        const clicksToSend = this.clickQueue;
        this.clickQueue = 0;
        
        if (this.isTelegramWebApp()) {
            const clickData = {
                action: 'click',
                clicks: clicksToSend,
                timestamp: Date.now()
            };
            
            Telegram.WebApp.sendData(JSON.stringify(clickData));
        } else {
            // Режим тестирования
            this.balance += clicksToSend;
            this.updateDisplay();
            this.showMessage(`✅ +${clicksToSend} сережников! (тест)`);
        }
        
        setTimeout(() => {
            this.isProcessing = false;
            if (this.clickQueue > 0) {
                this.sendClicksToBot();
            }
        }, 100);
    }
    
    createCoinAnimation() {
        const button = document.getElementById('clickButton');
        const coin = document.createElement('div');
        coin.textContent = '+1 💎';
        coin.className = 'coin-animation';
        coin.style.position = 'absolute';
        coin.style.left = Math.random() * 100 + 50 + 'px';
        
        button.parentNode.appendChild(coin);
        
        setTimeout(() => {
            coin.remove();
        }, 1000);
    }
    
    getBalanceFromBot() {
        if (this.isTelegramWebApp()) {
            const balanceData = {
                action: 'get_balance'
            };
            Telegram.WebApp.sendData(JSON.stringify(balanceData));
            this.showMessage('🔄 Запрашиваем баланс...');
        } else {
            this.balance += 10;
            this.updateDisplay();
            this.showMessage('💎 +10 сережников (тест)');
        }
    }
    
    getLiveTop() {
        if (this.isTelegramWebApp()) {
            const topData = {
                action: 'get_top'
            };
            Telegram.WebApp.sendData(JSON.stringify(topData));
            this.showMessage('🏆 Загружаем топ...');
        } else {
            this.showMockTop();
        }
    }
    
    showMockTop() {
        const topList = document.getElementById('topList');
        topList.innerHTML = '<div class="top-item" style="font-weight: bold; border-bottom: 2px solid #333; background: #f0f0f0;"><span>Игрок</span><span>Баланс</span></div>';
        
        const mockTop = [
            { name: 'Алексей (@alexey)', coins: 150 },
            { name: 'Мария (@maria)', coins: 120 },
            { name: 'Иван (@ivan)', coins: 95 },
            { name: 'Вы', coins: this.balance },
            { name: 'Дмитрий (@dmitry)', coins: 65 }
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
    
    updateDisplay() {
        document.getElementById('balance').textContent = `${this.balance} сережников 💎`;
        document.getElementById('totalClicks').textContent = this.totalClicks;
        
        // Показываем очередь кликов
        const clickInfo = document.getElementById('clickInfo');
        if (this.clickQueue > 0) {
            clickInfo.textContent = `⚡ В очереди: ${this.clickQueue} кликов`;
            clickInfo.style.color = '#27ae60';
        } else {
            clickInfo.textContent = '⚡ Кликай очень быстро!';
            clickInfo.style.color = '#666';
        }
    }
    
    showMessage(text) {
        // Создаем временное уведомление
        const notification = document.createElement('div');
        notification.textContent = text;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #27ae60;
            color: white;
            padding: 10px 20px;
            border-radius: 25px;
            z-index: 1000;
            font-weight: bold;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 2000);
    }
    
    loadUserData() {
        const saved = localStorage.getItem('telegramClicker');
        if (saved) {
            this.userData = JSON.parse(saved);
            this.balance = this.userData.balance || 0;
            this.totalClicks = this.userData.totalClicks || 0;
            this.updateDisplay();
        }
    }
    
    saveUserData() {
        this.userData = {
            balance: this.balance,
            totalClicks: this.totalClicks,
            lastSave: Date.now()
        };
        localStorage.setItem('telegramClicker', JSON.stringify(this.userData));
    }
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
    window.clicker = new TelegramClicker();
    
    // Обработчик сообщений от бота (для ответов)
    if (window.Telegram && Telegram.WebApp) {
        Telegram.WebApp.onEvent('viewportChanged', (params) => {
            console.log('Viewport changed:', params);
        });
    }
});
