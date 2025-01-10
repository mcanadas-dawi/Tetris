//TODOS LOS CANVAS Y LIENZOS
const canvasTablero = document.getElementById("tetris");
const lienzoTablero = canvasTablero.getContext("2d");
const canvasPuntuacion = document.getElementById("puntuacion");
const lienzoPuntuacion = canvasPuntuacion.getContext("2d");
const canvasProxFicha = document.getElementById("ficha");
const lienzoProxFicha = canvasProxFicha.getContext("2d");

const filas = 20;
const columnas = 10;
const tamanoCelda = 30;
const tablero = Array(filas).fill().map(() => Array(columnas).fill(0)); 
// VARIABLES GLOBALES PARA EL JUEGO
let piezaActual= null;
let xActual = 0;
let yActual = 0;
let intervaloJuego = null;
let bloqueado = false;
let puntuacion = 0;
let siguientePieza = null;
let modoJuego = "principiante";
let velocidad = 500;

// PIEZAS
const pieza1 = {
    nombre: "I",
    forma: [[1],[1],[1]],
    probabilidad: 0.2,
    color: "blue"
}
const pieza2 = {
    nombre: "T",
    forma: [[0,1,0],[1,1,1]],
    probabilidad: 0.2,
    color: "yellow"
}
const pieza3 = {
    nombre: "cuadrado" ,
    forma: [[1,1],[1,1]],
    probabilidad: 0.2 ,
    color: "green"
}
const pieza4 = {
    nombre: "L",
    forma: [[1,0],[1,0],[1,1]],
    probabilidad: 0.2,
    color: "orange"
}
const pieza5 = {
    nombre: "C",
    forma: [[1,1,1],[1,0,1]],
    probabilidad: 0.2,
    color: "red"
}
const piezas = [pieza1, pieza2, pieza3, pieza4, pieza5];
//FUNCIONES

//DIBUJAR TABLERO
function dibujarTablero() {
    tablero.forEach((fila, i) => {
        fila.forEach((celda, j) => {
            // Si la celda tiene un valor de 1, pintarla de gris, si no, negra
            lienzoTablero.fillStyle = celda === 1 ? "gray" : "black";
            lienzoTablero.fillRect(j * tamanoCelda, i * tamanoCelda, tamanoCelda, tamanoCelda);
            // Opcional: Dibujar bordes
            lienzoTablero.strokeStyle = "green";
            lienzoTablero.strokeRect(j * tamanoCelda, i * tamanoCelda, tamanoCelda, tamanoCelda);
        });
    });
}


dibujarTablero();

//DIBUJAR PIEZA
function dibujarPieza(pieza, x, y) {
    pieza.forma.forEach((fila, i) => {
        fila.forEach((celda, j) => {
            if (celda === 1) {
                lienzoTablero.fillStyle = pieza.color;
                lienzoTablero.fillRect((x + j) * tamanoCelda, (y + i) * tamanoCelda, tamanoCelda, tamanoCelda);
            }
        });
    });
}

