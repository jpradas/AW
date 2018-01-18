
define([], () =>{

  let user=null; let contraseña=null;

  function actualizarPerfil(name, pass){
    user=name;
    contraseña=pass;
  }

  function getPartidas(){
    $.ajax({
      type: "GET",
      url: "/getPartidas",
      data: { user: user},
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

  $("#crear-partida").on("click", () =>{
    //$("html").addClass("blur");
    $(".crear_partida").slideDown(500);
  });

  function actualizarPartidas(){
    $("#lista-partidas li").remove();
    $(".partidas").hide();
    getPartidas(user);
  }

  $("#aceptar-crear-partida").on("click", () =>{
    let nombre = $("#input-text").prop("value");
    let estado = $("#input-text-desc").prop("value");
    let cad64 = btoa(user + ":" + contraseña);

    $.ajax({
      type: "GET",
      url: "/crearPartida", //Deberiamos cambiarlo a POST
      beforeSend: (req) =>{
        req.setRequestHeader("Authorization", "Basic " + cad64);
      },
      data: { user: user, partida: nombre, estado: estado},
      success: (data, textStatus, jqXHR) =>{
        if(data.resultado){
          $(".crear_partida").slideUp(500);
          actualizarPartidas();
          $("#input-text").val("");
          $("#input-text-desc").val("");
        }else{
          alert("No se ha podido crear la partida. Intente de nuevo");
        }
      },
      error: (jqXHR, textStatus, errorThrown) =>{
        alert("Se ha producido un error: " + errorThrown);
      }

    });
  });

  $("#cancelar-crear-partida").on("click", () =>{
    $(".crear_partida").slideUp(500);
  })

  $("#unirse-partida").on("click", () =>{
    $(".unirse_partida").slideDown(500);
  });

$("#cancelar-unirse-partida").on("click", () =>{
  $(".unirse_partida").slideUp(500);
  $("#input-text-id-partida").val("");
});

$("#aceptar-unirse-partida").on("click", () =>{
  let id = $("#input-text-id-partida").prop("value");
  if(id === ""){
    alert("El id de partida a unirse no puede estar vacio");
  }else{
    let cad64 = btoa(user + ":" + contraseña);
    $.ajax({
      type: "GET", //Deberiamos cambiarlo a PUT
      url: "/unirsePartida",
      beforeSend: (req) =>{
        req.setRequestHeader("Authorization", "Basic " + cad64);
      },
      data: { user: user, idPartida: id},
      success: (data, textStatus, jqXHR) =>{
        if(data.resultado){
          actualizarPartidas();
          $("#input-text-id-partida").val("");
          $(".unirse_partida").slideUp(500);
        }else{
          alert("No se ha podido unir a la partida. Vuelve a intentarlo");
        }
      },
      error: (jqXHR, textStatus, errorThrown) =>{
        if(jqXHR.status === 404){
          alert(jqXHR.status + " - " + errorThrown + ": No existe la partida introducida");
        }
        else if(jqXHR.status === 400){
          alert(jqXHR.status + " - " + errorThrown + ": La partida esta llena y ya no se puede unir nadie mas");
        }else{
          alert("Se ha producido un error: " + errorThrown);
        }
      }

    });
  }
});

$("#buscar-partida").on("click", () =>{
  $(".buscar_partida").slideDown(500);
});

$("#lista-partidas").on("click", "li", (event) =>{
  let id = $(event.target).data().id;
  console.log(id);
});

$("#cancelar-buscar-partida").on("click", () =>{
  $(".buscar_partida").slideUp(500);
  $("#buscar-text-id-partida").val("");
});

$("#aceptar-buscar-partida").on("click", () =>{
  let id = $("#buscar-text-id-partida").val();
  console.log(id);

  if(id === ""){
    alert("El id de partida a buscar no puede estar vacio");
  }else{
    let cad64 = btoa(user + ":" + contraseña);

    $.ajax({
      type: "GET",
      url: "/buscarPartida",
      beforeSend: (req) =>{
        req.setRequestHeader("Authorization", "Basic " + cad64);
      },
      data: {idPartida: id},
      success: (data, textStatus, jqXHR) =>{
          $(".partidas").hide();
          $(".partida").fadeIn(500);
          $("#jugadores span").text(`Partida ${data.partida.id} - ${data.partida.nombre}`);
          data.jugadores.forEach(jugador =>{
            $("#jugadores").append(`<li> ${jugador.login} </li>`);
          });
          $(".buscar_partida").slideUp(500);
          $("#buscar-text-id-partida").val("");
      },
      error: (jqXHR, textStatus, errorThrown) =>{
        if(jqXHR.status === 404){
          alert(jqXHR.status + " - " + errorThrown + ": No existe la partida introducida");
        }else{
          alert("Se ha producido un error: " + errorThrown);
        }
      }
    });
  }

})

  return {
    getPartidas: getPartidas,
    actualizarPartidas: actualizarPartidas,
    actualizarPerfil: actualizarPerfil
  };

})
