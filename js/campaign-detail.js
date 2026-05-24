document.addEventListener('DOMContentLoaded', () => {
    
    const urlParams = new URLSearchParams(window.location.search);
    const campaignId = parseInt(urlParams.get('id'));
    
    const dailyStats = new DailyStats();
    const cart = new DonationCart(dailyStats);
    
    let allCampaigns = [];
    let currentCampaign = null;
    
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
            
            if (currentCampaign) {
                cart.addItem(currentCampaign.id, currentCampaign.name, amount);
                alert(`Спасибо! Вы пожертвовали ${formatMoney(amount)} на "${currentCampaign.name}"`);
                currentCampaign.raised += amount;
                renderCampaignDetail();
            } else {
                alert(`Спасибо за пожертвование ${formatMoney(amount)}!`);
                dailyStats.addAmount(amount);
            }
            
            modal.close();
        });
    }
    
    const detailContainer = document.getElementById('campaignDetail');
    const breadcrumbSpan = document.getElementById('breadcrumbCampaignName');
    
    function renderCampaignDetail() {
        if (!currentCampaign) return;
        
        const percent = getProgressPercent(currentCampaign.raised, currentCampaign.target);
        
        detailContainer.innerHTML = `
            <div class="campaign-detail">
                <div class="campaign-image-section">
                    <img src="${currentCampaign.image}" alt="${currentCampaign.name}" class="campaign-detail-image" onerror="this.src='https://placehold.co/600x400/1e1a4b/white?text=AceHelp'">
                </div>
                <div class="campaign-info-section">
                    <span class="campaign-category-badge">${currentCampaign.category}</span>
                    <h1 class="campaign-detail-title">${currentCampaign.name}</h1>
                    <p class="campaign-detail-description">${currentCampaign.description || 'Помогите тем, кто нуждается в вашей поддержке.'}</p>
                    
                    <div class="progress-section">
                        <div class="progress-label">
                            <span>Собрано: ${formatMoney(currentCampaign.raised)}</span>
                            <span>Цель: ${formatMoney(currentCampaign.target)}</span>
                        </div>
                        <div class="progress-bar-big">
                            <div class="progress-fill-big" style="width: ${percent}%"></div>
                        </div>
                        <div class="progress-label" style="margin-top: 8px;">
                            <span>${percent}% выполнено</span>
                            <span>Осталось: ${formatMoney(currentCampaign.target - currentCampaign.raised)}</span>
                        </div>
                    </div>
                    
                    <div class="stats-grid">
                        <div class="stat-detail">
                            <div class="stat-value">${currentCampaign.donorsCount || 0}</div>
                            <div class="stat-label">жертвователей</div>
                        </div>
                        <div class="stat-detail">
                            <div class="stat-value">${currentCampaign.daysLeft || 30}</div>
                            <div class="stat-label">дней осталось</div>
                        </div>
                        <div class="stat-detail">
                            <div class="stat-value">${percent}%</div>
                            <div class="stat-label">выполнено</div>
                        </div>
                    </div>
                    
                    <div class="donation-form-block">
                        <h3>💙 Сделайте пожертвование</h3>
                        <div class="donation-amounts" id="detailAmounts">
                            <button class="donation-preset" data-amount="500">500 ₽</button>
                            <button class="donation-preset" data-amount="1000">1000 ₽</button>
                            <button class="donation-preset" data-amount="2000">2000 ₽</button>
                            <button class="donation-preset" data-amount="5000">5000 ₽</button>
                            <button class="donation-preset" id="customPresetBtn">Своя сумма</button>
                        </div>
                        <input type="number" id="detailCustomAmount" placeholder="Введите сумму" class="donation-custom" style="display:none;">
                        <button class="btn-primary donate-now-btn" id="detailDonateBtn">Пожертвовать сейчас</button>
                    </div>
                </div>
            </div>
            <div class="reports-list">
                <h3>📋 Отчёты по сбору</h3>
                <div id="campaignReports">
                    ${renderReports()}
                </div>
            </div>
        `;
        
        setupDetailDonationForm();
        
        if (breadcrumbSpan) {
            breadcrumbSpan.textContent = currentCampaign.name;
        }
    }
    
    function renderReports() {
        const reports = currentCampaign.reports || [
            { title: "Первый отчёт о сборе", date: "15.03.2026" },
            { title: "Промежуточный отчёт", date: "01.04.2026" }
        ];
        
        return reports.map(report => `
            <div class="report-item-small">
                <div>
                    <div class="report-title">${report.title}</div>
                    <div class="report-date">${report.date}</div>
                </div>
                <div class="download-link">
                    <i class="fas fa-download"></i> Скачать
                </div>
            </div>
        `).join('');
    }
    
    function setupDetailDonationForm() {
        const presetBtns = document.querySelectorAll('#detailAmounts .donation-preset');
        const customPresetBtn = document.getElementById('customPresetBtn');
        const customInput = document.getElementById('detailCustomAmount');
        const donateBtn = document.getElementById('detailDonateBtn');
        
        let detailSelectedAmount = null;
        
        presetBtns.forEach(btn => {
            if (btn.id === 'customPresetBtn') return;
            
            btn.addEventListener('click', () => {
                presetBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                detailSelectedAmount = parseInt(btn.dataset.amount);
                if (customInput) customInput.style.display = 'none';
            });
        });
        
        if (customPresetBtn && customInput) {
            customPresetBtn.addEventListener('click', () => {
                presetBtns.forEach(b => b.classList.remove('active'));
                customInput.style.display = 'block';
                customInput.value = '';
                detailSelectedAmount = null;
            });
        }
        
        if (donateBtn) {
            donateBtn.addEventListener('click', () => {
                let amount = detailSelectedAmount;
                
                if (customInput && customInput.style.display === 'block') {
                    amount = parseInt(customInput.value);
                    if (isNaN(amount) || amount <= 0) {
                        alert('Введите корректную сумму');
                        return;
                    }
                }
                
                if (!amount) {
                    alert('Выберите или введите сумму');
                    return;
                }
                
                if (currentCampaign) {
                    cart.addItem(currentCampaign.id, currentCampaign.name, amount);
                    alert(`Спасибо! Вы пожертвовали ${formatMoney(amount)} на "${currentCampaign.name}"`);
                    currentCampaign.raised += amount;
                    renderCampaignDetail();
                }
            });
        }
    }
    
    async function loadCampaigns() {
        try {
            const data = await loadAllCampaigns();
            allCampaigns = data.campaigns;
            
            currentCampaign = allCampaigns.find(c => c.id === campaignId);
            
            if (!currentCampaign) {
                detailContainer.innerHTML = `
                    <div class="loading-detail">
                        <i class="fas fa-heart-broken" style="font-size: 3rem;"></i>
                        <h2>Сбор не найден</h2>
                        <p>Возможно, он был завершён или удалён</p>
                        <button class="btn-primary" onclick="location.href='campaigns.html'">Вернуться к сборам</button>
                    </div>
                `;
                return;
            }
            
            renderCampaignDetail();
            loadRelatedCampaigns();
        } catch (error) {
            console.error('Ошибка загрузки:', error);
            detailContainer.innerHTML = `
                <div class="loading-detail">
                    <i class="fas fa-exclamation-triangle" style="font-size: 3rem;"></i>
                    <h2>Ошибка загрузки данных</h2>
                    <p>Проверьте подключение к интернету</p>
                    <button class="btn-primary" onclick="location.reload()">Повторить</button>
                </div>
            `;
        }
    }
    
    const relatedGrid = document.getElementById('relatedGrid');
    
    function loadRelatedCampaigns() {
        if (!relatedGrid) return;
        
        const related = allCampaigns
            .filter(c => c.id !== campaignId && c.categoryEn === currentCampaign.categoryEn)
            .slice(0, 3);
        
        if (related.length === 0) {
            relatedGrid.innerHTML = '<p style="color:#8892b0;">Нет похожих сборов</p>';
            return;
        }
        
        relatedGrid.innerHTML = related.map(campaign => `
            <div class="related-card" data-id="${campaign.id}">
                <img src="${campaign.image}" alt="${campaign.name}">
                <div class="related-info">
                    <div class="related-title">${campaign.name}</div>
                    <div class="related-raised">Собрано: ${formatMoney(campaign.raised)}</div>
                </div>
            </div>
        `).join('');
        
        document.querySelectorAll('.related-card').forEach(card => {
            card.addEventListener('click', () => {
                const id = card.dataset.id;
                window.location.href = `campaign-detail.html?id=${id}`;
            });
        });
    }
    
    loadCampaigns();
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
        if (link.getAttribute('href') === 'campaigns.html') {
            link.classList.add('active-nav');
        }
    });
});