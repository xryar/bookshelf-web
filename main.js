const books = [];
const RENDER_EVENT = 'render-book';
const SAVED_EVENTS = 'saved-book';
const STORAGE_KEY = 'BOOKSHELF_APPS';

document.addEventListener('DOMContentLoaded', () => {
    const submitForm = document.getElementById('bookForm');
    submitForm.addEventListener ('submit', (event) => {
        event.preventDefault();
        addBook();
    });

    if(isStorageExist()) {
        loadDataFromStorage();
    }
});

function addBook() {
    const titleBook = document.getElementById('bookFormTitle').value;
    const authorBook = document.getElementById('bookFormAuthor').value;
    const yearBook = parseInt(document.getElementById('bookFormYear').value);
    const isCompletedBook = document.getElementById('bookFormIsComplete').checked;

    const generatedID = generateId();
    const bookObject = generateBookObject(generatedID, titleBook, authorBook, yearBook, isCompletedBook);
    books.push(bookObject);

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function generateId() {
    return +new Date();
}

function generateBookObject(id, title, author, year, isComplete) {
    return {
        id,
        title,
        author,
        year,
        isComplete
    }
}

function makeBook(bookObject) {
    const bookTitle = document.createElement('h3');
    bookTitle.innerText = bookObject.title;
    bookTitle.setAttribute('data-testid', 'bookItemTitle');

    const bookAuthor = document.createElement('p');
    bookAuthor.innerText = bookObject.author;
    bookAuthor.setAttribute('data-testid', 'bookItemAuthor');

    const bookYear = document.createElement('p');
    bookYear.innerText = bookObject.year;
    bookYear.setAttribute('data-testid', 'bookItemYear');

    const bookContainer = document.createElement('div');
    bookContainer.classList.add('inner');
    bookContainer.append(bookTitle, bookAuthor, bookYear);

    const container = document.createElement('div');
    container.classList.add('item', 'shadow');
    container.setAttribute('data-bookid', `book-${bookObject.id}`);
    container.setAttribute('data-testid', 'bookItem');
    container.append(bookContainer);

    const deleteButton = document.createElement('button');
    deleteButton.innerText = 'Delete';
    deleteButton.classList.add('delete-button');
    deleteButton.setAttribute('data-testid', 'bookItemDeleteButton');

    if(bookObject.isComplete) {
        const undoButton = document.createElement('button');
        undoButton.innerText = 'Undo';
        undoButton.classList.add('undo-button');
        undoButton.setAttribute('data-testid', 'bookItemIsCompleteButton');

        undoButton.addEventListener('click', () => {
            undoBookFromCompleted(bookObject.id);
        });
        
        deleteButton.addEventListener('click', () => {
            removeBookFromCompleted(bookObject.id);
        });

        container.append(undoButton, deleteButton);
    } else {
        const completedButton = document.createElement('button');
        completedButton.innerText = 'Completed';
        completedButton.classList.add('completed-button');
        completedButton.setAttribute('data-testid', 'bookItemIsCompleteButton');

        completedButton.addEventListener('click', () => {
            addBookToCompleted(bookObject.id);
        });

        deleteButton.addEventListener('click', () => {
            removeBookFromCompleted(bookObject.id);
        });

        container.append(completedButton, deleteButton);
    }

    return container;
}

function addBookToCompleted(bookId) {
    const bookTarget = findBook(bookId);

    if(bookTarget == null) return;

    bookTarget.isComplete = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function removeBookFromCompleted(bookId) {
    const bookTarget = findBookIndex(bookId);

    if(bookTarget === -1) return;

    books.splice(bookTarget, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function undoBookFromCompleted(bookId) {
    const bookTarget = findBook(bookId);

    if(bookTarget == null) return;

    bookTarget.isComplete = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);

    if(data !== null) {
        for( const book of data) {
            books.push(book);
        }
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
}

function findBook(bookId) {
    for(const bookItem of books) {
        if(bookItem.id === bookId) {
            return bookItem;
        }
    }

    return null;
}

function findBookIndex(bookId) {
    for(const index in books) {
        if(books[index].id === bookId) {
            return index;
        }
    }

    return -1;
}

function saveData() {
    if(isStorageExist()) {
        const parsed = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY, parsed);
        document.dispatchEvent(new Event(SAVED_EVENTS));
    }
}

function isStorageExist() {
    if(typeof(Storage) === 'undefined') {
        alert('Browser kamu tidak mendukung local storage');
        return false;
    }

    return true;
}

document.getElementById('bookFormIsComplete').addEventListener('change', (event) => {
    const submitButton = document.getElementById('bookFormSubmit');
    if (event.target.checked) {
        submitButton.innerHTML = 'Masukkan Buku ke Rak <span>Selesai dibaca</span>';
    } else {
        submitButton.innerHTML = 'Masukkan Buku ke Rak <span>Belum selesai dibaca</span>';
    }
});

document.addEventListener(RENDER_EVENT, () => {
    const unCompletedBookList = document.getElementById('incompleteBookList');
    unCompletedBookList.innerHTML = '';

    const completedBookList = document.getElementById('completeBookList');
    completedBookList.innerHTML = '';

    for(const bookItem of books) {
        const bookElement = makeBook(bookItem);
        if(bookItem.isComplete === false) {
            unCompletedBookList.append(bookElement)
        } else {
            completedBookList.append(bookElement)
        }
    }
})