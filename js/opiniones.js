import { CONFIG } from '../js/config.js';

document.addEventListener('DOMContentLoaded', () => {
    const REVIEWS_API_URL = CONFIG.n8nOpinionesUrl;
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
    const counterElement = document.getElementById('opiniones-counter');
    const paginationContainer = document.getElementById('pagination-container');

    let currentPage = 1;
    const limit = 10;
    let totalOpiniones = 0;

    const ALL_PRIZES = [
        '🍽️ CENA (VALOR 60€)', '💶 30€ DESCUENTO', '🍾 BOTELLA VINO', '🍦 HELADO',
        '🍺 CERVEZA', '🥤 REFRESCO', '🍹 MOJITO', '🍷 COPA VINO'
    ];

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
        params.append('limit', limit);
        params.append('t', new Date().getTime());
        return `${REVIEWS_API_URL}?${params.toString()}`;
    };

    const fetchOpiniones = async () => {
        container.innerHTML = '<div class="loader">Cargando opiniones...</div>';
        statsGrid.innerHTML = '<div class="loader">Calculando estadísticas...</div>';
        paginationContainer.innerHTML = '';
        const url = buildApiUrl();
        console.log('Construyendo URL:', url);

        try {
            const response = await fetch(url);
            console.log('Respuesta de la red:', response);
            if (!response.ok) throw new Error(`Error en la petición: ${response.statusText}`);
            
            const responseData = await response.json();
            console.log('Respuesta completa del webhook (JSON):', responseData);
            
            const data = responseData[0] || {};
            console.log('Objeto de datos extraído (data):', data);

            const opiniones = data.opiniones || [];
            totalOpiniones = data.total || 0;
            console.log(`Opiniones extraídas: ${opiniones.length}, Total de opiniones: ${totalOpiniones}`);
            
            renderOpiniones(opiniones);
            renderStats(opiniones);
            renderPagination();

        } catch (error) {
            container.innerHTML = `<div class="message">Error al cargar las opiniones: ${error.message}</div>`;
            statsGrid.innerHTML = `<div class="message">No se pudieron calcular las estadísticas.</div>`;
            counterElement.textContent = '';
        }
    };

    const renderOpiniones = (opiniones) => {
        const start = (currentPage - 1) * limit + 1;
        const end = start + opiniones.length - 1;
        counterElement.textContent = `Mostrando ${start}-${end} de ${totalOpiniones} opiniones.`;

        if (totalOpiniones === 0) {
            container.innerHTML = '<div class="message">No se encontraron opiniones con los filtros seleccionados.</div>';
            counterElement.textContent = 'No hay opiniones para mostrar.';
        } else {
            container.innerHTML = opiniones.map(createOpinionHTML).join('');
        }
    };
    
    const renderPagination = () => {
        paginationContainer.innerHTML = '';
        const totalPages = Math.ceil(totalOpiniones / limit);

        if (totalPages <= 1) return;

        const createButton = (text, page, isDisabled = false, isActive = false) => {
            const button = document.createElement('button');
            button.innerHTML = text;
            button.disabled = isDisabled;
            if (isActive) button.classList.add('active');
            button.addEventListener('click', () => {
                currentPage = page;
                fetchOpiniones();
                updateBrowserUrl();
            });
            return button;
        };

        paginationContainer.appendChild(createButton('Anterior', currentPage - 1, currentPage === 1));

        for (let i = 1; i <= totalPages; i++) {
            paginationContainer.appendChild(createButton(i, i, false, i === currentPage));
        }

        paginationContainer.appendChild(createButton('Siguiente', currentPage + 1, currentPage === totalPages));
    };

    const renderStats = (opiniones) => {
        if (totalOpiniones === 0) {
            statsGrid.innerHTML = '<div class="message">No hay datos para mostrar estadísticas.</div>';
            return;
        }
        const counts = ALL_PRIZES.reduce((acc, prize) => ({ ...acc, [prize]: 0 }), {});
        opiniones.forEach(opinion => {
            if (opinion.premio && counts.hasOwnProperty(opinion.premio)) {
                counts[opinion.premio]++;
            }
        });
        statsGrid.innerHTML = ALL_PRIZES.map(prize => {
            const count = counts[prize];
            // Para las estadisticas, usaremos el total de opiniones, no solo las de la pagina
            const percentage = ((count / totalOpiniones) * 100).toFixed(1);
            const [emoji, ...nameParts] = prize.split(' ');
            const name = nameParts.join(' ');
            return `<div class="stats-item"><div>${emoji} ${name}</div><strong>${percentage}%</strong><div>(${count})</div></div>`;
        }).join('');
    };

    const createOpinionHTML = (opinion) => {
        const stars = '★'.repeat(opinion.rating || 0) + '☆'.repeat(5 - (opinion.rating || 0));
        const reviewText = opinion.review || 'Comentario no proporcionado';
        const date = opinion.date_real ? new Date(opinion.date_real).toLocaleDateString('es-ES') : 'N/A';
        const time = opinion.date_real ? new Date(opinion.date_real).toLocaleTimeString('es-ES') : 'N/A';
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
        updateBrowserUrl();
        fetchOpiniones();
    };

    const applyFiltersFromUrl = () => {
        const params = new URLSearchParams(window.location.search);
        
        const rating = params.get('rating');
        if (rating && ratingFilter.querySelector(`option[value="${rating}"]`)) {
            ratingFilter.value = rating;
        }

        const date = params.get('date');
        const dateMap = { 'today': 'today', '7days': 'week', '1month': 'month', '3months': '3months' };
        Object.values(timeFilterButtons).forEach(btn => btn.classList.remove('active'));
        
        let activeDateButton = timeFilterButtons.today;
        if (date && dateMap[date]) {
            const buttonId = `filter-${dateMap[date]}`;
            const button = document.getElementById(buttonId);
            if (button) {
                activeDateButton = button;
            }
        } else if (!date && !rating) {
            activeDateButton = timeFilterButtons.all;
        }
        activeDateButton.classList.add('active');
        
        const page = parseInt(params.get('page'), 10);
        if (page > 1) {
            currentPage = page;
        }
    };

    ratingFilter.addEventListener('change', handleFilterChange);
    Object.values(timeFilterButtons).forEach(button => {
        button.addEventListener('click', (e) => {
            Object.values(timeFilterButtons).forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            handleFilterChange();
        });
    });

    applyFiltersFromUrl();
    updateBrowserUrl();
    fetchOpiniones();
});
