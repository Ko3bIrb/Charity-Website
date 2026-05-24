document.addEventListener('DOMContentLoaded', () => {
    
    const dailyStats = new DailyStats();
    const cart = new DonationCart(dailyStats);
    
    const modal = new Modal('donationModal');
    let selectedAmount = null;
    
    function openDonationModal() {
        selectedAmount = null;
        document.querySelectorAll('.amount-option').forEach(btn => {
            btn.classList.remove('active');
        });
        const customInput = document.getElementById('customAmount');
        if (customInput) customInput.style.display = 'none';
        modal.open();
    }
    
    const globalDonateBtn = document.getElementById('globalDonateBtn');
    if (globalDonateBtn) {
        globalDonateBtn.addEventListener('click', () => openDonationModal());
    }
    
    const amountOptions = document.querySelectorAll('.amount-option');
    const customAmountBtn = document.querySelector('.custom-amount-btn');
    const customAmountInput = document.getElementById('customAmount');
    const submitBtn = document.getElementById('submitDonation');
    
    amountOptions.forEach(btn => {
        if (btn.classList.contains('custom-amount-btn')) return;
        
        btn.addEventListener('click', () => {
            amountOptions.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedAmount = parseInt(btn.dataset.amount);
            if (customAmountInput) customAmountInput.style.display = 'none';
        });
    });
    
    if (customAmountBtn && customAmountInput) {
        customAmountBtn.addEventListener('click', () => {
            amountOptions.forEach(b => b.classList.remove('active'));
            customAmountInput.style.display = 'block';
            customAmountInput.value = '';
            selectedAmount = null;
        });
    }
    
    if (submitBtn) {
        submitBtn.addEventListener('click', () => {
            let amount = selectedAmount;
            
            if (customAmountInput && customAmountInput.style.display === 'block') {
                amount = parseInt(customAmountInput.value);
                if (isNaN(amount) || amount <= 0) {
                    alert('Введите корректную сумму');
                    return;
                }
            }
            
            if (!amount) {
                alert('Выберите или введите сумму');
                return;
            }
            
            alert(`Спасибо за пожертвование ${formatMoney(amount)}!`);
            dailyStats.addAmount(amount);
            modal.close();
        });
    }
    
    const financialReports = [
        { title: "Финансовый отчёт за апрель 2026", date: "01.05.2026", size: "1.2 MB" },
        { title: "Финансовый отчёт за март 2026", date: "01.04.2026", size: "1.1 MB" },
        { title: "Финансовый отчёт за февраль 2026", date: "01.03.2026", size: "1.0 MB" },
        { title: "Финансовый отчёт за январь 2026", date: "01.02.2026", size: "1.1 MB" },
        { title: "Годовой отчёт за 2025 год", date: "15.01.2026", size: "3.2 MB" }
    ];
    
    const completedCampaigns = [
        { name: "Помощь пострадавшим при пожаре", raised: 450000, target: 450000, date: "март 2026" },
        { name: "Сбор на операцию для Алисы", raised: 1200000, target: 1200000, date: "февраль 2026" },
        { name: "Новогодние подарки детям", raised: 250000, target: 250000, date: "декабрь 2025" },
        { name: "Помощь приюту для собак", raised: 180000, target: 180000, date: "ноябрь 2025" },
        { name: "Строительство колодца", raised: 350000, target: 350000, date: "октябрь 2025" }
    ];
    
    const reportsContainer = document.getElementById('financialReports');
    if (reportsContainer) {
        reportsContainer.innerHTML = financialReports.map(report => `
            <div class="report-item">
                <div class="report-info">
                    <span class="report-title">${report.title}</span>
                    <span class="report-date">${report.date} • ${report.size}</span>
                </div>
                <button class="download-btn" data-title="${report.title}">
                    <i class="fas fa-download"></i> Скачать PDF
                </button>
            </div>
        `).join('');
        
        document.querySelectorAll('.download-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                alert(`Демо-режим: отчёт "${btn.dataset.title}" будет доступен для скачивания в полной версии`);
            });
        });
    }
    
    const completedContainer = document.getElementById('completedCampaigns');
    if (completedContainer) {
        completedContainer.innerHTML = completedCampaigns.map(campaign => `
            <div class="completed-item">
                <div class="completed-info">
                    <span class="completed-title">${campaign.name}</span>
                    <span class="completed-date">Завершён: ${campaign.date}</span>
                </div>
                <div class="completed-raised">
                    Собрано: ${formatMoney(campaign.raised)} из ${formatMoney(campaign.target)}
                </div>
                <button class="detail-btn" data-name="${campaign.name}">
                    <i class="fas fa-eye"></i> Подробнее
                </button>
            </div>
        `).join('');
        
        document.querySelectorAll('.detail-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                alert(`Демо-режим: подробный отчёт о сборе "${btn.dataset.name}"`);
            });
        });
    }
    
    const auditBtns = document.querySelectorAll('.audit-card .btn-outline-light');
    auditBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            alert('Демо-режим: полная версия документа доступна в финальной версии');
        });
    });
    
    async function loadStats() {
        try {
            const data = await loadAllCampaigns();
            const stats = data.stats;
            
            const totalRaisedEl = document.getElementById('totalRaised');
            const totalHelpEl = document.getElementById('totalHelpCount');
            const closedEl = document.getElementById('closedCampaigns');
            const activeEl = document.getElementById('activeCampaigns');
            
            if (totalRaisedEl) totalRaisedEl.textContent = formatMoney(stats.totalRaised);
            if (totalHelpEl) totalHelpEl.textContent = stats.totalHelpCount;
            if (closedEl) closedEl.textContent = stats.closedCampaigns;
            if (activeEl) activeEl.textContent = stats.activeCampaigns;
            
        } catch (error) {
            console.error('Ошибка загрузки статистики:', error);
        }
    }
    
    loadStats();
    cart.updateCounter();

    // ===== ИСТОРИЯ ПОЖЕРТВОВАНИЙ ПО КЛИКУ НА КОРЗИНУ =====
