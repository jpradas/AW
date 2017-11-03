class FlujoNumeros {
    constructor() {
        this.numeros = [6, 1, 4, 3, 10, 9, 8];
    }
    
    siguienteNumero(f) {
        setTimeout(() => {
          let result = this.numeros.shift();
          f(result);
        }, 100);
    }
}


/**
 * Imprime la suma de los dos primeros números del flujo pasado como parámetro.
 */
function sumaDosLog(flujo) {
    flujo.siguienteNumero(num => flujo.siguienteNumero(num2 => console.log(num + num2)));   
}
//sumaDosLog(new FlujoNumeros());
/**
 * Llama a la función f con la suma de los dos primeros números del flujo pasado como parámetro.
 */
function sumaDos(flujo, f) {
     //f(); 
     flujo.siguienteNumero(num => flujo.siguienteNumero(num2 => f(num + num2)));  
}
/*
sumaDos(new FlujoNumeros(), suma => {
console.log(`El resultado de la suma de los dos primeros números es ${suma}`);
});
*/
/**
 * Llama a la función f con la suma de todos los números del flujo pasado como parámetro
 */
function sumaTodo(flujo, f) {
   //console.log(flujo.siguienteNumero(num => aux(0,num)));
    aux(0,flujo,f);
}

 function aux (suma, flujo, f){
    flujo.siguienteNumero(num => {
            if (num !== undefined){
               aux (suma + num, flujo, f);  
            }
            else{
                f(suma);
            }
        }
    )
}
    

sumaTodo(new FlujoNumeros(), suma => {
    console.log(`El resultado de la suma de todos los números es ${suma}`);
});



/* NO MODIFICAR A PARTIR DE AQUÍ */

module.exports = {
    FlujoNumeros: FlujoNumeros,
    sumaDosLog: sumaDosLog,
    sumaDos: sumaDos,
    sumaTodo: sumaTodo
}