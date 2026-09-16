import {
    db,
    realtimeDB
} from "./firebase.js";


import {
    collection,
    getDocs,
    addDoc,
    doc,
    runTransaction
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";


import {
    ref,
    update
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-database.js";


// ======================================================
// VARIABLES
// ======================================================

let componentes = [];

let categoriaActual = "todos";

let componenteSeleccionado = null;

let componenteParaRetirar = null;

let componenteParaAgregarCantidad = null;


// ======================================================
// ELEMENTOS PRINCIPALES
// ======================================================

const searchInput =
    document.getElementById("searchInput");

const componentsGrid =
    document.getElementById("componentsGrid");

const categoryButtons =
    document.querySelectorAll(".category-button");

const openAddComponentButton =
    document.getElementById("openAddComponentButton");


// ======================================================
// MODAL COMPONENTE
// ======================================================

const componentModal =
    document.getElementById("componentModal");

const closeComponentModal =
    document.getElementById("closeComponentModal");

const componentName =
    document.getElementById("componentName");

const componentCategory =
    document.getElementById("componentCategory");

const componentType =
    document.getElementById("componentType");

const componentQuantity =
    document.getElementById("componentQuantity");

const componentLocation =
    document.getElementById("componentLocation");

const componentSize =
    document.getElementById("componentSize");


const locationButton =
    document.getElementById("locationButton");

const nfcButton =
    document.getElementById("nfcButton");

const removeButton =
    document.getElementById("removeButton");

const addQuantityButton =
    document.getElementById("addQuantityButton");


// ======================================================
// MODAL AGREGAR COMPONENTE
// ======================================================

const addComponentModal =
    document.getElementById("addComponentModal");

const closeAddComponentModal =
    document.getElementById("closeAddComponentModal");

const addNombre =
    document.getElementById("addNombre");

const addCategoria =
    document.getElementById("addCategoria");

const addTipo =
    document.getElementById("addTipo");

const addCantidad =
    document.getElementById("addCantidad");

const addUbicacion =
    document.getElementById("addUbicacion");

const addTamaño =
    document.getElementById("addTamaño");

const addComponentButton =
    document.getElementById("addComponentButton");

const addComponentMessage =
    document.getElementById("addComponentMessage");


// ======================================================
// MODAL RETIRAR
// ======================================================

const removeModal =
    document.getElementById("removeModal");

const closeRemoveModal =
    document.getElementById("closeRemoveModal");

const removeComponentName =
    document.getElementById("removeComponentName");

const removeComponentType =
    document.getElementById("removeComponentType");

const removeComponentQuantity =
    document.getElementById("removeComponentQuantity");

const removeQuantity =
    document.getElementById("removeQuantity");

const confirmRemoveButton =
    document.getElementById("confirmRemoveButton");

const removeMessage =
    document.getElementById("removeMessage");


// ======================================================
// MODAL AGREGAR CANTIDAD
// ======================================================

const addQuantityModal =
    document.getElementById("addQuantityModal");

const closeAddQuantityModal =
    document.getElementById("closeAddQuantityModal");

const addQuantityComponentName =
    document.getElementById("addQuantityComponentName");

const addQuantityComponentType =
    document.getElementById("addQuantityComponentType");

const addQuantityCurrent =
    document.getElementById("addQuantityCurrent");

const quantityToAdd =
    document.getElementById("quantityToAdd");

const confirmAddQuantityButton =
    document.getElementById("confirmAddQuantityButton");

const addQuantityMessage =
    document.getElementById("addQuantityMessage");


// ======================================================
// FUNCIONES AUXILIARES
// ======================================================

function obtenerCampo(objeto, nombreCampo) {

    const claveEncontrada =
        Object.keys(objeto).find(
            clave =>
                clave.toLowerCase() ===
                nombreCampo.toLowerCase()
        );

    if (!claveEncontrada) {
        return undefined;
    }

    return objeto[claveEncontrada];
}


function normalizarTexto(texto) {

    return String(texto || "")
        .trim()
        .toLowerCase();
}


// ======================================================
// ENVIAR CAJÓN AL ESP32
// ======================================================

async function enviarCajonESP32(numeroCajon) {

    const cajon =
        Number(numeroCajon);


    if (
        !Number.isInteger(cajon) ||
        cajon < 1
    ) {

        console.error(
            "Número de cajón inválido:",
            numeroCajon
        );

        return false;
    }


    try {

        /*
            Guardamos dos cosas:

            cajon:
                número de cajón solicitado

            evento:
                cambia cada vez que alguien toca
                "Mostrar ubicación"

            Gracias a esto el ESP32 puede detectar:
                cajón 3
                cajón 3 otra vez
                cajón 3 otra vez
        */

        await update(
            ref(
                realtimeDB,
                "comando"
            ),
            {
                cajon: cajon,
                evento: Math.floor(Date.now() / 1000)
            }
        );


        console.log(
            "================================"
        );

        console.log(
            "Orden enviada al ESP32"
        );

        console.log(
            "Cajón:",
            cajon
        );

        console.log(
            "================================"
        );


        return true;


    } catch (error) {

        console.error(
            "ERROR enviando el cajón al ESP32:",
            error
        );


        return false;
    }
}


// ======================================================
// CARGAR COMPONENTES
// ======================================================

async function cargarComponentes() {

    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "componentes"
                )
            );


        componentes =
            snapshot.docs.map(
                documento => ({
                    id: documento.id,
                    ...documento.data()
                })
            );


        componentes.sort(
            (a, b) => {

                const nombreA =
                    obtenerCampo(
                        a,
                        "Nombre"
                    ) || "";

                const nombreB =
                    obtenerCampo(
                        b,
                        "Nombre"
                    ) || "";


                return nombreA.localeCompare(
                    nombreB
                );
            }
        );


        mostrarComponentes();

        abrirComponenteDesdeURL();


    } catch (error) {

        console.error(
            "Error cargando componentes:",
            error
        );


        if (componentsGrid) {

            componentsGrid.innerHTML =
                "<p>Error al cargar los componentes.</p>";
        }
    }
}


