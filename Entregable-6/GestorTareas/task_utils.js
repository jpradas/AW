/**
* A partir de un texto seguido de una serie de etiquetas de la forma
* @tag1, @tag2, etc., extrae las etiquetas, creando un objeto tarea
* como resultado.
*
* El objeto devuelto contiene dos atributos:
* - tags: un array con las etiquetas de la tarea.
* - text: la cadena de texto de entrada sin las etiquetas.
*
* @param {string} text Texto de la tarea, incluyendo etiquetas
*/
function createTask(text) {

  let patron = /@([\w+.-]+)/gi;
  let result = text.match(patron);
  if (result !== null){
    for (let i=0;  i < result.length ; i++){
      result[i] = result[i].replace(/@/,"");
      result[i].trim();
    }
  }
  else {
    result = [];
  }

  let nuevo = text.replace(patron, "");
  nuevo = nuevo.trim();

  return {text:nuevo, tags:result};
}





module.exports = {
    createTask: createTask
}
