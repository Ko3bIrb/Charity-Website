// ===== МОДАЛЬНОЕ ОКНО (КЛАСС) =====
class Modal {
    constructor(modalId) {
        this.modal = document.getElementById(modalId);
        this.closeBtn = this.modal?.querySelector('.close-modal');
        this.init();
    }
    
    init() {
        if (!this.modal) return;
        
        this.closeBtn?.addEventListener('click', () => this.close());
        
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.close();
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen()) this.close();
        });
    }
    
    open() {
        if (this.modal) {
            this.modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }
    
    close() {
        if (this.modal) {
            this.modal.style.display = 'none';
            document.body.style.overflow = '';
        }
    }
    
    isOpen() {
        return this.modal?.style.display === 'flex';
    }
}

// ===== РАБОТА С LOCALSTORAGE =====
class StorageService {
    constructor(key) {
        this.key = key;
    }
    
    save(data) {
        localStorage.setItem(this.key, JSON.stringify(data));
    }
    
    load(defaultValue = null) {
        const data = localStorage.getItem(this.key);
        if (data) {
            try {
                return JSON.parse(data);
            } catch (e) {
                console.error('Ошибка парсинга localStorage', e);
                return defaultValue;
            }
        }
        return defaultValue;
    }
    
    clear() {
        localStorage.removeItem(this.key);
    }
}

// ===== ЕЖЕДНЕВНАЯ СТАТИСТИКА ПОЖЕРТВОВАНИЙ =====
class DailyStats {
    constructor() {
        this.storage = new StorageService('acehelp_daily');
        this.data = this.storage.load({ lastDate: null, todayAmount: 0 });
        this.checkAndReset();
    }
    
    checkAndReset() {
        const today = new Date().toDateString();
        
        if (this.data.lastDate !== today) {
            this.data = {
                lastDate: today,
                todayAmount: 0
            };
            this.storage.save(this.data);
        }
    }
    
    addAmount(amount) {
        this.data.todayAmount += amount;
        this.storage.save(this.data);
        this.updateDisplay();
    }
    
    getTodayAmount() {
        return this.data.todayAmount;
    }
    
    updateDisplay() {
        const todayElement = document.getElementById('todayAmount');
        if (todayElement) {
            todayElement.textContent = formatMoney(this.data.todayAmount);
        }
    }
}

// ===== КОРЗИНА ПОЖЕРТВОВАНИЙ =====
class DonationCart {
    constructor(dailyStats) {
        this.dailyStats = dailyStats;
        this.storage = new StorageService('acehelp_donations');
        this.items = this.storage.load([]);
        this.updateCounter();
    }
    
    addItem(campaignId, campaignName, amount) {
        const existing = this.items.find(item => item.campaignId === campaignId);
        
        if (existing) {
            existing.amount += amount;
            existing.quantity += 1;
        } else {
            this.items.push({
                campaignId: campaignId,
                campaignName: campaignName,
                amount: amount,
                quantity: 1,
                date: new Date().toISOString()
            });
        }
        
        this.storage.save(this.items);
        
        if (this.dailyStats) {
            this.dailyStats.addAmount(amount);
        }
        
        if (window.updateCampaignRaised) {
            window.updateCampaignRaised(campaignId, amount);
        }
        
        this.updateCounter();
        return this.items;
    }
    
    removeItem(campaignId) {
        this.items = this.items.filter(item => item.campaignId !== campaignId);
        this.storage.save(this.items);
        this.updateCounter();
    }
    
    getTotalAmount() {
        return this.items.reduce((sum, item) => sum + item.amount, 0);
    }
    
    getTotalItems() {
        return this.items.reduce((sum, item) => sum + item.quantity, 0);
    }

    getHistory() {
    return this.items;
    }    

    updateCounter() {
        const counterElements = document.querySelectorAll('.cart-counter');
        const totalItems = this.getTotalItems();
        counterElements.forEach(el => {
            el.textContent = totalItems;
            el.style.display = totalItems > 0 ? 'inline-block' : 'none';
        });
    }
    
    clear() {
        this.items = [];
        this.storage.save(this.items);
        this.updateCounter();
    }
}

// ===== ЗАГРУЗКА ДАННЫХ ИЗ JSON =====
async function loadAllCampaigns() {
    try {
        const response = await fetch('../data/campaigns.json');
        
        if (!response.ok) {
            throw new Error(`HTTP ошибка: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Данные загружены из JSON:', data);
        return data;
        
    } catch (error) {
        console.error('Ошибка загрузки campaigns.json:', error);
        
        return {
            campaigns: getMockCampaigns(),
            stats: {
                totalRaised: 2847500,
                totalHelpCount: 2847,
                closedCampaigns: 28,
                activeCampaigns: 5,
                activeDonors: 1247
            }
        };
    }
}

// Моковые данные на случай ошибки
function getMockCampaigns() {
    return [
        {
            id: 1,
            name: "Помощь детям с ДЦП",
            category: "Дети",
            categoryEn: "children",
            target: 500000,
            raised: 324000,
            donorsCount: 127,
            daysLeft: 14,
            description: "Сбор средств на реабилитацию детей с ДЦП",
            image: "../images/children.jpg",
            reports: []
        },
        {
            id: 2,
            name: "Спасём бездомных животных",
            category: "Животные",
            categoryEn: "animals",
            target: 300000,
            raised: 189000,
            donorsCount: 89,
            daysLeft: 7,
            description: "Корм, лечение и стерилизация бездомных животных",
            image: "../images/animals.jpg",
            reports: []
        },
        {
            id: 3,
            name: "Лечение онкобольных",
            category: "Медицина",
            categoryEn: "medicine",
            target: 1200000,
            raised: 758000,
            donorsCount: 234,
            daysLeft: 21,
            description: "Помощь в оплате дорогостоящего лечения",
            image: "../images/medicine.jpg",
            reports: []
        },
        {
            id: 4,
            name: "Сохраним леса",
            category: "Экология",
            categoryEn: "ecology",
            target: 250000,
            raised: 45000,
            donorsCount: 34,
            daysLeft: 45,
            description: "Посадка деревьев и очистка лесов",
            image: "../images/ecology.jpg",
            reports: []
        },
        {
            id: 5,
            name: "Помощь пожилым",
            category: "Пожилые",
            categoryEn: "elderly",
            target: 400000,
            raised: 120000,
            donorsCount: 67,
            daysLeft: 18,
            description: "Продукты, лекарства и уход за одинокими пожилыми людьми",
            image: "../images/elderly.jpg",
            reports: []
        }
    ];
}

// ===== УТИЛИТЫ =====
function formatMoney(amount) {
    return new Intl.NumberFormat('ru-RU').format(amount) + ' ₽';
}

function getProgressPercent(raised, target) {
    return Math.min(100, Math.floor((raised / target) * 100));
}

// Глобальный доступ
window.Modal = Modal;
window.StorageService = StorageService;
window.DailyStats = DailyStats;
window.DonationCart = DonationCart;
window.loadAllCampaigns = loadAllCampaigns;
window.getMockCampaigns = getMockCampaigns;
window.formatMoney = formatMoney;
window.getProgressPercent = getProgressPercent;