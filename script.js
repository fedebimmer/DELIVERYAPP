document.addEventListener('DOMContentLoaded', () => {
    const courierNameInput = document.getElementById('courierName');
    const customersTextarea = document.getElementById('customers');
    const startDeliveryBtn = document.getElementById('startDelivery');
    const clearHistoryBtn = document.getElementById('clearHistory');
    const deliveryHistoryContainer = document.getElementById('deliveryHistory');
    
    /* @tweakable WhatsApp phone number */
    const whatsappNumber = '3939393799'; // Assicurati che questo sia il numero corretto!

    /* @tweakable Animation duration for history items (in ms) */
    const animationDuration = 500;
    
    /* @tweakable Maximum number of history items to display */
    const maxHistoryItems = 10;

    // Load saved courier name if exists
    if (localStorage.getItem('courierName')) {
        courierNameInput.value = localStorage.getItem('courierName');
    }
    
    // Load and display delivery history
    loadDeliveryHistory();
    
    // Save courier name when it changes
    courierNameInput.addEventListener('input', () => {
        localStorage.setItem('courierName', courierNameInput.value);
    });
    
    // Start delivery process
    startDeliveryBtn.addEventListener('click', startDelivery);
    
    // Clear history
    clearHistoryBtn.addEventListener('click', clearHistory);
    
    function startDelivery() {
        const courierName = courierNameInput.value.trim();
        const customersText = customersTextarea.value.trim();
        
        // Validation
        if (!courierName) {
            alert('Inserisci il nome del corriere');
            return;
        }
        
        if (!customersText) {
            alert('Inserisci almeno un cliente');
            return;
        }
        
        // Get current date and time
        const now = new Date();
        const formattedDate = formatDateTime(now);
        
        // Parse customers (one per line)
        const customers = customersText.split('\n').filter(customer => customer.trim() !== '');
        
        // Create WhatsApp message
        const message = createWhatsAppMessage(courierName, customers, formattedDate);
        
        // Save to history
        saveToHistory(formattedDate, courierName, customers);
        
        // Open WhatsApp with the message
        const whatsappUrl = `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    }
    
    function createWhatsAppMessage(courierName, customers, dateTime) {
        let message = `🚚 *Giro consegne iniziato* 🚚\n\n`;
        message += `*Corriere:* ${courierName}\n`;
        message += `*Data/Ora partenza:* ${dateTime}\n\n`;
        message += `*Clienti da consegnare:*\n`;
        
        customers.forEach((customer, index) => {
            message += `${index + 1}. ${customer}\n`;
        });
        
        message += `\nTotale clienti: ${customers.length}`;
        
        return message;
    }
    
    function saveToHistory(dateTime, courierName, customers) {
        let history = JSON.parse(localStorage.getItem('deliveryHistory') || '[]');
        
        const newDelivery = {
            dateTime,
            courierName,
            customers,
            timestamp: Date.now() // For sorting
        };
        
        history.unshift(newDelivery); // Add to beginning
        
        // Limit history size
        if (history.length > maxHistoryItems) {
            history = history.slice(0, maxHistoryItems);
        }
        
        localStorage.setItem('deliveryHistory', JSON.stringify(history));
        
        // Update UI
        loadDeliveryHistory();
    }
    
    function loadDeliveryHistory() {
        const history = JSON.parse(localStorage.getItem('deliveryHistory') || '[]');
        deliveryHistoryContainer.innerHTML = '';
        
        if (history.length === 0) {
            deliveryHistoryContainer.innerHTML = '<p>Nessuna consegna registrata</p>';
            return;
        }
        
        // Sort by timestamp (newest first)
        history.sort((a, b) => b.timestamp - a.timestamp);
        
        history.forEach((delivery, index) => {
            const historyItem = document.createElement('div');
            historyItem.classList.add('history-item');
            historyItem.style.animationDelay = `${index * 100}ms`;
            
            const dateElement = document.createElement('div');
            dateElement.classList.add('history-date');
            dateElement.textContent = delivery.dateTime;
            
            const courierElement = document.createElement('div');
            courierElement.classList.add('history-courier');
            courierElement.textContent = `Corriere: ${delivery.courierName}`;
            
            const customersElement = document.createElement('div');
            customersElement.classList.add('history-customers');
            
            const customersList = document.createElement('ul');
            delivery.customers.forEach(customer => {
                const listItem = document.createElement('li');
                listItem.textContent = customer;
                customersList.appendChild(listItem);
            });
            
            customersElement.appendChild(document.createTextNode('Clienti:'));
            customersElement.appendChild(customersList);
            
            historyItem.appendChild(dateElement);
            historyItem.appendChild(courierElement);
            historyItem.appendChild(customersElement);
            
            deliveryHistoryContainer.appendChild(historyItem);
        });
    }
    
    function clearHistory() {
        if (confirm('Sei sicuro di voler cancellare tutta la cronologia?')) {
            localStorage.removeItem('deliveryHistory');
            loadDeliveryHistory();
        }
    }
    
    function formatDateTime(date) {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        
        return `${day}/${month}/${year} ${hours}:${minutes}`;
    }
});