// ======================================================
// MOSTRAR COMPONENTES
// ======================================================

function mostrarComponentes() {

    if (!componentsGrid) {
        return;
    }


    const busqueda =
        normalizarTexto(
            searchInput?.value
        );


    const filtrados =
        componentes.filter(
            componente => {

                const nombre =
                    normalizarTexto(
                        obtenerCampo(
                            componente,
                            "Nombre"
                        )
                    );


                const categoria =
                    normalizarTexto(
                        obtenerCampo(
                            componente,
                            "Categoria"
                        )
                    );


                const tipo =
                    normalizarTexto(
                        obtenerCampo(
                            componente,
                            "Tipo"
                        )
                    );


                const ubicacion =
                    normalizarTexto(
                        obtenerCampo(
                            componente,
                            "Ubicacion"
                        )
                    );


                const coincideBusqueda =
                    nombre.includes(busqueda) ||
                    categoria.includes(busqueda) ||
                    tipo.includes(busqueda) ||
                    ubicacion.includes(busqueda);


                const coincideCategoria =
                    categoriaActual === "todos" ||
                    categoria ===
                        normalizarTexto(
                            categoriaActual
                        );


                return (
                    coincideBusqueda &&
                    coincideCategoria
                );
            }
        );


    componentsGrid.innerHTML = "";


    if (filtrados.length === 0) {

        componentsGrid.innerHTML =
            "<p>No se encontraron componentes.</p>";

        return;
    }


    filtrados.forEach(
        componente => {

            const tarjeta =
                crearTarjeta(
                    componente
                );


            componentsGrid.appendChild(
                tarjeta
            );
        }
    );
}


// ======================================================
// CREAR TARJETA
// ======================================================

