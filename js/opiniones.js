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
        
        params.append('t', new Date().getTime());
        return `${REVIEWS_API_URL}?${params.toString()}`;
    };

    const fetchOpiniones = async () => {
        container.innerHTML = '<div class="loader">Cargando opiniones...</div>';
        statsGrid.innerHTML = '<div class="loader">Calculando estadísticas...</div>';
        const url = buildApiUrl();

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Error en la petición: ${response.statusText}`);
            
            // Ahora esperamos un array directamente
            const opiniones = await response.json();
            
            renderOpiniones(opiniones);
            renderStats(opiniones);

        } catch (error) {
            container.innerHTML = `<div class="message">Error al cargar las opiniones: ${error.message}</div>`;
            statsGrid.innerHTML = `<div class="message">No se pudieron calcular las estadísticas.</div>`;
            counterElement.textContent = '';
        }
    };

    const renderOpiniones = (opiniones) => {
        counterElement.textContent = `Mostrando ${opiniones.length} opiniones.`;

        if (opiniones.length === 0) {
            container.innerHTML = '<div class="message">No se encontraron opiniones con los filtros seleccionados.</div>';
        } else {
            container.innerHTML = opiniones.map(createOpinionHTML).join('');
        }
    };

    const renderStats = (opiniones) => {
        const totalOpiniones = opiniones.length;
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
            const percentage = ((count / totalOpiniones) * 100).toFixed(1);
            const [emoji, ...nameParts] = prize.split(' ');
            const name = nameParts.join(' ');
            return `<div class="stats-item"><div>${emoji} ${name}</div><strong>${percentage}%</strong><div>(${count})</div></div>`;
        }).join('');
    };

    const createOpinionHTML = (opinion) => {
        const stars = '★'.repeat(opinion.rating || 0) + '☆'.repeat(5 - (opinion.rating || 0));
        const reviewText = opinion.review || 'Comentario no proporcionado';
        // Usamos date_real que es el campo ISO
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
        
        let activeDateButton = timeFilterButtons.today; // Default a Hoy
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
