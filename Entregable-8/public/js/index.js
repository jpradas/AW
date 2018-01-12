"use strict";

/*
 * Manejador que se ejecuta cuando el DOM se haya cargado.
 */
$(() => {
    // Solicita al servidor la lista de tareas, y la muestra en la página
    loadTasks();

    // Cuando se pulse alguno de los botones 'Eliminar', se llamará a
    // la función onRemoveButtonClick
    $("div.tasks").on("click", "button.remove", onRemoveButtonClick);

    // Cuando se pulse el botón de 'Añadir', se llamará a la función
    // onAddButtonClick
    $("div.tasks").on("click", "button.add", onAddButtonClick);
});

/*
 * Convierte una tarea en un elemento DOM.
 *
 * @param {task} Tarea a convertir. Debe ser un objeto con dos atributos: id y text.
 * @return Selección jQuery con el elemento del DOM creado
 */
function taskToDOMElement(task) {
    let result = $("<li>").addClass("task");
    result.append($("<span>").text(task.text));
    result.append($("<button>").addClass("remove").text("Eliminar"));
    result.data("id", task.id);
    return result;
}

function loadTasks() {
  $.ajax({
    //method: "GET",
    type: "GET",
    url: "/tasks/",
    // En caso de éxito, colocamos el texto con el resultado
    // en el documento HTML
    success: function (data, textStatus, jqXHR) {
	  let s=$("div.tasks > ul");
      data.forEach(task => {
        //Corregir el prepend por algo mejor, before no funciona
        s.append(taskToDOMElement(task));
      });

	  let n = $(".newTask");
	  $(".newTask").remove();
	  s.append(n);
    },
    // En caso de error, mostramos el error producido
    error: function (jqXHR, textStatus, errorThrown) {
      alert("Se ha producido un error: " + errorThrown);
    }
    });

}

function onRemoveButtonClick(event) {
    // Obtenemos el botón 'Eliminar' sobre el que se ha
    // hecho clic.
    let selected = $(event.target);

    // Obtenemos el elemento <li> que contiene el botón
    // pulsado.
    let liPadre = selected.parent();
    let id = liPadre.data("id");
    // Implementar el resto del método aquí.
    // ...
    $.ajax({
      //method: "GET",
      type: "DELETE",
      url: "/tasks/" + id,
      // En caso de éxito, colocamos el texto con el resultado
      // en el documento HTML
      success: function (data, textStatus, jqXHR) {
        liPadre.hide();
      },
      // En caso de error, mostramos el error producido
      error: function (jqXHR, textStatus, errorThrown) {
        alert("Se ha producido un error: " + errorThrown);
      }
      });
}

function onAddButtonClick(event) {
  // Obtenemos el valor contenido en el cuadro de texto
  var valor = $("#taskText").val();
  // Realizamos la petición al servidor
  $.ajax({
  type: "POST",
  url: "/tasks/",
  contentType: "application/json",
  data: JSON.stringify({ text: valor }),
  // En caso de éxito, colocamos el texto con el resultado
  // en el documento HTML
  success: function (data, textStatus, jqXHR) {
    $("div.tasks > ul").prepend(taskToDOMElement(data));
  },
  // En caso de error, mostramos el error producido
  error: function (jqXHR, textStatus, errorThrown) {
    alert("Se ha producido un error: " + errorThrown);
  }
  });
}