function crearTarjeta(componente) {

    const tarjeta =
        document.createElement("div");


    tarjeta.classList.add(
        "component-card"
    );


    const nombre =
        obtenerCampo(
            componente,
            "Nombre"
        ) || "Sin nombre";


    const categoria =
        obtenerCampo(
            componente,
            "Categoria"
        ) || "Sin categoría";


    const tipo =
        obtenerCampo(
            componente,
            "Tipo"
        ) || "-";


    const cantidad =
        Number(
            obtenerCampo(
                componente,
                "Cantidad"
            )
        ) || 0;


    const ubicacion =
        obtenerCampo(
            componente,
            "Ubicacion"
        ) ?? "-";


    tarjeta.innerHTML = `

        <div class="component-category">
            ${categoria}
        </div>

        <h3>
            ${nombre}
        </h3>

        <p>
            Tipo:
            <strong>
                ${tipo}
            </strong>
        </p>

        <p>
            Cantidad:
            <strong>
                ${cantidad}
            </strong>
        </p>

        <p>
            Cajón:
            <strong>
                ${ubicacion}
            </strong>
        </p>

        <p>
            ${
                cantidad > 0
                    ? "Disponible"
                    : "Sin stock"
            }
        </p>
    `;


    tarjeta.addEventListener(
        "click",
        () => {

            abrirComponente(
                componente
            );
        }
    );


    return tarjeta;
}


// ======================================================
// ABRIR COMPONENTE
// ======================================================

function abrirComponente(componente) {

    componenteSeleccionado =
        componente;


    componenteParaRetirar =
        componente;


    componenteParaAgregarCantidad =
        componente;


    const nombre =
        obtenerCampo(
            componente,
            "Nombre"
        ) || "Sin nombre";


    const categoria =
        obtenerCampo(
            componente,
            "Categoria"
        ) || "-";


    const tipo =
        obtenerCampo(
            componente,
            "Tipo"
        ) || "-";


    const cantidad =
        Number(
            obtenerCampo(
                componente,
                "Cantidad"
            )
        ) || 0;


    const ubicacion =
        obtenerCampo(
            componente,
            "Ubicacion"
        ) ?? "-";


    const tamaño =
        obtenerCampo(
            componente,
            "Tamaño"
        );


    if (componentName) {
        componentName.textContent =
            nombre;
    }


    if (componentCategory) {
        componentCategory.textContent =
            categoria;
    }


    if (componentType) {
        componentType.textContent =
            tipo;
    }


    if (componentQuantity) {
        componentQuantity.textContent =
            cantidad;
    }


    if (componentLocation) {
        componentLocation.textContent =
            ubicacion;
    }


    if (componentSize) {

        componentSize.textContent =
            tamaño !== undefined
                ? tamaño
                : "-";
    }


    prepararBotonNFC(
        componente
    );


    if (componentModal) {

        componentModal.style.display =
            "flex";
    }
}


// ======================================================
// BOTÓN MOSTRAR UBICACIÓN
// ======================================================

if (locationButton) {

    locationButton.addEventListener(
        "click",
        async () => {

            if (!componenteSeleccionado) {

                alert(
                    "No hay ningún componente seleccionado."
                );

                return;
            }


            const ubicacion =
                Number(
                    obtenerCampo(
                        componenteSeleccionado,
                        "Ubicacion"
                    )
                );


            if (
                !Number.isInteger(
                    ubicacion
                ) ||
                ubicacion < 1
            ) {

                alert(
                    "Este componente no tiene una ubicación válida."
                );

                return;
            }


            console.log(
                "Enviando cajón:",
                ubicacion
            );


            const enviado =
                await enviarCajonESP32(
                    ubicacion
                );


            if (enviado) {

                alert(
                    `El componente está en el cajón ${ubicacion}.`
                );

            } else {

                alert(
                    "El cajón no pudo enviarse al ESP32."
                );
            }
        }
    );

} else {

    console.error(
        "No se encontró locationButton en el HTML."
    );
}


// ======================================================
// NFC
// ======================================================

