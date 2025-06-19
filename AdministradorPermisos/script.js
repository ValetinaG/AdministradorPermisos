
document.addEventListener("DOMContentLoaded", function () {
    const tabs = document.querySelectorAll('.tab');
    const table = document.getElementById('permisos');
    const columnasFijas = [0, 1];
    const btnGuardar = document.getElementById("btnGuardar");
    let estadoOriginalSwitches = [];

    // Categorías de columnas por pestaña
    const categorias = {
        existencias: [2, 3, 40],
        orden: [4, 5, 6, 7, 8, 9, 10, 40],
        recibos: [11, 12, 13, 14, 15, 16, 40],
        cataciones: [17, 18, 19, 20, 40],
        produccion: [21, 22, 23, 24, 25, 26, 27, 28, 29, 40],
        cascara: [30, 31, 32, 33, 34, 35, 36, 37, 38, 40],
    };

    // Oculta todas las columnas excepto las fijas
    function ocultarColumnasDinamicas() {
        for (let i = 0; i < table.rows[0].cells.length; i++) {
            if (!columnasFijas.includes(i)) {
                for (let row of table.rows) {
                    if (row.cells[i]) {
                        row.cells[i].style.display = "none";
                    }
                }
            }
        }
    }

    // Muestra las columnas dadas
    function mostrarColumnas(indices) {
        indices.forEach(i => {
            for (let row of table.rows) {
                if (row.cells[i]) {
                    row.cells[i].style.display = "";
                }
            }
        });
    }

    // Actualiza el estado de los masterSwitch por fila
    function actualizarMasterSwitches() {
        const rows = table.querySelectorAll("tbody tr");
        rows.forEach(row => {
            const switches = row.querySelectorAll(".row-switch");
            const visibles = Array.from(switches).filter(sw => sw.offsetParent !== null);
            const allChecked = visibles.length > 0 && visibles.every(sw => sw.checked);

            const masterCell = row.cells[40];
            const masterSwitch = masterCell?.querySelector(".master-switch");
            if (masterSwitch) {
                masterSwitch.checked = allChecked;
            }
        });
    }

    // Detecta si hay cambios
    function verificarCambios() {
        const switches = document.querySelectorAll('.row-switch, #masterSwitch');
        const cambios = Array.from(switches).some((sw, index) => sw.checked !== estadoOriginalSwitches[index]);
        btnGuardar.disabled = !cambios;
    }

    // Guardar estado original al cargar
    function guardarEstadoOriginal() {
        const switches = document.querySelectorAll('.row-switch, #masterSwitch');
        estadoOriginalSwitches = Array.from(switches).map(sw => sw.checked);
    }

    // Restaurar switches al estado original
    function restaurarSwitches() {
        const switches = document.querySelectorAll('.row-switch, #masterSwitch');
        switches.forEach((sw, index) => {
            sw.checked = estadoOriginalSwitches[index];
        });
        actualizarMasterSwitches();
        verificarCambios();
    }

    // Inicializar pestañas
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");

            ocultarColumnasDinamicas();
            mostrarColumnas(categorias[tab.getAttribute("data-tab")]);
            actualizarMasterSwitches();
        });
    });

    // Inicializar switches y eventos
    const rows = table.querySelectorAll("#permisos tbody tr");
    rows.forEach(row => {
        const masterCell = row.cells[40];
        const masterSwitch = masterCell?.querySelector(".master-switch");
        const rowSwitches = row.querySelectorAll(".row-switch");

        if (masterSwitch) {
            // Cambia todos los visibles si se cambia el master
            masterSwitch.addEventListener("change", () => {
                const checked = masterSwitch.checked;
                rowSwitches.forEach(sw => {
                    if (sw.offsetParent !== null) {
                        sw.checked = checked;
                    }
                });
                verificarCambios();
            });
        }

        // Cada cambio en switch individual actualiza master y verifica cambios
        rowSwitches.forEach(sw => {
            sw.addEventListener("change", () => {
                const visibles = Array.from(rowSwitches).filter(sw => sw.offsetParent !== null);
                const allChecked = visibles.length > 0 && visibles.every(sw => sw.checked);
                if (masterSwitch) masterSwitch.checked = allChecked;
                verificarCambios();
            });
        });
    });

    // Guardar estado original al cargar
    guardarEstadoOriginal();
    ocultarColumnasDinamicas();
    mostrarColumnas(categorias["existencias"]);
    actualizarMasterSwitches();
    verificarCambios(); // Desactiva botón guardar si no hay cambios

    // Botón GUARDAR
    btnGuardar.addEventListener("click", function () {
        Swal.fire({
            title: '¡Cambios guardados!',
            text: 'Los permisos se han actualizado correctamente.',
            icon: 'success',
            confirmButtonText: 'Aceptar',
            customClass: {
                confirmButton: 'custom-swal-button',
                icon: 'custom-swal-icon'
            },
            buttonsStyling: false
        });

        // Se guarda el nuevo estado como original
        guardarEstadoOriginal();
        verificarCambios();
    });

    // Botón DESCARTAR
    document.getElementById("btnDescartar").addEventListener("click", function () {
        Swal.fire({
            title: '¿Descartar cambios?',
            text: 'Los cambios realizados no se guardarán.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, descartar',
            cancelButtonText: 'Cancelar',
            customClass: {
                popup: 'custom-swal-popup',
                title: 'custom-swal-title',
                htmlContainer: 'custom-swal-text',
                confirmButton: 'custom-swal-button-danger',
                cancelButton: 'custom-swal-button-cancel'
            },
            buttonsStyling: false
        }).then((result) => {
            if (result.isConfirmed) {
                restaurarSwitches();
                Swal.fire({
                    title: '¡Cambios descartados!',
                    icon: 'success',
                    text: 'Se restauraron los permisos anteriores.',
                    confirmButtonText: 'Aceptar',
                    customClass: {
                        popup: 'custom-swal-popup',
                        title: 'custom-swal-title',
                        htmlContainer: 'custom-swal-text',
                        confirmButton: 'custom-swal-button'
                    },
                    buttonsStyling: false
                });
            }
        });
    });
});

