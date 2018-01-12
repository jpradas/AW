
define([], () =>{

  function getPartidas(name){
    $.ajax({
      type: "GET",
      url: "/getPartidas",
      data: { user: name},
      success: (data, textStatus, jqXHR) =>{
        let nuevoElem=null;
        data.partidas.forEach( partida => {
          nuevoElem = $(`<li data-id=${partida.id}>Id: ${partida.id} - Nombre: ${partida.nombre} - Estado: ${partida.estado}</li>`);
          $("#lista-partidas").append(nuevoElem);
        });
        $(".partidas").fadeIn(500);
      },
      error: (jqXHR, textStatus, errorThrown) =>{
        alert("Se ha producido un error: " + errorThrown);
      }

    });
  }

  return {
    getPartidas: getPartidas
  };

})