function obtenerEnlaceNFC(
    componente
) {

    const url =
        new URL(
            window.location.href
        );


    url.search = "";


    url.searchParams.set(
        "componente",
        componente.id
    );


    return url.toString();
}


function prepararBotonNFC(
    componente
) {

    if (!nfcButton) {
        return;
    }


    nfcButton.textContent =
        "Copiar enlace NFC";


    nfcButton.onclick =
        async () => {

            const enlace =
                obtenerEnlaceNFC(
                    componente
                );


            try {

                await navigator.clipboard.writeText(
                    enlace
                );


                nfcButton.textContent =
                    "✓ Enlace copiado";


                setTimeout(
                    () => {

                        nfcButton.textContent =
                            "Copiar enlace NFC";

                    },
                    2000
                );


            } catch (error) {

                console.error(
                    "No se pudo copiar el enlace:",
                    error
                );


                prompt(
                    "Copiá este enlace para programar el NFC:",
                    enlace
                );
            }
        };
}


// ======================================================
// ABRIR COMPONENTE DESDE URL
// ======================================================

function abrirComponenteDesdeURL() {

    const parametros =
        new URLSearchParams(
            window.location.search
        );


    const id =
        parametros.get(
            "componente"
        );


    if (!id) {
        return;
    }


    const componente =
        componentes.find(
            componente =>
                componente.id === id
        );


    if (!componente) {
        return;
    }


    setTimeout(
        () => {

            abrirComponente(
                componente
            );

        },
        200
    );
}


// ======================================================
// ABRIR AGREGAR COMPONENTE
// ======================================================

if (openAddComponentButton) {

    openAddComponentButton.addEventListener(
        "click",
        () => {

            if (addComponentMessage) {

                addComponentMessage.textContent =
                    "";
            }


            if (addComponentModal) {

                addComponentModal.style.display =
                    "flex";
            }
        }
    );
}


// ======================================================
// AGREGAR COMPONENTE
// ======================================================

