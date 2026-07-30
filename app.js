let books = JSON.parse(localStorage.getItem('libraryBooks')) || [];

const bookForm = document.getElementById('book-form');
const bookTitleInput = document.getElementById('bookTitle');
const authorNameInput = document.getElementById('authorName');
const categoryInput = document.getElementById('category');
const isbnNumberInput = document.getElementById('isbnNumber');
const publicationYearInput = document.getElementById('publicationYear');
const availabilityStatusInput = document.getElementById('availabilityStatus');
const editIndexInput = document.getElementById('edit-index');

const saveBtn = document.getElementById('save-btn');
const cancelBtn = document.getElementById('cancel-btn');
const formHeading = document.getElementById('form-heading');
const themeToggleBtn = document.getElementById('theme-toggle');
const clearAllBtn = document.getElementById('clear-all-btn');

const bookList = document.getElementById('book-list');
const noBooksMsg = document.getElementById('no-books-msg');
const searchInput = document.getElementById('searchInput');
const filterCategory = document.getElementById('filterCategory');
const sortBySelect = document.getElementById('sortBy');

const statTotal = document.getElementById('stat-total');
const statAvailable = document.getElementById('stat-available');
const statIssued = document.getElementById('stat-issued');

renderDashboard();

function renderDashboard() {
    updateCounters();
    filterAndDisplayBooks();
}

function updateCounters() {
    statTotal.textContent = books.length;
    
    let availableCount = 0;
    let issuedCount = 0;

    for (let i = 0; i < books.length; i++) {
        if (books[i].availabilityStatus === 'Available') {
            availableCount++;
        } else {
            issuedCount++;
        }
    }

    statAvailable.textContent = availableCount;
    statIssued.textContent = issuedCount;
}

function displayBooks(booksToRender) {
    bookList.innerHTML = '';

    if (booksToRender.length === 0) {
        noBooksMsg.classList.remove('hidden');
    } else {
        noBooksMsg.classList.add('hidden');

        for (let i = 0; i < booksToRender.length; i++) {
            const book = booksToRender[i];
            const originalIndex = books.indexOf(book); // Asli index nikalna

            const tr = document.createElement('tr');
            const statusClass = book.availabilityStatus === 'Available' ? 'status-available' : 'status-issued';

            tr.innerHTML = `
                <td><strong>${i + 1}</strong></td>
                <td>
                    <div style="font-weight: 700;">${book.bookTitle}</div>
                    <div style="font-size: 0.78rem; color: var(--text-muted);">${book.authorName}</div>
                </td>
                <td><span style="font-size: 0.85rem;">${book.category}</span></td>
                <td><code>${book.isbnNumber}</code></td>
                <td>${book.publicationYear}</td>
                <td><span class="badge-status ${statusClass}">${book.availabilityStatus}</span></td>
                <td>
                    <button class="btn btn-edit" onclick="editBook(${originalIndex})">
                        <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button class="btn btn-delete" onclick="deleteBook(${originalIndex})">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            `;

            bookList.appendChild(tr);
        }
    }
}


bookForm.addEventListener('submit', function (e) {
    e.preventDefault(); 

    const bookData = {
        bookTitle: bookTitleInput.value.trim(),
        authorName: authorNameInput.value.trim(),
        category: categoryInput.value,
        isbnNumber: isbnNumberInput.value.trim(),
        publicationYear: publicationYearInput.value,
        availabilityStatus: availabilityStatusInput.value
    };

    const editIndex = parseInt(editIndexInput.value);

    if (editIndex === -1) {
       
        books.push(bookData);
        showToast("✨ Book added successfully!");
    } else {
        
        books[editIndex] = bookData;
        showToast("✏️ Book updated successfully!");
        resetFormState();
    }

    saveToLocalStorage();
    renderDashboard();
    bookForm.reset();
});


function editBook(index) {
    const bookToEdit = books[index];

    bookTitleInput.value = bookToEdit.bookTitle;
    authorNameInput.value = bookToEdit.authorName;
    categoryInput.value = bookToEdit.category;
    isbnNumberInput.value = bookToEdit.isbnNumber;
    publicationYearInput.value = bookToEdit.publicationYear;
    availabilityStatusInput.value = bookToEdit.availabilityStatus;

    editIndexInput.value = index;

    formHeading.innerHTML = `<i class="fa-solid fa-pen-to-square"></i> Edit Book`;
    saveBtn.innerHTML = `<i class="fa-solid fa-check"></i> Update Book`;
    cancelBtn.classList.remove('hidden');
}

cancelBtn.addEventListener('click', function () {
    resetFormState();
    bookForm.reset();
});

function resetFormState() {
    editIndexInput.value = "-1";
    formHeading.innerHTML = `<i class="fa-solid fa-square-plus"></i> Add New Book`;
    saveBtn.innerHTML = `<i class="fa-solid fa-floppy-disk"></i> Save Book`;
    cancelBtn.classList.add('hidden');
}


function deleteBook(index) {
    if (confirm("Are you sure you want to delete this record?")) {
        books.splice(index, 1);
        saveToLocalStorage();
        renderDashboard();
        showToast("🗑️ Book deleted successfully!");
    }
}

clearAllBtn.addEventListener('click', function () {
    if (books.length === 0) return;

    if (confirm("Warning: Are you sure you want to clear ALL books?")) {
        books = [];
        saveToLocalStorage();
        renderDashboard();
        showToast("⚠️ All data cleared!");
    }
});

function saveToLocalStorage() {
    localStorage.setItem('libraryBooks', JSON.stringify(books));
}

function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.remove('hidden');
    setTimeout(function () {
        toast.classList.add('hidden');
    }, 3000);
}


function filterAndDisplayBooks() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedCategory = filterCategory.value;
    const sortOption = sortBySelect.value;

    let filtered = books.filter(function (book) {
        const matchesSearch = book.bookTitle.toLowerCase().includes(searchTerm) ||
            book.authorName.toLowerCase().includes(searchTerm);

        const matchesCategory = selectedCategory === 'All' || book.category === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    if (sortOption === 'title-asc') {
        filtered.sort((a, b) => a.bookTitle.localeCompare(b.bookTitle));
    } else if (sortOption === 'title-desc') {
        filtered.sort((a, b) => b.bookTitle.localeCompare(a.bookTitle));
    } else if (sortOption === 'year-newest') {
        filtered.sort((a, b) => b.publicationYear - a.publicationYear);
    }

    displayBooks(filtered);
}

searchInput.addEventListener('keyup', filterAndDisplayBooks);
filterCategory.addEventListener('change', filterAndDisplayBooks);
sortBySelect.addEventListener('change', filterAndDisplayBooks);

themeToggleBtn.addEventListener('click', function () {
    document.body.classList.toggle('light-mode');
    const isLight = document.body.classList.contains('light-mode');
    themeToggleBtn.innerHTML = isLight ? `<i class="fa-solid fa-sun"></i>` : `<i class="fa-solid fa-moon"></i>`;
});