const cartIcon = document.querySelector('.cart-icon');
const historyModal = new Modal('historyModal');

function renderHistory() {
    const historyList = document.getElementById('historyList');
    const historyTotalSpan = document.getElementById('historyTotalAmount');
    
    if (!historyList) return;
    
    const history = cart.getHistory();
    
    if (history.length === 0) {
        historyList.innerHTML = `
            <div class="history-empty">
                <i class="fas fa-shopping-cart" style="font-size: 2rem; margin-bottom: 12px;"></i>
                <p>История пожертвований пуста</p>
                <p style="font-size: 0.8rem;">Пожертвуйте на любой сбор, и он появится здесь</p>
            </div>
        `;
        if (historyTotalSpan) historyTotalSpan.textContent = formatMoney(0);
        return;
    }
    
    // Сортируем от новых к старым
    const sortedHistory = [...history].reverse();
    
    historyList.innerHTML = sortedHistory.map(item => `
        <div class="history-item" data-id="${item.campaignId}">
            <div class="history-item-info">
                <div class="history-item-name">${item.campaignName}</div>
                <div class="history-item-date">${new Date(item.date).toLocaleDateString('ru-RU')}</div>
            </div>
            <div class="history-item-amount">${formatMoney(item.amount)}</div>
            <button class="history-item-remove" data-id="${item.campaignId}" data-name="${item.campaignName}">
                <i class="fas fa-trash-alt"></i>
            </button>
        </div>
    `).join('');
    
    // Общая сумма
    const totalAmount = cart.getTotalAmount();
    if (historyTotalSpan) historyTotalSpan.textContent = formatMoney(totalAmount);
    
    // Обработчики удаления
    document.querySelectorAll('.history-item-remove').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = parseInt(btn.dataset.id);
            const name = btn.dataset.name;
            if (confirm(`Удалить пожертвование для "${name}"? Сумма сбора не восстановится.`)) {
                cart.removeItem(id);
                renderHistory();
                // Обновляем страницу, если нужно
                if (typeof applyFiltersAndRender === 'function') {
                    applyFiltersAndRender();
                }
                if (typeof renderPreviewCampaigns === 'function') {
                    location.reload(); // проще перезагрузить для обновления сумм
                }
            }
        });
    });
}

if (cartIcon) {
    cartIcon.addEventListener('click', () => {
        renderHistory();
        historyModal.open();
    });
}

// Глобальная очистка истории
const clearHistoryBtn = document.getElementById('clearHistoryBtn');
if (clearHistoryBtn) {
    clearHistoryBtn.addEventListener('click', () => {
        if (confirm('Очистить всю историю пожертвований? Суммы сборов не восстановятся.')) {
            cart.clear();
            renderHistory();
            if (typeof applyFiltersAndRender === 'function') {
                location.reload();
            }
            if (typeof renderPreviewCampaigns === 'function') {
                location.reload();
            }
        }
    });
}

    dailyStats.updateDisplay();
    
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        if (link.getAttribute('href') === 'reports.html') {
            link.classList.add('active-nav');
        }
    });
    
    console.log('AceHelp: Страница отчётности загружена');
});