if (addComponentButton) {

    addComponentButton.addEventListener(
        "click",
        async () => {

            if (addComponentMessage) {

                addComponentMessage.textContent =
                    "";
            }


            const nombre =
                addNombre.value.trim();


            const categoria =
                addCategoria.value.trim();


            const tipo =
                addTipo.value.trim();


            const cantidad =
                Number(
                    addCantidad.value
                );


            const ubicacion =
                Number(
                    addUbicacion.value
                );


            const tamañoTexto =
                addTamaño
                    ? addTamaño.value.trim()
                    : "";


            // ==========================================
            // VALIDACIONES
            // ==========================================

            if (
                !nombre ||
                !categoria ||
                !tipo
            ) {

                addComponentMessage.textContent =
                    "Completá nombre, categoría y tipo.";

                return;
            }


            if (
                !Number.isInteger(cantidad) ||
                cantidad < 0
            ) {

                addComponentMessage.textContent =
                    "La cantidad debe ser un número entero mayor o igual a 0.";

                return;
            }


            if (
                !Number.isInteger(ubicacion) ||
                ubicacion < 1
            ) {

                addComponentMessage.textContent =
                    "El número de cajón no es válido.";

                return;
            }


            try {

                const snapshot =
                    await getDocs(
                        collection(
                            db,
                            "componentes"
                        )
                    );


                const componentesFirebase =
                    snapshot.docs.map(
                        documento => ({
                            id: documento.id,
                            ...documento.data()
                        })
                    );


                // ======================================
                // BUSCAR MISMO COMPONENTE
                // ======================================

                const componenteExistente =
                    componentesFirebase.find(
                        componente => {

                            const nombreExistente =
                                normalizarTexto(
                                    obtenerCampo(
                                        componente,
                                        "Nombre"
                                    )
                                );


                            const tipoExistente =
                                normalizarTexto(
                                    obtenerCampo(
                                        componente,
                                        "Tipo"
                                    )
                                );


                            const ubicacionExistente =
                                Number(
                                    obtenerCampo(
                                        componente,
                                        "Ubicacion"
                                    )
                                );


                            return (
                                nombreExistente ===
                                    normalizarTexto(nombre) &&

                                tipoExistente ===
                                    normalizarTexto(tipo) &&

                                ubicacionExistente ===
                                    ubicacion
                            );
                        }
                    );


                // ======================================
                // VER SI EL CAJÓN ESTÁ OCUPADO
                // ======================================

                const componenteEnCajon =
                    componentesFirebase.find(
                        componente => {

                            const ubicacionComponente =
                                Number(
                                    obtenerCampo(
                                        componente,
                                        "Ubicacion"
                                    )
                                );


                            return (
                                ubicacionComponente ===
                                ubicacion
                            );
                        }
                    );


                // ======================================
                // CAJÓN OCUPADO POR OTRO COMPONENTE
                // ======================================

                if (
                    componenteEnCajon &&
                    componenteEnCajon.id !==
                        componenteExistente?.id
                ) {

                    const nombreOcupante =
                        obtenerCampo(
                            componenteEnCajon,
                            "Nombre"
                        ) || "Sin nombre";


                    const tipoOcupante =
                        obtenerCampo(
                            componenteEnCajon,
                            "Tipo"
                        ) || "";


                    addComponentMessage.textContent =
                        `El cajón ${ubicacion} ya está ocupado por ${nombreOcupante}` +
                        (
                            tipoOcupante
                                ? ` (${tipoOcupante})`
                                : ""
                        ) +
                        ".";


                    return;
                }


                // ======================================
                // MISMO COMPONENTE → SUMAR CANTIDAD
                // ======================================

                if (componenteExistente) {

                    const referencia =
                        doc(
                            db,
                            "componentes",
                            componenteExistente.id
                        );


                    await runTransaction(
                        db,
                        async transaction => {

                            const documento =
                                await transaction.get(
                                    referencia
                                );


                            if (
                                !documento.exists()
                            ) {

                                throw new Error(
                                    "El componente ya no existe."
                                );
                            }


                            const datos =
                                documento.data();


                            const cantidadActual =
                                Number(
                                    obtenerCampo(
                                        datos,
                                        "Cantidad"
                                    )
                                ) || 0;


                            transaction.update(
                                referencia,
                                {
                                    Cantidad:
                                        cantidadActual +
                                        cantidad
                                }
                            );
                        }
                    );


                    addComponentMessage.textContent =
                        "Cantidad agregada correctamente.";


                } else {

                    // ==================================
                    // CREAR COMPONENTE NUEVO
                    // ==================================

                    const datosNuevoComponente = {

                        Nombre:
                            nombre,

                        Categoria:
                            categoria,

                        Tipo:
                            tipo,

                        Cantidad:
                            cantidad,

                        Ubicacion:
                            ubicacion
                    };


                    if (tamañoTexto !== "") {

                        const tamañoNumero =
                            Number(
                                tamañoTexto
                            );


                        datosNuevoComponente.Tamaño =
                            Number.isNaN(
                                tamañoNumero
                            )
                                ? tamañoTexto
                                : tamañoNumero;
                    }


                    await addDoc(
                        collection(
                            db,
                            "componentes"
                        ),
                        datosNuevoComponente
                    );


                    addComponentMessage.textContent =
                        "Componente agregado correctamente.";
                }


                await cargarComponentes();


                addNombre.value = "";
                addCategoria.value = "";
                addTipo.value = "";
                addCantidad.value = "";
                addUbicacion.value = "";


                if (addTamaño) {
                    addTamaño.value = "";
                }


                setTimeout(
                    () => {

                        if (addComponentModal) {

                            addComponentModal.style.display =
                                "none";
                        }

                    },
                    800
                );


            } catch (error) {

                console.error(
                    "Error agregando componente:",
                    error
                );


                addComponentMessage.textContent =
                    "Ocurrió un error al agregar el componente.";
            }
        }
    );
}


