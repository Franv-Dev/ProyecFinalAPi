const BASE_URL = 'https://pokeapi.co/api/v2/pokemon';

const cardsContainer = document.querySelector('#cards-container');
const pokemonInfoContainer = document.querySelector('#pokemon-info');
const searchForm = document.querySelector('#searchForm');
const searchInput = document.querySelector('#searchInput');
const pageSelect = document.querySelector('#pageSelect');

// --- FETCH API ---
async function getPokemon(query) {
    const res = await fetch(`${BASE_URL}/${query}`);
    if (!res.ok) throw new Error('Pokémon no encontrado');
    return await res.json();
}

async function getPokemonRange(inicio, limite) {
    const promises = [];
    for (let i = inicio; i <= limite; i++) {
        promises.push(getPokemon(i));
    }
    return await Promise.all(promises);
}

// --- TEMPLATE DE CARD HTML ---
function createPokemonCardHTML(data) {
    const tiposBadges = data.types
        .map(t => `<span class="badge badge-type type-${t.type.name}">${t.type.name}</span>`)
        .join(' ');

    const statsList = data.stats
        .map(s => `
            <li class="d-flex justify-content-between align-items-center mb-1">
                <span class="text-capitalize text-light-50" style="font-size: 0.8rem;">${s.stat.name}:</span> 
                <strong class="text-warning" style="font-size: 0.85rem;">${s.base_stat}</strong>
            </li>
        `)
        .join('');

    const habilidadesList = data.abilities
        .map(a => `<li class="text-capitalize text-white-50" style="font-size: 0.8rem;">• ${a.ability.name}</li>`)
        .join('');

    const imageSrc = data.sprites.other['official-artwork'].front_default || data.sprites.front_default;

    return `
        <div class="col d-flex justify-content-center">
            <div class="myCard">
                <div class="innerCard">
                    
                    <!-- CARA FRONTAL -->
                    <div class="frontSide">
                        <div class="card-header-custom">
                            <span class="title text-capitalize fw-bold text-dark m-0 fs-6">${data.name}</span>
                            <span class="badge bg-secondary-subtle text-dark border fw-bold">#${data.id.toString().padStart(3, '0')}</span>
                        </div>
                        
                        <div class="pokemon-img-wrapper">
                            <img src="${imageSrc}" alt="${data.name}" class="foto">
                        </div>

                        <div class="info pb-1">
                            <div class="tipo d-flex justify-content-center gap-1">
                                ${tiposBadges}
                            </div>
                        </div>
                    </div>

                    <!-- CARA TRASERA -->
                    <div class="backSide">
                        <div>
                            <h6 class="fw-bold text-uppercase fs-7">Estadísticas</h6>
                            <ul class="list-unstyled mb-0">
                                ${statsList}
                            </ul>
                        </div>
                        <div>
                            <h6 class="fw-bold text-uppercase fs-7">Habilidades</h6>
                            <ul class="list-unstyled mb-0">
                                ${habilidadesList}
                            </ul>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    `;
}

function createSpinnerHTML() {
    return `
        <div class="col-12 text-center py-5">
            <div class="spinner-border text-light" style="width: 3rem; height: 3rem;" role="status"></div>
        </div>
    `;
}

function createErrorHTML(mensaje) {
    return `
        <div class="col-12 text-center my-3">
            <div class="alert alert-dark d-inline-block px-4 text-white fw-semibold">${mensaje}</div>
        </div>
    `;
}

// --- MANEJO DE EVENTOS ---
document.addEventListener('DOMContentLoaded', () => {
    loadPage(1);
});

async function loadPage(pageNumber) {
    resetContainers();
    cardsContainer.innerHTML = createSpinnerHTML();

    const limit = pageNumber * 20;
    const start = limit - 19;

    try {
        const pokemons = await getPokemonRange(start, limit);
        cardsContainer.innerHTML = pokemons.map(p => createPokemonCardHTML(p)).join('');
    } catch (error) {
        cardsContainer.innerHTML = createErrorHTML('Ocurrió un error al cargar la lista.');
    }
}

searchForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const query = searchInput.value.trim().toLowerCase();

    if (!query) return;

    resetContainers();
    pokemonInfoContainer.innerHTML = createSpinnerHTML();

    try {
        const pokemon = await getPokemon(query);
        pokemonInfoContainer.innerHTML = `<div class="row justify-content-center">${createPokemonCardHTML(pokemon)}</div>`;
    } catch (error) {
        pokemonInfoContainer.innerHTML = createErrorHTML('Pokémon no encontrado.');
    }
});

pageSelect.addEventListener('change', (e) => {
    const page = parseInt(e.target.value);
    if (page) loadPage(page);
});

function resetContainers() {
    pokemonInfoContainer.innerHTML = '';
    cardsContainer.innerHTML = '';
}