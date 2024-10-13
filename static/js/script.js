document.addEventListener('DOMContentLoaded', () => {
    const itemForm = document.getElementById('itemForm');
    const itemNameInput = document.getElementById('itemName');
    const itemPriceInput = document.getElementById('itemPrice');
    const billItems = document.getElementById('billItems');
    const totalField = document.getElementById('total');
    const itemList = document.getElementById('itemList');

    let items = [];
    let subtotal = 0;

    // Get the profile name from a hidden field or a JavaScript variable
    const profileName = document.getElementById('profileName').value;  // Assuming it's available in the template

    // Fetch items from the server for the selected profile
    function fetchItems() {
        fetch(`/items/${profileName}`)
            .then(response => response.json())
            .then(data => {
                items = data.map(item => ({
                    name: item.name,
                    price: parseFloat(item.price),
                }));
                updateBill();
                updateItemList();
            })
            .catch(err => console.error('Error loading items:', err));
    }

    // Update bill display
    function updateBill() {
        billItems.innerHTML = '';
        subtotal = 0;

        items.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${item.name}</td><td>${item.price.toFixed(2)}</td>`;
            billItems.appendChild(tr);
            subtotal += item.price;
        });

        totalField.textContent = subtotal.toFixed(2);
        saveItems();  // Save items to server when bill updates
    }

    // Save items to the server for the selected profile (CSV)
    function saveItems() {
        fetch(`/items/${profileName}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(items),
        })
        .then(response => response.json())
        .then(data => {
            console.log('Items saved:', data);
        })
        .catch(err => console.error('Error saving items:', err));
    }

    // Add item to bill
    function addItem(name, price) {
        items.push({ name, price });
        updateBill();
        addItemToList(name);
    }

    // Add item to list display
    function addItemToList(name) {
        const li = document.createElement('li');
        li.textContent = name;

        const removeButton = document.createElement('button');
        removeButton.textContent = 'Remove';
        removeButton.addEventListener('click', () => removeItem(name));

        li.appendChild(removeButton);
        itemList.appendChild(li);
    }

    // Remove item from list
    function removeItem(name) {
        items = items.filter(item => item.name !== name);
        updateBill();
        updateItemList();
    }

    // Update the item list UI
    function updateItemList() {
        itemList.innerHTML = '';
        items.forEach(item => addItemToList(item.name));
    }

    // Handle form submission to add new items
    itemForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const itemName = itemNameInput.value;
        const itemPrice = parseFloat(itemPriceInput.value);

        if (itemName && itemPrice) {
            addItem(itemName, itemPrice);
            itemNameInput.value = '';
            itemPriceInput.value = '';
        }
    });

    // Fetch items when the page loads
    fetchItems();

    // Set the current date in the footer
    const dateElement = document.getElementById('date');
    const currentDate = new Date();
    dateElement.textContent = `${currentDate.toLocaleDateString()} ${currentDate.toLocaleTimeString()}`;

    // Download as PDF
    const downloadPDFButton = document.getElementById('downloadPDF');
    downloadPDFButton.addEventListener('click', () => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const billContent = document.getElementById('billContent');

        doc.html(billContent, {
            callback: function (doc) {
                doc.save('bill.pdf');
            },
            x: 1,
            y: 1
        });
    });

    // Download as JPEG
    const downloadJPEGButton = document.getElementById('downloadJPEG');
    downloadJPEGButton.addEventListener('click', () => {
        const billContent = document.getElementById('billContent');
        html2canvas(billContent).then(canvas => {
            const link = document.createElement('a');
            link.href = canvas.toDataURL('image/jpeg');
            link.download = 'bill.jpeg';
            link.click();
        });
    });
});
