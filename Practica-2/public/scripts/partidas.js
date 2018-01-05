"use strict"

define([], () =>{

  let partidas = function (user){
    $.ajax({
      type: "GET",
      url: "/getPartidas",
      data: {user: user},
      success: (data, textStatus, jqXHR) =>{
        let nuevoElem=null;
        data.forEach( partida => {
          nuevoElem = $(`<li>Partida ${partida.id} ${partida.nombre}</li>`);
          $("#lista-partidas").append(nuevoElem);
        })
      }
    })
  }

  return {
    partidas: partidas
  };

});
