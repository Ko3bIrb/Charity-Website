document.addEventListener('DOMContentLoaded', () => {
    
    const dailyStats = new DailyStats();
    const cart = new DonationCart(dailyStats);
    
    let allCampaigns = [];
    let filteredCampaigns = [];
    let currentCategory = 'all';
    let currentSearch = '';
    
    const modal = new Modal('donationModal');
    let selectedAmount = null;
    let currentCampaignId = null;
    let currentCampaignName = null;
    
    function openDonationModal(campaignId = null, campaignName = null) {
        currentCampaignId = campaignId;
        currentCampaignName = campaignName;
        
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
            
            if (currentCampaignId && currentCampaignName) {
                cart.addItem(currentCampaignId, currentCampaignName, amount);
                alert(`Спасибо! Вы пожертвовали ${formatMoney(amount)} на "${currentCampaignName}"`);
                applyFiltersAndRender();
            } else {
                alert(`Спасибо за пожертвование ${formatMoney(amount)}!`);
                dailyStats.addAmount(amount);
            }
            
            modal.close();
            currentCampaignId = null;
            currentCampaignName = null;
        });
    }
    
    window.updateCampaignRaised = (campaignId, amount) => {
        const campaign = allCampaigns.find(c => c.id === campaignId);
        if (campaign) {
            campaign.raised += amount;
            applyFiltersAndRender();
        }
    };
    
    function applyFiltersAndRender() {
        let filtered = [...allCampaigns];
        
        if (currentCategory !== 'all') {
            filtered = filtered.filter(c => c.categoryEn === currentCategory);
        }
        
        if (currentSearch.trim() !== '') {
            const searchLower = currentSearch.toLowerCase();
            filtered = filtered.filter(c => 
                c.name.toLowerCase().includes(searchLower) ||
                (c.description && c.description.toLowerCase().includes(searchLower))
            );
        }
        
        filteredCampaigns = filtered;
        renderCampaigns();
    }
    
    const campaignsGrid = document.getElementById('campaignsGrid');
    
    function renderCampaigns() {
        if (!campaignsGrid) return;
        
        if (filteredCampaigns.length === 0) {
            campaignsGrid.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-heart-broken"></i>
                    <h3>Ничего не найдено</h3>
                    <p>Попробуйте изменить параметры поиска</p>
                </div>
            `;
            return;
        }
        
        campaignsGrid.innerHTML = filteredCampaigns.map(campaign => `
            <div class="campaign-card" data-id="${campaign.id}">
                <img src="${campaign.image}" alt="${campaign.name}" class="campaign-image" onerror="this.src='https://placehold.co/400x200/1e1a4b/white?text=AceHelp'">
                <div class="campaign-info">
                    <span class="campaign-category">${campaign.category}</span>
                    <h3 class="campaign-title">${campaign.name}</h3>
                    <p class="campaign-description">${campaign.description || 'Помогите тем, кто нуждается в вашей поддержке'}</p>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${getProgressPercent(campaign.raised, campaign.target)}%"></div>
                    </div>
                    <div class="campaign-stats">
                        <span class="campaign-raised">Собрано: ${formatMoney(campaign.raised)}</span>
                        <span class="campaign-target">Нужно: ${formatMoney(campaign.target)}</span>
                    </div>
                    <button class="donate-small" data-id="${campaign.id}" data-name="${campaign.name}">
                        💙 Помочь
                    </button>
                </div>
            </div>
        `).join('');
        
        document.querySelectorAll('.donate-small').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = parseInt(btn.dataset.id);
                const name = btn.dataset.name;
                openDonationModal(id, name);
            });
        });
        
        document.querySelectorAll('.campaign-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.target.classList.contains('donate-small')) return;
                const id = card.dataset.id;
                window.location.href = `campaign-detail.html?id=${id}`;
            });
        });
    }
    
    async function loadCampaigns() {
        try {
            const data = await loadAllCampaigns();
            allCampaigns = data.campaigns;
            window.allCampaignsData = allCampaigns;
            applyFiltersAndRender();
        } catch (error) {
            console.error('Ошибка загрузки:', error);
            allCampaigns = getMockCampaigns();
            applyFiltersAndRender();
        }
    }
    
    function setupFilters() {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                currentSearch = e.target.value;
                applyFiltersAndRender();
            });
        }
        
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentCategory = btn.dataset.category;
                applyFiltersAndRender();
            });
        });
    }
    
    loadCampaigns();
    setupFilters();
    cart.updateCounter();

    // ===== ИСТОРИЯ ПОЖЕРТВОВАНИЙ =====
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
        
        const totalAmount = cart.getTotalAmount();
        if (historyTotalSpan) historyTotalSpan.textContent = formatMoney(totalAmount);
        
        document.querySelectorAll('.history-item-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = parseInt(btn.dataset.id);
                const name = btn.dataset.name;
                if (confirm(`Удалить пожертвование для "${name}"? Сумма сбора не восстановится.`)) {
                    cart.removeItem(id);
                    renderHistory();
                    location.reload();
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

    const clearHistoryBtn = document.getElementById('clearHistoryBtn');
    if (clearHistoryBtn) {
        clearHistoryBtn.addEventListener('click', () => {
            if (confirm('Очистить всю историю пожертвований? Суммы сборов не восстановятся.')) {
                cart.clear();
                renderHistory();
                location.reload();
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