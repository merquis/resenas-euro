document.addEventListener('DOMContentLoaded', () => {
    const REVIEWS_API_URL = 'https://n8n-n8n.hpv7eo.easypanel.host/webhook/opiniones';
    const container = document.getElementById('opiniones-container');
    const statsGrid = document.getElementById('stats-grid');
    const ratingFilter = document.getElementById('rating-filter');
    const timeFilterButtons = {
        all: document.getElementById('filter-all'),
        today: document.getElementById('filter-today'),
        week: document.getElementById('filter-week'),
        month: document.getElementById('filter-month'),
        '3months': document.getElementById('filter-3months'),
    };
    const paginationContainer = document.getElementById('pagination-container');
    const counterElement = document.getElementById('opiniones-counter');

    const ALL_PRIZES = [
        '🍽️ CENA (VALOR 60€)', '💶 30€ DESCUENTO', '🍾 BOTELLA VINO', '🍦 HELADO',
        '🍺 CERVEZA', '🥤 REFRESCO', '🍹 MOJITO', '🍷 COPA VINO'
    ];

    let currentPage = 1;
    const ITEMS_PER_PAGE = 20;
    let paginationData = {};

    // --- NUEVA FUNCIÓN: Actualiza la URL del navegador ---
    const updateBrowserUrl = () => {
        const params = new URLSearchParams();
        const selectedRating = ratingFilter.value;
        if (selectedRating !== 'all') {
            params.append('rating', selectedRating);
        }

        const activeTimeFilter = document.querySelector('.filters button.active');
        if (activeTimeFilter && activeTimeFilter.id !== 'filter-all') {
            const dateRange = activeTimeFilter.id.replace('filter-', '');
            const dateMap = { 'today': 'today', 'week': '7days', 'month': '1month', '3months': '3months' };
            if (dateMap[dateRange]) {
                params.append('date', dateMap[dateRange]);
            }
        }

        if (currentPage > 1) {
            params.append('page', currentPage);
        }

        const queryString = params.toString();
        const newUrl = queryString ? `${window.location.pathname}?${queryString}` : window.location.pathname;
        history.pushState({ path: newUrl }, '', newUrl);
    };

    const buildApiUrl = () => {
        const params = new URLSearchParams();
        const selectedRating = ratingFilter.value;
        if (selectedRating !== 'all') {
            params.append('rating', selectedRating);
        }

        const activeTimeFilter = document.querySelector('.filters button.active');
        if (activeTimeFilter && activeTimeFilter.id !== 'filter-all') {
            const dateRange = activeTimeFilter.id.replace('filter-', '');
            const dateMap = { 'today': 'today', 'week': '7days', 'month': '1month', '3months': '3months' };
            if (dateMap[dateRange]) {
                params.append('date', dateMap[dateRange]);
            }
        }

        params.append('page', currentPage);
        params.append('limit', ITEMS_PER_PAGE);
        params.append('t', new Date().getTime());
        return `${REVIEWS_API_URL}?${params.toString()}`;
    };

    const fetchOpiniones = async () => {
        container.innerHTML = '<div class="loader">Cargando opiniones...</div>';
        const url = buildApiUrl();

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Error en la petición: ${response.statusText}`);
            
            const result = await response.json();
            
            const opiniones = result.data || [];
            paginationData = result.pagination || {};

            renderOpiniones(opiniones, paginationData);
            renderPagination(paginationData);

        } catch (error) {
            container.innerHTML = `<div class="message">Error al cargar las opiniones: ${error.message}</div>`;
            paginationContainer.innerHTML = '';
            counterElement.textContent = '';
        }
    };
    
    const fetchAllOpinionesForStats = async () => {
        statsGrid.innerHTML = '<div class="loader">Calculando estadísticas...</div>';
        try {
            const response = await fetch(`${REVIEWS_API_URL}?limit=10000&t=${new Date().getTime()}`);
            if (!response.ok) throw new Error(`Error en la petición: ${response.statusText}`);
            
            const result = await response.json();
            const allOpiniones = result.data || [];
            renderStats(allOpiniones);

        } catch (error) {
            statsGrid.innerHTML = `<div class="message">No se pudieron calcular las estadísticas.</div>`;
        }
    };

    const renderOpiniones = (opiniones, pagination) => {
        const { totalItems = 0, limit = ITEMS_PER_PAGE, currentPage = 1 } = pagination;
        const startIndex = (currentPage - 1) * limit;
        const startEntry = totalItems > 0 ? startIndex + 1 : 0;
        const endEntry = startIndex + opiniones.length;
        counterElement.textContent = `Mostrando ${startEntry} - ${endEntry} de ${totalItems} opiniones.`;

        if (opiniones.length === 0) {
            container.innerHTML = '<div class="message">No se encontraron opiniones con los filtros seleccionados.</div>';
        } else {
            container.innerHTML = opiniones.map(createOpinionHTML).join('');
        }
    };

    const renderPagination = (pagination) => {
        const { totalPages = 0, currentPage = 1 } = pagination;
        if (totalPages <= 1) {
            paginationContainer.innerHTML = '';
            return;
        }
        let buttonsHTML = '';
        buttonsHTML += `<button onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>Anterior</button>`;
        const maxButtons = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
        let endPage = Math.min(totalPages, startPage + maxButtons - 1);
        if (endPage - startPage + 1 < maxButtons) {
            startPage = Math.max(1, endPage - maxButtons + 1);
        }
        if (startPage > 1) {
            buttonsHTML += `<button onclick="changePage(1)">1</button>`;
            if (startPage > 2) buttonsHTML += `<span>...</span>`;
        }
        for (let i = startPage; i <= endPage; i++) {
            buttonsHTML += `<button onclick="changePage(${i})" class="${i === currentPage ? 'active' : ''}">${i}</button>`;
        }
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) buttonsHTML += `<span>...</span>`;
            buttonsHTML += `<button onclick="changePage(${totalPages})">${totalPages}</button>`;
        }
        buttonsHTML += `<button onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>Siguiente</button>`;
        paginationContainer.innerHTML = buttonsHTML;
    };

    const renderStats = (allOpiniones) => {
        const totalOpiniones = allOpiniones.length;
        if (totalOpiniones === 0) {
            statsGrid.innerHTML = '<div class="message">No hay datos para mostrar estadísticas.</div>';
            return;
        }
        const counts = ALL_PRIZES.reduce((acc, prize) => ({ ...acc, [prize]: 0 }), {});
        allOpiniones.forEach(opinion => {
            if (opinion.premio && counts.hasOwnProperty(opinion.premio)) {
                counts[opinion.premio]++;
            }
        });
        statsGrid.innerHTML = ALL_PRIZES.map(prize => {
            const count = counts[prize];
            const percentage = ((count / totalOpiniones) * 100).toFixed(1);
            const [emoji, ...nameParts] = prize.split(' ');
            const name = nameParts.join(' ');
            return `<div class="stats-item"><div>${emoji} ${name}</div><strong>${percentage}%</strong><div>(${count})</div></div>`;
        }).join('');
    };

    window.changePage = (newPage) => {
        if (newPage < 1 || newPage > (paginationData.totalPages || 1)) return;
        currentPage = newPage;
        updateBrowserUrl(); // Actualiza la URL del navegador
        fetchOpiniones();
        window.scrollTo(0, 0);
    };

    const createOpinionHTML = (opinion) => {
        const stars = '★'.repeat(opinion.rating || 0) + '☆'.repeat(5 - (opinion.rating || 0));
        const reviewText = opinion.review || 'Comentario no proporcionado';
        const date = opinion.timestamp ? new Date(opinion.timestamp).toLocaleDateString('es-ES') : 'N/A';
        const time = opinion.timestamp ? new Date(opinion.timestamp).toLocaleTimeString('es-ES') : 'N/A';
        return `
            <div class="opinion-card">
                <div class="opinion-card-header">
                    <span class="name">${opinion.name || 'Anónimo'}</span>
                    <span class="rating">${stars}</span>
                </div>
                <div class="review"><blockquote>${reviewText}</blockquote></div>
                <div class="opinion-card-footer">
                    <span><strong>Fecha:</strong> ${date}, ${time}</span>
                    <span><strong>Premio:</strong> ${opinion.premio || 'N/A'} (${opinion.codigoPremio || 'N/A'})</span>
                    <span><strong>Idioma:</strong> ${(opinion.lang || 'N/A').toUpperCase()}</span>
                </div>
            </div>`;
    };

    const handleFilterChange = () => {
        currentPage = 1;
        updateBrowserUrl(); // Actualiza la URL del navegador
        fetchOpiniones();
    };

    // --- NUEVA FUNCIÓN: Lee la URL al cargar la página ---
    const applyFiltersFromUrl = () => {
        const params = new URLSearchParams(window.location.search);
        
        // Puntuación
        const rating = params.get('rating');
        if (rating && ratingFilter.querySelector(`option[value="${rating}"]`)) {
            ratingFilter.value = rating;
        }

        // Fecha
        const date = params.get('date');
        const dateMap = { 'today': 'today', '7days': 'week', '1month': 'month', '3months': '3months' };
        Object.values(timeFilterButtons).forEach(btn => btn.classList.remove('active'));
        
        let activeDateButton = timeFilterButtons.all; // Por defecto 'Todas'
        if (date && dateMap[date]) {
            const buttonId = `filter-${dateMap[date]}`;
            const button = document.getElementById(buttonId);
            if (button) {
                activeDateButton = button;
            } else {
                // Si el parametro no es valido, default a 'today'
                activeDateButton = timeFilterButtons.today;
            }
        } else {
           activeDateButton = timeFilterButtons.today;
        }
        
        // Si no hay ningun parametro, el default es 'today'
        if(!date && !rating){
            activeDateButton = timeFilterButtons.today;
        }

        activeDateButton.classList.add('active');

        // Página
        currentPage = parseInt(params.get('page') || '1', 10);
    };

    // --- Lógica de Carga Inicial Actualizada ---
    ratingFilter.addEventListener('change', handleFilterChange);
    Object.values(timeFilterButtons).forEach(button => {
        button.addEventListener('click', (e) => {
            Object.values(timeFilterButtons).forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            handleFilterChange();
        });
    });

    applyFiltersFromUrl(); // Aplica filtros desde la URL al cargar
    updateBrowserUrl(); // ACTUALIZACIÓN: Sincroniza la URL con el estado inicial
    fetchOpiniones(); // Llama a fetch con los filtros de la URL
    fetchAllOpinionesForStats();
});