// ======================================================
// ABRIR RETIRAR
// ======================================================

if (removeButton) {

    removeButton.addEventListener(
        "click",
        () => {

            if (!componenteSeleccionado) {
                return;
            }


            componenteParaRetirar =
                componenteSeleccionado;


            const nombre =
                obtenerCampo(
                    componenteParaRetirar,
                    "Nombre"
                ) || "-";


            const tipo =
                obtenerCampo(
                    componenteParaRetirar,
                    "Tipo"
                ) || "-";


            const cantidad =
                Number(
                    obtenerCampo(
                        componenteParaRetirar,
                        "Cantidad"
                    )
                ) || 0;


            if (removeComponentName) {
                removeComponentName.textContent =
                    nombre;
            }


            if (removeComponentType) {
                removeComponentType.textContent =
                    tipo;
            }


            if (removeComponentQuantity) {
                removeComponentQuantity.textContent =
                    cantidad;
            }


            if (removeQuantity) {
                removeQuantity.value =
                    "";
            }


            if (removeMessage) {
                removeMessage.textContent =
                    "";
            }


            if (componentModal) {
                componentModal.style.display =
                    "none";
            }


            if (removeModal) {
                removeModal.style.display =
                    "flex";
            }
        }
    );
}


// ======================================================
// CONFIRMAR RETIRO
// ======================================================

if (confirmRemoveButton) {

    confirmRemoveButton.addEventListener(
        "click",
        async () => {

            if (!componenteParaRetirar) {
                return;
            }


            const cantidadARetirar =
                Number(
                    removeQuantity.value
                );


            if (
                !Number.isInteger(
                    cantidadARetirar
                ) ||
                cantidadARetirar <= 0
            ) {

                removeMessage.textContent =
                    "Ingresá una cantidad válida.";

                return;
            }


            try {

                const referencia =
                    doc(
                        db,
                        "componentes",
                        componenteParaRetirar.id
                    );


                await runTransaction(
                    db,
                    async transaction => {

                        const documento =
                            await transaction.get(
                                referencia
                            );


                        if (!documento.exists()) {

                            throw new Error(
                                "El componente no existe."
                            );
                        }


                        const datos =
                            documento.data();


                        const cantidadActual =
                            Number(
                                obtenerCampo(
                                    datos,
                                    "Cantidad"
                                )
                            ) || 0;


                        if (
                            cantidadARetirar >
                            cantidadActual
                        ) {

                            throw new Error(
                                "NO_HAY_STOCK"
                            );
                        }


                        transaction.update(
                            referencia,
                            {
                                Cantidad:
                                    cantidadActual -
                                    cantidadARetirar
                            }
                        );
                    }
                );


                removeMessage.textContent =
                    "Componente retirado correctamente.";


                await cargarComponentes();


                setTimeout(
                    () => {

                        if (removeModal) {

                            removeModal.style.display =
                                "none";
                        }

                    },
                    800
                );


            } catch (error) {

                console.error(
                    "Error retirando:",
                    error
                );


                if (
                    error.message ===
                    "NO_HAY_STOCK"
                ) {

                    removeMessage.textContent =
                        "No hay suficiente cantidad disponible.";

                } else {

                    removeMessage.textContent =
                        "Error al retirar el componente.";
                }
            }
        }
    );
}


// ======================================================
// ABRIR AGREGAR CANTIDAD
// ======================================================

