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
    
    const teamMembers = [
        {
            name: "Александра Волкова",
            role: "Основатель платформы",
            desc: "Более 10 лет в благотворительности. Создала платформу, чтобы помогать было просто и прозрачно.",
            avatar: "https://randomuser.me/api/portraits/women/68.jpg"
        },
        {
            name: "Дмитрий Морозов",
            role: "Технический директор",
            desc: "Frontend-разработчик с 8-летним опытом. Отвечает за работу сайта и безопасность данных.",
            avatar: "https://randomuser.me/api/portraits/men/32.jpg"
        },
        {
            name: "Елена Соколова",
            role: "Руководитель отдела сборов",
            desc: "Координирует сборы и общается с фондами. Убеждается, что помощь доходит до адресата.",
            avatar: "https://randomuser.me/api/portraits/women/45.jpg"
        },
        {
            name: "Игорь Тихонов",
            role: "Юрист",
            desc: "Контролирует юридическую чистоту сборов и прозрачность документов.",
            avatar: "https://randomuser.me/api/portraits/men/52.jpg"
        }
    ];
    
    const teamGrid = document.getElementById('teamGrid');
    if (teamGrid) {
        teamGrid.innerHTML = teamMembers.map(member => `
            <div class="team-card">
                <img src="${member.avatar}" alt="${member.name}" class="team-avatar" onerror="this.src='https://placehold.co/120x120/1e1a4b/white?text=${member.name.charAt(0)}'">
                <h3 class="team-name">${member.name}</h3>
                <p class="team-role">${member.role}</p>
                <p class="team-desc">${member.desc}</p>
            </div>
        `).join('');
    }
    
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
        if (link.getAttribute('href') === 'about.html') {
            link.classList.add('active-nav');
        }
    });
    
    console.log('Страница "О нас" загружена');
});