//GENERAR PIEZA
    function generarPieza() {
        // Crear un array de probabilidades acumuladas
        let acumulado = 0;
        const limites = piezas.map(pieza => {
            acumulado += pieza.probabilidad;
            return acumulado;
        });
    
        // Generar un número aleatorio entre 0 y 1
        const random = Math.random();
    
        // Determinar la pieza según el número aleatorio y los límites acumulados
        for (let i = 0; i < limites.length; i++) {
            if (random < limites[i]) {
                return piezas[i];
            }
        }
        // Por seguridad, retornar la última pieza si algo falla
        return piezas[piezas.length - 1];
    }
    
    

  
    // CHEQUEAR COLISIONES
    function chequearColisiones(pieza, x, y) {
        for (let i = 0; i < pieza.forma.length; i++) {
            for (let j = 0; j < pieza.forma[i].length; j++) {
                if (pieza.forma[i][j] !== 0) {
                    // Verifica bordes del tablero y ocupación de celdas
                    if (
                        y + i < 0 ||
                        y + i >= filas ||
                        x + j < 0 ||
                        x + j >= columnas ||
                        tablero[y + i]?.[x + j] !== 0
                    ) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
// POSICIONAR LA PIEZA EN EL TABLERO (ACTUALIZAR TABLERO CON PIEZA INCLUIDA EN GRIS)
function posicionaPieza(pieza, x, y) {
    pieza.forma.forEach((fila, i) => {
        fila.forEach((celda, j) => {
            if (celda === 1) {
                tablero[y + i][x + j] = 1;
            }
        });
    });
}
    //ELIMINAR LINEA
    function eliminarLinea(){
        let lineasEliminadas = 0;
        for (let i = 0; i < tablero.length; i++) {
            if (tablero[i].every(celda => celda !== 0)) {
                tablero.splice(i, 1);
                tablero.unshift(Array(columnas).fill(0));
                lineasEliminadas++;
            }
        }
        if (lineasEliminadas > 0) {
            incrementarPuntuacion(lineasEliminadas);
        }
    }
   // ACTUALIZAR EL JUEGO
   function actualizar() {
    piezaActual = siguientePieza || generarPieza(); // Usa la próxima pieza si existe, o genera una nueva
    siguientePieza = generarPieza(); // Genera una nueva próxima ficha
    xActual = Math.floor((columnas - piezaActual.forma[0].length) / 2); // Posición inicial en el centro
    yActual = 0; // Empieza desde arriba

    if (chequearColisiones(piezaActual, xActual, yActual)) {
        alert("FIN DE LA PARTIDA, este juego ha sido desarrollado por Marc Cañadas");
        reiniciarJuego();
        return;
    }

    dibujarProximaFicha(); // Dibuja la nueva próxima ficha en su canvas
}
// INICIAR UN NUEVO INTERVALO
function iniciarIntervalo() {
    if (intervaloJuego !== null) {
        clearInterval(intervaloJuego);
    }

    intervaloJuego = setInterval(gestionarMovimiento, velocidad);
}

//FUNCION PARA GESTIONAR MOVIMIENTO CAIDA
function gestionarMovimiento() {
    if (!bloqueado) {
        bloqueado = true;
        if (!chequearColisiones(piezaActual, xActual, yActual + 1)) {
            yActual += 1;
        } else {
            posicionaPieza(piezaActual, xActual, yActual);
            eliminarLinea();
            actualizar();
        }
        bloqueado = false;
    }

    dibujarTablero();
    dibujarPieza(piezaActual, xActual, yActual);
}
// EVENTOS DE TECLADO
function registrarEventosTeclado() {
    document.addEventListener('keydown', (event) => {
        if (event.key === 'a' || event.key === 'A') {
            // Mover la pieza a la izquierda
            if (!chequearColisiones(piezaActual, xActual - 1, yActual)) {
                xActual -= 1;
            }
        } else if (event.key === 'd' || event.key === 'D') {
            // Mover la pieza a la derecha
            if (!chequearColisiones(piezaActual, xActual + 1, yActual)) {
                xActual += 1;
            }
        } else if (event.key === 's' || event.key === 'S') {
            // Mover la pieza hacia abajo
            if (!chequearColisiones(piezaActual, xActual, yActual + 1)) {
                yActual ++;
            } else {
                // Fijar la pieza en el tablero si ya no puede moverse hacia abajo
                posicionaPieza(piezaActual, xActual, yActual);
                eliminarLinea();
                actualizar(); // Genera una nueva pieza inmediatamente
            }
        } else if (event.key === 'w' || event.key === 'W') {
            // Rotar la pieza
            const formaRotada = rotarMatriz(piezaActual.forma);

            // Verifica que la rotación no colisione
            if (!chequearColisiones({ forma: formaRotada }, xActual, yActual)) {
                piezaActual.forma = formaRotada; // Actualiza la forma de la pieza a la rotada
            }
        }

        dibujarTablero();
        dibujarPieza(piezaActual, xActual, yActual);
    });
}

// Función para rotar la matriz de la pieza 90 grados en sentido horario
function rotarMatriz(matriz) {
    const filas = matriz.length;
    const columnas = matriz[0].length;
    const nuevaMatriz = Array.from({ length: columnas }, () => Array(filas).fill(0));

    for (let i = 0; i < filas; i++) {
        for (let j = 0; j < columnas; j++) {
            nuevaMatriz[j][filas - 1 - i] = matriz[i][j];
        }
    }

    return nuevaMatriz;
}

// FUNCION PARA REINICIAR EL JUEGO
function reiniciarJuego() {
    for (let i = 0; i < filas; i++) {
        for (let j = 0; j < columnas; j++) {
            tablero[i][j] = 0; // Vaciamos todas las celdas del tablero
        }
    }

    puntuacion = 0; // Reiniciamos la puntuación
    siguientePieza = null; // Reiniciamos la próxima ficha
    actualizarPuntuacion();
    dibujarProximaFicha(); // Limpia el canvas de la próxima ficha
    piezaActual = null;
    xActual = 0;
    yActual = 0;

    if (intervaloJuego !== null) {
        clearInterval(intervaloJuego);
        intervaloJuego = null;
    }

    jugar();
}

// JUGAR
function jugar() {
    dibujarTablero();
    actualizar();
    puntuacion = 0; //reiniciamos puntuacion
    velocidad = 500; //reiniciamos velocidad
    actualizarPuntuacion();
    iniciarIntervalo();
}

//PUNTUACION

// ACTUALIZAR PUNTUACIÓN EN EL CANVAS
function actualizarPuntuacion() {
    lienzoPuntuacion.clearRect(0, 0, canvasPuntuacion.width, canvasPuntuacion.height); // Limpiamos el canvas
    lienzoPuntuacion.fillStyle = "orange"; // Color del texto
    lienzoPuntuacion.font = "30px Verdana"; // Estilo y tamaño de fuente
    lienzoPuntuacion.textAlign = "center"; // Centramos el texto horizontalmente
    lienzoPuntuacion.textBaseline = "middle"; // Centramos el texto verticalmente
    lienzoPuntuacion.fillText(puntuacion, canvasPuntuacion.width / 2, canvasPuntuacion.height / 2); // Dibujamos la puntuación
}

// INCREMENTAR PUNTUACIÓN
let controladorPuntuacion = 0; // Guarda la última puntuación en la que se ajustó la velocidad

function incrementarPuntuacion(lineasEliminadas) {
    const puntosPorLinea = [0, 100, 300, 500, 800];
    puntuacion += puntosPorLinea[lineasEliminadas] || 0;
    actualizarPuntuacion();

    // Aumentar la velocidad cada vez que se pase un múltiplo de 1000 puntos en modo intermedio 
    if (modoJuego === "intermedio" && puntuacion >= controladorPuntuacion + 500) { //HOLA JAIME, SI NO QUIERES JUGAR HASTA 500 REDUCELO A  100 
        velocidad = Math.max(100, velocidad - 100); // Reducimos la velocidad hasta un mínimo de 100ms
        controladorPuntuacion = puntuacion; // Actualizamos la última puntuación de ajuste.
        iniciarIntervalo(); // Reiniciamos el intervalo con la nueva velocidad
    }
}

//PROXIMA FICHA

function dibujarProximaFicha() {
    lienzoProxFicha.clearRect(0, 0, canvasProxFicha.width, canvasProxFicha.height); // Limpia el canvas

    if (siguientePieza) {
        const offsetX = (canvasProxFicha.width - siguientePieza.forma[0].length * tamanoCelda) / 2;
        const offsetY = (canvasProxFicha.height - siguientePieza.forma.length * tamanoCelda) / 2;

        siguientePieza.forma.forEach((fila, i) => {
            fila.forEach((celda, j) => {
                if (celda === 1) {
                    lienzoProxFicha.fillStyle = siguientePieza.color;
                    lienzoProxFicha.fillRect(
                        offsetX + j * tamanoCelda,
                        offsetY + i * tamanoCelda,
                        tamanoCelda,
                        tamanoCelda
                    );
                }
            });
        });
    }
}

//MODO DE JUEGO
function seleccionarModo() {
    const modo = prompt("Selecciona el modo de juego(escribe 1, 2 o el modo):\n1. Principiante\n2. Intermedio");

    if (modo === null || (modo !== "1" && modo.toLowerCase() !== "principiante" && modo !== "2" && modo.toLowerCase() !== "intermedio")){
        alert("No seleccionaste un modo correctamente. Se jugará en modo PRINCIPIANTE por defecto.");
        modoJuego = "principiante";
        velocidad = 500; 
    } else if (modo === "2" || modo.toLowerCase() === "intermedio") {
        alert("En este modo la velocidad aumentará cada 500 puntos, suerte!");
        modoJuego = "intermedio";
        velocidad = 500; 
    } else {
        alert("Has seleccionado el modo PRINCIPIANTE, si deseas cambiar de nivel recarga la página.");
        modoJuego = "principiante";
        velocidad = 500; 
    }
}

// FUNCIONES NECESARIAS PARA INICIAR EL JUEGO
seleccionarModo();
jugar();
registrarEventosTeclado(); 