if (addQuantityButton) {

    addQuantityButton.addEventListener(
        "click",
        () => {

            if (!componenteSeleccionado) {
                return;
            }


            componenteParaAgregarCantidad =
                componenteSeleccionado;


            const nombre =
                obtenerCampo(
                    componenteSeleccionado,
                    "Nombre"
                ) || "-";


            const tipo =
                obtenerCampo(
                    componenteSeleccionado,
                    "Tipo"
                ) || "-";


            const cantidad =
                Number(
                    obtenerCampo(
                        componenteSeleccionado,
                        "Cantidad"
                    )
                ) || 0;


            if (addQuantityComponentName) {

                addQuantityComponentName.textContent =
                    nombre;
            }


            if (addQuantityComponentType) {

                addQuantityComponentType.textContent =
                    tipo;
            }


            if (addQuantityCurrent) {

                addQuantityCurrent.textContent =
                    cantidad;
            }


            if (quantityToAdd) {

                quantityToAdd.value =
                    "";
            }


            if (addQuantityMessage) {

                addQuantityMessage.textContent =
                    "";
            }


            if (componentModal) {

                componentModal.style.display =
                    "none";
            }


            if (addQuantityModal) {

                addQuantityModal.style.display =
                    "flex";
            }
        }
    );
}


// ======================================================
// CONFIRMAR AGREGAR CANTIDAD
// ======================================================

if (confirmAddQuantityButton) {

    confirmAddQuantityButton.addEventListener(
        "click",
        async () => {

            if (
                !componenteParaAgregarCantidad
            ) {

                return;
            }


            const cantidadAgregar =
                Number(
                    quantityToAdd.value
                );


            if (
                !Number.isInteger(
                    cantidadAgregar
                ) ||
                cantidadAgregar <= 0
            ) {

                addQuantityMessage.textContent =
                    "Ingresá una cantidad válida.";

                return;
            }


            try {

                const referencia =
                    doc(
                        db,
                        "componentes",
                        componenteParaAgregarCantidad.id
                    );


                await runTransaction(
                    db,
                    async transaction => {

                        const documento =
                            await transaction.get(
                                referencia
                            );


                        if (!documento.exists()) {

                            throw new Error(
                                "El componente no existe."
                            );
                        }


                        const datos =
                            documento.data();


                        const cantidadActual =
                            Number(
                                obtenerCampo(
                                    datos,
                                    "Cantidad"
                                )
                            ) || 0;


                        transaction.update(
                            referencia,
                            {
                                Cantidad:
                                    cantidadActual +
                                    cantidadAgregar
                            }
                        );
                    }
                );


                addQuantityMessage.textContent =
                    "Cantidad agregada correctamente.";


                await cargarComponentes();


                setTimeout(
                    () => {

                        if (
                            addQuantityModal
                        ) {

                            addQuantityModal.style.display =
                                "none";
                        }

                    },
                    800
                );


            } catch (error) {

                console.error(
                    "Error agregando cantidad:",
                    error
                );


                addQuantityMessage.textContent =
                    "Error al agregar cantidad.";
            }
        }
    );
}


// ======================================================
// CERRAR MODALES
// ======================================================

if (closeComponentModal) {

    closeComponentModal.addEventListener(
        "click",
        () => {

            componentModal.style.display =
                "none";
        }
    );
}


if (closeAddComponentModal) {

    closeAddComponentModal.addEventListener(
        "click",
        () => {

            addComponentModal.style.display =
                "none";
        }
    );
}


if (closeRemoveModal) {

    closeRemoveModal.addEventListener(
        "click",
        () => {

            removeModal.style.display =
                "none";
        }
    );
}


if (closeAddQuantityModal) {

    closeAddQuantityModal.addEventListener(
        "click",
        () => {

            addQuantityModal.style.display =
                "none";
        }
    );
}


// ======================================================
// BUSCADOR
// ======================================================

if (searchInput) {

    searchInput.addEventListener(
        "input",
        mostrarComponentes
    );
}


// ======================================================
// CATEGORÍAS
// ======================================================

categoryButtons.forEach(
    boton => {

        boton.addEventListener(
            "click",
            () => {

                categoriaActual =
                    boton.dataset.category ||
                    "todos";


                categoryButtons.forEach(
                    b => {

                        b.classList.remove(
                            "active"
                        );
                    }
                );


                boton.classList.add(
                    "active"
                );


                mostrarComponentes();
            }
        );
    }
);


// ======================================================
// INICIO
// ======================================================

console.log(
    "app.js iniciado correctamente"
);

cargarComponentes();