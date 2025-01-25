const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const searchType = document.getElementById('search-type');
const resultsTable = document.getElementById('results');
const loadMoreBtn = document.getElementById('load-more');

let currentPage = 1;
let currentQuery = '';
let currentSearchType = 'title';

searchForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    currentPage = 1;
    currentQuery = searchInput.value.trim();
    currentSearchType = searchType.value;

    if (!currentQuery) return;

    resultsTable.innerHTML = ''; 
    loadMoreBtn.classList.add('hidden');

    await fetchBooks();
});

async function fetchBooks() {
    let url = '';

    if (currentSearchType === 'isbn') {
        url = `https://openlibrary.org/search.json?isbn=${encodeURIComponent(currentQuery)}&page=${currentPage}`;
    } else if (currentSearchType === 'author') {
        url = `https://openlibrary.org/search.json?author=${encodeURIComponent(currentQuery)}&page=${currentPage}`;
    } else {
        url = `https://openlibrary.org/search.json?title=${encodeURIComponent(currentQuery)}&page=${currentPage}`;
    }

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.docs.length > 0) {
            displayResults(data.docs);

            if (data.docs.length === 10) {
                loadMoreBtn.classList.remove('hidden');
            } else {
                loadMoreBtn.classList.add('hidden');
            }
        } else {
            resultsTable.innerHTML = '<tr><td colspan="5" class="text-center text-red-500 p-3">No se encontraron libros.</td></tr>';
            loadMoreBtn.classList.add('hidden');
        }
    } catch (error) {
        console.error(error);
        resultsTable.innerHTML = '<tr><td colspan="5" class="text-center text-red-500 p-3">Error al buscar. Intenta de nuevo.</td></tr>';
    }
}

function displayResults(books) {
    books.forEach((book) => {
        const cover = book.cover_i 
            ? `<img src="https://covers.openlibrary.org/b/id/${book.cover_i}-S.jpg" class="w-14 h-14 object-cover rounded">` 
            : `<div class="w-14 h-14 flex items-center justify-center bg-gray-300 text-gray-700 text-sm">N/A</div>`;

        const bookRow = `
            <tr class="border-b">
                <td class="p-3">${cover}</td>
                <td class="p-3 font-semibold">${book.title}</td>
                <td class="p-3">${book.author_name ? book.author_name.join(', ') : 'Desconocido'}</td>
                <td class="p-3">${book.first_publish_year || 'Desconocido'}</td>
                <td class="p-3">
                    <a href="https://openlibrary.org${book.key}" target="_blank" class="text-blue-500 hover:underline">📖 Ver más</a>
                </td>
            </tr>
        `;
        resultsTable.innerHTML += bookRow;
    });
}

loadMoreBtn.addEventListener('click', async () => {
    currentPage++;
    await fetchBooks();
});