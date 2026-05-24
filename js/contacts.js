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
    
    const form = document.getElementById('feedbackForm');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const subjectSelect = document.getElementById('subject');
    const messageTextarea = document.getElementById('message');
    const agreementCheckbox = document.getElementById('agreement');
    
    const nameError = document.getElementById('nameError');
    const emailError = document.getElementById('emailError');
    const phoneError = document.getElementById('phoneError');
    const subjectError = document.getElementById('subjectError');
    const messageError = document.getElementById('messageError');
    const agreementError = document.getElementById('agreementError');
    
    function validateEmail(email) {
        const re = /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/;
        return re.test(email);
    }
    
    function validatePhone(phone) {
        if (!phone) return true;
        const re = /^[\s\-\+\(\)0-9]{10,20}$/;
        return re.test(phone);
    }
    
    function clearErrors() {
        const errorMessages = document.querySelectorAll('.error-message');
        errorMessages.forEach(el => el.textContent = '');
        
        const errorInputs = document.querySelectorAll('.error');
        errorInputs.forEach(el => el.classList.remove('error'));
    }
    
    function validateForm() {
        let isValid = true;
        clearErrors();
        
        if (!nameInput.value.trim()) {
            nameError.textContent = 'Введите ваше имя';
            nameInput.classList.add('error');
            isValid = false;
        } else if (nameInput.value.trim().length < 2) {
            nameError.textContent = 'Имя должно содержать минимум 2 символа';
            nameInput.classList.add('error');
            isValid = false;
        }
        
        if (!emailInput.value.trim()) {
            emailError.textContent = 'Введите email';
            emailInput.classList.add('error');
            isValid = false;
        } else if (!validateEmail(emailInput.value.trim())) {
            emailError.textContent = 'Введите корректный email (например, name@domain.ru)';
            emailInput.classList.add('error');
            isValid = false;
        }
        
        if (phoneInput.value.trim() && !validatePhone(phoneInput.value.trim())) {
            phoneError.textContent = 'Введите корректный номер телефона';
            phoneInput.classList.add('error');
            isValid = false;
        }
        
        if (!subjectSelect.value) {
            subjectError.textContent = 'Выберите тему сообщения';
            subjectSelect.classList.add('error');
            isValid = false;
        }
        
        if (!messageTextarea.value.trim()) {
            messageError.textContent = 'Введите текст сообщения';
            messageTextarea.classList.add('error');
            isValid = false;
        } else if (messageTextarea.value.trim().length < 10) {
            messageError.textContent = 'Сообщение должно содержать минимум 10 символов';
            messageTextarea.classList.add('error');
            isValid = false;
        }
        
        if (!agreementCheckbox.checked) {
            agreementError.textContent = 'Необходимо согласие на обработку данных';
            isValid = false;
        }
        
        return isValid;
    }
    
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            if (validateForm()) {
                const formData = {
                    name: nameInput.value.trim(),
                    email: emailInput.value.trim(),
                    phone: phoneInput.value.trim(),
                    subject: subjectSelect.value,
                    message: messageTextarea.value.trim(),
                    date: new Date().toISOString()
                };
                
                const messages = JSON.parse(localStorage.getItem('acehelp_messages') || '[]');
                messages.push(formData);
                localStorage.setItem('acehelp_messages', JSON.stringify(messages));
                
                const successDiv = document.createElement('div');
                successDiv.className = 'success-message';
                successDiv.innerHTML = `
                    <i class="fas fa-check-circle"></i> 
                    Спасибо! Ваше сообщение отправлено. Мы ответим вам в ближайшее время.
                `;
                
                form.reset();
                clearErrors();
                
                const formContainer = form.parentElement;
                formContainer.appendChild(successDiv);
                
                setTimeout(() => {
                    successDiv.remove();
                }, 5000);
                
                console.log('Форма отправлена:', formData);
            }
        });
    }
    
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
        if (link.getAttribute('href') === 'contacts.html') {
            link.classList.add('active-nav');
        }
    });
    
    console.log('AceHelp: Страница контактов загружена');
});