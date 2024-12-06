let paginaActual = 1;
let queryActual = "";
let cargando = false;
let tipoActual = ""; // Variable para almacenar el tipo actual (película o serie)
let alertaMostrada = false; // Bandera para controlar las alertas

window.onload = () => {
    document.getElementById("btn").addEventListener("click", iniciarBusqueda);
    window.addEventListener("scroll", manejarScrollInfinito);
    document.getElementById("searchInput").addEventListener("input", manejarBusquedaAutomatica);
    document.getElementById("filtroTipo").addEventListener("change", cambiarFiltro);
};

function cambiarFiltro() {
    tipoActual = document.getElementById("filtroTipo").value;
    iniciarBusqueda();
}

function manejarBusquedaAutomatica() {
    const searchInput = document.getElementById("searchInput").value.trim();

    if (searchInput.length >= 3) {
        queryActual = searchInput;
        paginaActual = 1;
        limpiarListaPeliculas();
        peticionFetch(queryActual, paginaActual, tipoActual);
    }
}

function iniciarBusqueda() {
    const searchInput = document.getElementById("searchInput").value.trim();

    if (!searchInput) {
        if (!alertaMostrada) {
            alert("Por favor ingresa un término de búsqueda");
            alertaMostrada = true; // Marcamos que se ha mostrado la alerta
        }
        return;
    }

    queryActual = searchInput;
    paginaActual = 1;
    limpiarListaPeliculas();
    alertaMostrada = false; // Reiniciamos la bandera de alerta para futuras búsquedas

    peticionFetch(queryActual, paginaActual, tipoActual);
}

function manejarScrollInfinito() {
    if (
        !cargando && // Evitar duplicar peticiones
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 100
    ) {
        cargarMasResultados();
    }
}

function cargarMasResultados() {
    if (!queryActual) {
        return;
    }

    paginaActual++;
    peticionFetch(queryActual, paginaActual, tipoActual);
}

function peticionFetch(query, pagina, tipo) {
    cargando = true;
    mostrarSpinner();

    const tipoFiltro = tipo ? `&type=${tipo}` : "";

    fetch(`https://www.omdbapi.com/?apikey=3fa0bc41&s=${query}&page=${pagina}${tipoFiltro}`)
        .then((response) => response.json())
        .then((datosRecibidos) => {
            if (datosRecibidos.Response === "True") {
                mostrarPeliculas(datosRecibidos.Search);
            } else {
                if (!alertaMostrada) {
                    alert("No se encontraron más resultados.");
                    alertaMostrada = true; // Marcamos que se ha mostrado la alerta
                }
            }
        })
        .catch((error) => {
            console.error("Error al hacer la petición:", error);
        })
        .finally(() => {
            cargando = false;
            ocultarSpinner();
        });
}

function limpiarListaPeliculas() {
    const miLista = document.getElementById("lista");
    miLista.innerHTML = "";
}

function mostrarPeliculas(peliculas) {
    const miLista = document.getElementById("lista");

    for (const pelicula of peliculas) {
        const li = document.createElement("li");
        li.classList.add("movie-item");

        const img = document.createElement("img");
        img.src = pelicula.Poster !== "N/A" ? pelicula.Poster : "https://via.placeholder.com/150";
        img.alt = pelicula.Title;
        img.dataset.id = pelicula.imdbID;

        img.addEventListener("click", mostrarDetallePelicula);

        li.appendChild(img);

        const titulo = document.createElement("div");
        titulo.classList.add("movie-info");
        titulo.innerHTML = `<h3>${pelicula.Title}</h3><p>${pelicula.Year}</p>`;

        li.appendChild(titulo);
        miLista.appendChild(li);
    }
}

function mostrarDetallePelicula(event) {
    const idPelicula = event.target.dataset.id;

    if (!idPelicula) {
        alert("No se encontró el ID de la película.");
        return;
    }

    mostrarSpinner();

    fetch(`https://www.omdbapi.com/?apikey=3fa0bc41&i=${idPelicula}`)
        .then((response) => response.json())
        .then((detallePelicula) => {
            if (detallePelicula.Response === "True") {
                abrirModalConDetalles(detallePelicula);
            } else {
                alert("No se pudieron cargar los detalles.");
            }
        })
        .catch((error) => {
            console.error("Error al cargar detalles:", error);
            alert("Hubo un error al obtener los detalles.");
        })
        .finally(() => {
            ocultarSpinner();
        });
}

function abrirModalConDetalles(detallePelicula) {
    // Título, descripción y actores
    document.getElementById('modal-title').textContent = detallePelicula.Title;
    document.getElementById('modal-description').innerHTML = `
        <strong>Año:</strong> ${detallePelicula.Year}<br>
        <strong>Director:</strong> ${detallePelicula.Director}<br>
        <strong>Actores:</strong> ${detallePelicula.Actors}<br>
        <strong>Sinopsis:</strong> ${detallePelicula.Plot}<br>
        <strong>Valoración IMDb:</strong> ${detallePelicula.imdbRating}
    `;

    // Poster de la película
    document.getElementById('modal-image').src = detallePelicula.Poster !== "N/A"
        ? detallePelicula.Poster
        : "https://via.placeholder.com/400";

    // Mostrar otras valoraciones si existen
    const valoraciones = detallePelicula.Ratings;
    const valoracionesLista = document.getElementById('modal-ratings');
    valoracionesLista.innerHTML = ""; // Limpiar valoraciones previas

    if (valoraciones && valoraciones.length > 0) {
        valoraciones.forEach((rating) => {
            const li = document.createElement('li');
            li.textContent = `${rating.Source}: ${rating.Value}`;
            valoracionesLista.appendChild(li);
        });
    } else {
        valoracionesLista.innerHTML = "<li>No hay valoraciones adicionales disponibles.</li>";
    }

    // Mostrar el modal
    document.getElementById('modal').style.display = 'block';
}

document.querySelector('.close-btn').addEventListener('click', function () {
    document.getElementById('modal').style.display = 'none';
});

window.addEventListener('click', function (event) {
    if (event.target === document.getElementById('modal')) {
        document.getElementById('modal').style.display = 'none';
    }
});

function mostrarSpinner() {
    const spinner = document.getElementById("spinner");
    if (spinner) {
        spinner.style.display = "block";
    }
}

function ocultarSpinner() {
    const spinner = document.getElementById("spinner");
    if (spinner) {
        spinner.style.display = "none";
    }
}
