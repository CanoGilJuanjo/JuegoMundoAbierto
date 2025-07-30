
/** * Tasa de actualizacion del mapa
 * @type {number}
 * * Esta variable controla la velocidad de actualizacion del mapa
 * */
var TASA_ACTUALIZACION = 200;
let mapa = [];
let tiempoPartida = 0;
addEventListener("DOMContentLoaded",()=>{
    //Vamos a dibujar las barras de comida y vida
    let bararas = document.querySelectorAll(".barra-progreso")
    bararas[0].innerHTML = "";
    bararas[1].innerHTML = "";
    for(let i = 0; i < bararas.length; i++){
        if(i == 0){
            for(let j = 0; j < 100; j++){
                bararas[i].innerHTML += `<div class="segmento-rojo">`;
            }
        }else{
            for(let j = 0; j < 100; j++){
                bararas[i].innerHTML += `<div class="segmento-amarillo">`;
            }
        }
    }



    let MAX_MAP_SIZE = 12;
    
    var chunk = {
        chunk:[],
        x:0,
        y:0,
        cajas:[],
        agua:false,
        posicion_agua:null //derecha,izquierda, arriba, abajo, arriba-izquierda, arriba-derecha, abajo-izquierda, abajo-derecha
    };
    /**
     * Datos del Jugador
     * */
    let Jugador = {
        x: 0,
        y: 0,
        comida:100,
        vida:100,
        inventario:[],
        MAX_INVENTARIO: 5,
        direccion:"arriba" //arriba, abajo, izquierda, derecha
    }
    //Cajas
    var caja = {
        x: 0,
        y: 0,
        contenido: null //Null-> vacio, 1-> comida, 2-> arma
    }
    
    //Primer chunk
    generarChunk();
    chunk.chunk[Jugador.x][Jugador.y] = 1; //Colocacion del jugador
    //Pruebas
    chunk.chunk[3][3] = 5;
    chunk.chunk[4][3] = 5;
    chunk.chunk[5][3] = 5;
    chunk.chunk[6][3] = 5;
    chunk.chunk[7][3] = 5;
    chunk.chunk[8][3] = 5;
    chunk.chunk[9][3] = 6;
    /**
     * Indice de valores del chunk
     *  0 -> cesped
     *  1 -> Player
     *  2 -> Caja
     *  3 -> Agua
     *  4 -> Enemigo
     *  5 -> Comida
     *  6 -> Arma
     */

    /**
     * Almacenar y buscar chunks en el array mapa
     * Cada chunk se almacena como un objeto con sus coordenadas y datos
     */
    function guardarChunk(chunk) {
        // Crear copia profunda del chunk antes de guardarlo
        const chunkCopia = {
            chunk: JSON.parse(JSON.stringify(chunk.chunk)),
            x: chunk.x,
            y: chunk.y,
            cajas: JSON.parse(JSON.stringify(chunk.cajas)),
            agua: chunk.agua,
            posicion_agua: chunk.posicion_agua
        };
        
        // Buscar si existe
        let idx = -1;
        for(let i = 0; i < mapa.length; i++) {
            if(chunk.x === mapa[i].x && chunk.y === mapa[i].y) {
                idx = i;
                break;
            }
        }

        if(idx === -1) {
            mapa.push(chunkCopia);
        } else {
            mapa[idx] = chunkCopia;
        }
    }

    function buscarChunk(x, y) {
        const chunkEncontrado = mapa.find(c => c.x === x && c.y === y);
        if(chunkEncontrado) {
            // Retornar copia profunda para evitar modificar el original
            return {
                chunk: JSON.parse(JSON.stringify(chunkEncontrado.chunk)),
                x: chunkEncontrado.x,
                y: chunkEncontrado.y,
                cajas: JSON.parse(JSON.stringify(chunkEncontrado.cajas)),
                agua: chunkEncontrado.agua, 
                posicion_agua: chunkEncontrado.posicion_agua
            };
        }
        return undefined;
    }
    function generarChunk() {
        
        let chunkT = [];
        for (let i = 0; i < MAX_MAP_SIZE; i++) {
            chunkT.push([]);
            for (let j = 0; j < MAX_MAP_SIZE; j++) {
                chunkT[i].push(0);
            }
        }
       
        //Probabilidad de crear 3 grupos de cajas
        chunk.cajas = [];
        if(Math.floor(Math.random() * 10) == 0){ //Probabilidad de crear caja 1/10
            for(let i = 0;i<=Math.floor(Math.random() * 3);i++){
                let posicionCajaX = Math.floor(Math.random() * MAX_MAP_SIZE);
                let posicionCajaY = Math.floor(Math.random() * MAX_MAP_SIZE);
                while((posicionCajaX == 0 || posicionCajaY == MAX_MAP_SIZE-1) && chunk.cajas.find(c => c.x === posicionCajaX-1 && c.y === posicionCajaY) != undefined && chunkT[posicionCajaX][posicionCajaY] != 0){
                    posicionCajaX = Math.floor(Math.random() * MAX_MAP_SIZE);
                    posicionCajaY = Math.floor(Math.random() * MAX_MAP_SIZE);
                    guardarCaja(posicionCajaX,posicionCajaY); //Guardamos la caja
                }
                //chunkT[posicionCajaX][posicionCajaY] = 2; //Colocacion de 1 caja
                if(posicionCajaX-1>0 && chunk.cajas.find(c => c.x === posicionCajaX-1 && c.y === posicionCajaY) == undefined){
                    //chunkT[posicionCajaX-1][posicionCajaY] = 2; //Colocacion de 1 caja
                    guardarCaja(posicionCajaX-1,posicionCajaY); //Guardamos la caja
                }
                if(posicionCajaY+1<MAX_MAP_SIZE-1 && chunk.cajas.find(c => c.x === posicionCajaX && c.y === posicionCajaY+1) == undefined){
                    //chunkT[posicionCajaX][posicionCajaY+1] = 2; //Colocacion de 1 caja
                    guardarCaja(posicionCajaX,posicionCajaY+1); //Guardamos la caja
                }
                if(posicionCajaX-1>0 && posicionCajaY+1<=MAX_MAP_SIZE-1 && chunk.cajas.find(c => c.x === posicionCajaX-1 && c.y === posicionCajaY+1) == undefined){
                    //chunkT[posicionCajaX-1][posicionCajaY+1] = 2; //Colocacion de 1 caja
                    guardarCaja(posicionCajaX-1,posicionCajaY+1); //Guardamos la caja
                }
            }
        }
        chunk.cajas.forEach((caja)=>{
            chunkT[caja.x][caja.y] = 2; //Colocacion de las cajas
        })

        //Almacenamos el Chunk generado
        chunk.chunk = chunkT;
        
        guardarChunk(chunk);
    }
    
    function guardarCaja(x,y){
        const cajaCopia = {
            x: x,
            y: y,
            contenido: null //Null-> vacio, 1-> comida, 2-> arma
        }
        if(Math.floor(Math.random()*5) == 0){ //Probabilidad de que la caja tenga contenido 1/5
            if(Math.floor(Math.random() * 6) == 3){ //Probabilidad de que la caja tenga comida 3/4 arma 1/4
                cajaCopia.contenido = 6; //Caja con arma
            }else{
                cajaCopia.contenido = 5; //Caja con comida
            }
        }
        chunk.cajas.push(cajaCopia); //Almacenamos la caja en el chunk
    }
    /**
     * Control del Jugador
     */
    addEventListener("keydown",(e)=>{
        if(Jugador.vida > 0){
            chunk.chunk[Jugador.x][Jugador.y] = 0;
            if(e.key == "ArrowUp" || e.key == "w" || e.key == "W"){
                Jugador.direccion = "arriba";
                if(Jugador.x > 0 && (chunk.chunk[Jugador.x-1][Jugador.y] == 0 || chunk.chunk[Jugador.x-1][Jugador.y] == 5 || chunk.chunk[Jugador.x-1][Jugador.y] == 6)){
                    if((chunk.chunk[Jugador.x-1][Jugador.y] == 5 || chunk.chunk[Jugador.x-1][Jugador.y] == 6) && Jugador.inventario.length<Jugador.MAX_INVENTARIO){
                        Jugador.inventario.push(chunk.chunk[Jugador.x-1][Jugador.y]);
                        pintarInventario(Jugador);
                    }else if(Jugador.inventario.length == Jugador.MAX_INVENTARIO){
                        chunk.chunk[Jugador.x][Jugador.y] = chunk.chunk[Jugador.x-1][Jugador.y]
                    }
                    Jugador.x--;
                }else if(Jugador.x <= 0){
                    Jugador.x = MAX_MAP_SIZE-1;
                    guardarChunk(chunk);
                    if(buscarChunk((parseInt(chunk.x)-1),chunk.y) != undefined){ //Corregir guadado de chunk
                        chunk = buscarChunk((parseInt(chunk.x)-1),chunk.y);
                    }else{
                        chunk.x--;
                        generarChunk();
                    }
                }
            }else if(e.key == "ArrowDown" || e.key == "s" || e.key == "S"){
                Jugador.direccion = "abajo";
                if(Jugador.x < MAX_MAP_SIZE-1 && (chunk.chunk[Jugador.x+1][Jugador.y] == 0 || chunk.chunk[Jugador.x+1][Jugador.y] == 5 || chunk.chunk[Jugador.x+1][Jugador.y] == 6)){
                    if((chunk.chunk[Jugador.x+1][Jugador.y] == 5 || chunk.chunk[Jugador.x+1][Jugador.y] == 6) && Jugador.inventario.length<Jugador.MAX_INVENTARIO){
                        Jugador.inventario.push(chunk.chunk[Jugador.x+1][Jugador.y]);
                        pintarInventario(Jugador);
                    }else if(Jugador.inventario.length == Jugador.MAX_INVENTARIO){
                        chunk.chunk[Jugador.x][Jugador.y] = chunk.chunk[Jugador.x+1][Jugador.y]
                    }
                    Jugador.x++;
                }else if(Jugador.x >= MAX_MAP_SIZE-1){
                    Jugador.x = 0;
                    guardarChunk(chunk);
                    if(buscarChunk((parseInt(chunk.x)+1),chunk.y) != undefined){ //Corregir guadado de chunk
                        chunk = buscarChunk((parseInt(chunk.x)+1),chunk.y);
                    }else{
                        chunk.x++;
                        generarChunk();
                    }
                }
            }else if(e.key == "ArrowLeft" || e.key == "a" || e.key == "A"){
                Jugador.direccion = "izquierda";
                if(Jugador.y > 0 && (chunk.chunk[Jugador.x][Jugador.y-1] == 0 || chunk.chunk[Jugador.x][Jugador.y-1] == 5 || chunk.chunk[Jugador.x][Jugador.y-1] == 6)){
                    if((chunk.chunk[Jugador.x][Jugador.y-1] == 5 || chunk.chunk[Jugador.x][Jugador.y-1] == 6) && Jugador.inventario.length<Jugador.MAX_INVENTARIO){
                        Jugador.inventario.push(chunk.chunk[Jugador.x][Jugador.y-1]);
                        pintarInventario(Jugador);
                    }else if(Jugador.inventario.length == Jugador.MAX_INVENTARIO){
                        chunk.chunk[Jugador.x][Jugador.y] = chunk.chunk[Jugador.x][Jugador.y-1]
                    }
                    Jugador.y--;
                }else if(Jugador.y <= 0){
                    Jugador.y = MAX_MAP_SIZE-1; 
                    guardarChunk(chunk);    
                    if(buscarChunk(chunk.x,(parseInt(chunk.y)-1)) != undefined){ //Corregir guadado de chunk
                        chunk = buscarChunk(chunk.x,(parseInt(chunk.y)-1));
                    }else{
                        chunk.y--;
                        generarChunk();
                    }
                }
            }else if(e.key == "ArrowRight" || e.key == "d" || e.key == "D"){
                Jugador.direccion = "derecha";
                if(Jugador.y < MAX_MAP_SIZE-1 && (chunk.chunk[Jugador.x][Jugador.y+1] == 0 || chunk.chunk[Jugador.x][Jugador.y+1] == 5 || chunk.chunk[Jugador.x][Jugador.y+1] == 6)){
                    if((chunk.chunk[Jugador.x][Jugador.y+1] == 5 || chunk.chunk[Jugador.x][Jugador.y+1] == 6) && Jugador.inventario.length<Jugador.MAX_INVENTARIO){
                        Jugador.inventario.push(chunk.chunk[Jugador.x][Jugador.y+1]);
                        pintarInventario(Jugador);
                    }else if(Jugador.inventario.length == Jugador.MAX_INVENTARIO){
                        chunk.chunk[Jugador.x][Jugador.y] = chunk.chunk[Jugador.x][Jugador.y+1]
                    }
                    Jugador.y++;
                }else if(Jugador.y >= MAX_MAP_SIZE-1){
                    Jugador.y = 0;
                    guardarChunk(chunk);
                    if(buscarChunk(chunk.x,(parseInt(chunk.y)+1)) != undefined){
                        chunk = buscarChunk(chunk.x,(parseInt(chunk.y)+1));
                    }else{
                        chunk.y++;
                        generarChunk();
                    }
                }
            }else if(e.key == "e" || e.key == "E"){ 
                switch(Jugador.direccion){
                    case "arriba":
                        if(Jugador.x > 0 && chunk.chunk[Jugador.x-1][Jugador.y] == 2){
                            let contenido = chunk.cajas.find(c => c.x === Jugador.x-1 && c.y === Jugador.y).contenido
                            chunk.chunk[Jugador.x-1][Jugador.y] = contenido != null ? chunk.chunk[Jugador.x-1][Jugador.y] = contenido : 0; //Colocacion de la caja
                            chunk.cajas.splice(chunk.cajas.findIndex(c => c.x === Jugador.x-1 && c.y === Jugador.y),1); //Eliminar caja
                        }
                    break;
                    case "abajo":
                        if(Jugador.x < MAX_MAP_SIZE-1 && chunk.chunk[Jugador.x+1][Jugador.y] == 2){
                            let contenido = chunk.cajas.find(c => c.x === Jugador.x+1 && c.y === Jugador.y).contenido
                            chunk.chunk[Jugador.x+1][Jugador.y] = contenido != null ? chunk.chunk[Jugador.x+1][Jugador.y] = contenido : 0; //Colocacion de la caja
                            chunk.cajas.splice(chunk.cajas.findIndex(c => c.x === Jugador.x+1 && c.y === Jugador.y),1); //Eliminar caja
                        }
                    break;
                    case "izquierda":
                        if(Jugador.y > 0 && chunk.chunk[Jugador.x][Jugador.y-1] == 2){
                            let contenido = chunk.cajas.find(c => c.x === Jugador.x && c.y === Jugador.y-1).contenido
                            chunk.chunk[Jugador.x][Jugador.y-1] = contenido != null ? chunk.chunk[Jugador.x][Jugador.y-1] = contenido : 0; //Colocacion de la caja
                            chunk.cajas.splice(chunk.cajas.findIndex(c => c.x === Jugador.x && c.y === Jugador.y-1),1); //Eliminar caja
                        }
                    break;
                    case "derecha":
                        if(Jugador.y < MAX_MAP_SIZE-1 && chunk.chunk[Jugador.x][Jugador.y+1] == 2){
                            let contenido = chunk.cajas.find(c => c.x === Jugador.x && c.y === Jugador.y+1).contenido
                            chunk.chunk[Jugador.x][Jugador.y+1] = contenido != null ? chunk.chunk[Jugador.x][Jugador.y+1] = contenido : 0; //Colocacion de la caja
                            chunk.cajas.splice(chunk.cajas.findIndex(c => c.x === Jugador.x && c.y === Jugador.y+1),1); //Eliminar caja
                        }
                    break;
                    default:
                        console.error("Direccion no valida");
                        Jugador.direccion = "arriba"; //Reiniciar direccion
                }
            }else if(e.key == "1" || e.key == "2" || e.key == "3" || e.key == "4" || e.key == "5"){
                if(Jugador.inventario.length >= parseInt(e.key)-1 && Jugador.inventario[parseInt(e.key)-1] == 5){
                    Jugador.comida += 10; //Aumentar comida
                    if(Jugador.comida > 100){
                        Jugador.comida = 100; //Limitar comida a 100
                    }
                    Jugador.inventario.splice(parseInt(e.key)-1,1); //Eliminar comida del inventario
                    pintarInventario(Jugador);
                }
            }
            chunk.chunk[Jugador.x][Jugador.y] = 1;
        }
    })
    
    /**
     * Funcion que controla a 1 enemigo
     * para añadir más enemigos, se duplica la funcion
     */
    function enemigo(){
        let enemigo = {
            x: 0,
            y: 0,
            direccion: "abajo" //arriba, abajo, izquierda, derecha
        }
        //Posicion inicial del enemigo
        enemigo.x = Math.floor(Math.random() * MAX_MAP_SIZE);
        enemigo.y = Math.floor(Math.random() * MAX_MAP_SIZE);
        chunk.chunk[enemigo.x][enemigo.y] = 4; //Colocacion del enemigo

        setInterval(()=>{
            chunk.chunk[enemigo.x][enemigo.y] = 0; //Limpiar posicion anterior
            let movimiento = Math.floor(Math.random() * 4); //0 arriba, 1 abajo, 2 izquierda, 3 derecha
            switch(movimiento){
                case 0:
                    enemigo.direccion = "arriba";
                    if(enemigo.x > 0 && chunk.chunk[enemigo.x-1][enemigo.y] == 0){
                        enemigo.x--;
                    }else if(enemigo.x <= 0){
                        enemigo.x = MAX_MAP_SIZE-1;
                        if(buscarChunk((parseInt(chunk.x)-1),chunk.y) != undefined){ //Corregir guadado de chunk
                            chunk = buscarChunk((parseInt(chunk.x)-1),chunk.y);
                        }else{
                            chunk.x--;
                            generarChunk();
                        }
                    }
                break;
                case 1:
                    enemigo.direccion = "abajo";
                    if(enemigo.x < MAX_MAP_SIZE-1 && chunk.chunk[enemigo.x+1][enemigo.y] == 0){
                        enemigo.x++;
                    }else if(enemigo.x >= MAX_MAP_SIZE-1){
                        enemigo.x = 0;
                        if(buscarChunk((parseInt(chunk.x)+1),chunk.y) != undefined){ //Corregir guadado de chunk
                            chunk = buscarChunk(parseInt(chunk.x)+1,chunk.y);
                        }else{
                            chunk.x++;
                            generarChunk();
                        }
                    }
                break;
                case 2:
                    enemigo.direccion = "izquierda";
                    if(enemigo.y > 0 && chunk.chunk[enemigo.x][enemigo.y-1] == 0){
                        enemigo.y--;
                    }else if(enemigo.y <= 0){
                        enemigo.y = MAX_MAP_SIZE-1;              
                        if((buscarChunk(chunk.x,parseInt(chunk.y))) != undefined){ //Corregir guadado de chunk
                            chunk = buscarChunk(chunk.x,parseInt(chunk.y)-1);
                        }else{
                            chunk.y--;
                            generarChunk();
                        }
                    }
                break;
                case 3:
                    enemigo.direccion = "derecha";
                    if(enemigo.y < MAX_MAP_SIZE-1 && chunk.chunk[enemigo.x][enemigo.y+1] == 0){
                        enemigo.y++;
                    }else if(enemigo.y >= MAX_MAP_SIZE-1){
                        enemigo.y = 0;
                        if(buscarChunk(chunk.x,parseInt(chunk.y)+1) != undefined){
                            chunk = buscarChunk(chunk.x,parseInt(chunk.y)+1);
                        }else{
                            chunk.y++;
                            generarChunk();
                        }
                    }
                break;
                default:
                    console.error("Direccion no valida");
                    enemigo.direccion = "abajo"; //Reiniciar direccion
            }
            chunk.chunk[enemigo.x][enemigo.y] = 4; //Colocacion del enemigo
        }, TASA_ACTUALIZACION);
    }
    /**
     * Funcion para pintar el mapa
     * Solo acepta un chunk como entrada
     * @param {JSON} chunk
     * */
    function pintarMapa( chunk ){
        let pintar = document.querySelector("#mapa");
        pintar.innerHTML = "";
        chunk.chunk.forEach((celda) =>{
            celda.forEach((valor)=>{
                if(valor == 1){
                    pintar.innerHTML += `<div class="grid-cell player-${Jugador.direccion}"></div>`;
                }else if(valor  == 0){
                    pintar.innerHTML += `<div class="grid-cell"></div>`;
                }else if(valor == 2){
                    pintar.innerHTML += `<div class="grid-cell caja"></div>`;
                }else if(valor == 3){
                    pintar.innerHTML += `<div class="grid-cell agua"></div>`;
                }else if(valor == 4){
                    pintar.innerHTML += `<div class="grid-cell enemigo"></div>`;
                }else if(valor == 5){
                    pintar.innerHTML += `<div class="grid-cell comida"></div>`;
                }else if(valor == 6){
                    pintar.innerHTML += `<div class="grid-cell arma"></div>`;
                }
            })
        })
    }

    /**
     * Funcion para pintar el inventario del jugador
     * @param {JSON} jugador
     */
    function pintarInventario(jugador){
        let inventario = document.querySelector(".fila-cuadrados");
        inventario.innerHTML = "";
        jugador.inventario.forEach((item)=>{
            if(item == 5){
                inventario.innerHTML += `<div class="cuadrado comida"></div>`;
            }else if(item == 6){
                inventario.innerHTML += `<div class="cuadrado arma"></div>`;
            }else{
                inventario.innerHTML += `<div class="cuadrado"></div>`;
            }
        })
        if(jugador.inventario.length < jugador.MAX_INVENTARIO){
            for(let i = 0; i< jugador.MAX_INVENTARIO - jugador.inventario.length; i++){
                inventario.innerHTML += `<div class="cuadrado"></div>`;
            }
        }
    }

    //Bucle de comida
    setInterval(()=>{
        if(Jugador.comida > 0){
            Jugador.comida--;
            bararas[1].innerHTML = "";
            for(let j = 0; j < Jugador.comida; j++){
                bararas[1].innerHTML += `<div class="segmento-amarillo">`;
            }
            bararas[1].innerHTML += "&nbsp&nbsp"+Jugador.comida;
        }else if(Jugador.vida > 0){
            Jugador.vida -= 10;
            bararas[0].innerHTML = "";
            for(let j = 0; j < Jugador.vida; j++){
                bararas[0].innerHTML += `<div class="segmento-rojo">`;
            }
            bararas[0].innerHTML += "&nbsp&nbsp"+Jugador.vida;
        }
    },2000)

    //Bucle para recuperar vida
    setInterval(()=>{
        if(Jugador.comida>0 && Jugador.vida < 100){
            Jugador.vida++;
            if(Jugador.vida > 100){
                Jugador.vida = 100;
            }
            bararas[0].innerHTML = "";
            for(let j = 0; j < Jugador.vida; j++){
                bararas[0].innerHTML += `<div class="segmento-rojo">`;
            }
            bararas[0].innerHTML += "&nbsp&nbsp"+Jugador.vida;
        }else if(comida <= 0 && Jugador.vida < 100){
            Jugador.vida++;
            if(Jugador.vida > 100){
                Jugador.vida = 100;
            }
        }
    },1000)
    //Bucle del tiempo de partida
    setInterval(()=>{
        if(Jugador.vida > 0)
        {
            tiempoPartida++;
            let horas = Math.floor(tiempoPartida / 3600);
            let minutos = Math.floor((tiempoPartida % 3600) / 60);
            let segundos = tiempoPartida % 60;
            document.querySelector("h3").textContent = 
                `Tiempo: ${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
        }
    }, 1000);
    //Bucle de repeticion 
    setInterval(()=>{
        pintarMapa(chunk);
        //pintarInventario(Jugador);
    }, TASA_ACTUALIZACION);
})