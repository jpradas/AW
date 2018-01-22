
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
      data: {user: user},
      success: (data, textStatus, jqXHR) =>{
        let nuevoElem=null;
        data.partidas.forEach( partida => {
          nuevoElem = $(`<li data-id=${partida.id}>Id: ${partida.id} - Nombre: ${partida.nombre} </li>`);
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
    getPartidas();
  }

  $("#aceptar-crear-partida").on("click", () =>{
    let nombre = $("#input-text").prop("value");
    if (nombre === ""){
      alert("No puede estar el nombre vacio");
    }
    else{
      let cad64 = btoa(user + ":" + contraseña);

      $.ajax({
        beforeSend: (req) =>{
          req.setRequestHeader("Authorization", "Basic " + cad64);
        },
        type: "POST",
        url: "/crearPartida",
        data: JSON.stringify({ user: user, partida: nombre}),
        contentType: "application/json",
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
    }
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
  }
  else if(isNaN(id)){
    alert("el id introducido no es válido. Debe ser un número.");
  }
  else{
    let cad64 = btoa(user + ":" + contraseña);
    $.ajax({
      type: "PUT",
      url: "/unirsePartida",
      beforeSend: (req) =>{
        req.setRequestHeader("Authorization", "Basic " + cad64);
      },
      contentType: "application/json",
      data: JSON.stringify({ user: user, idPartida: id }),
      success: (data, textStatus, jqXHR) =>{
        if(data.resultado){
          $("#input-text-id-partida").val("");
          $(".unirse_partida").slideUp(500);

          if (data.jugadores === 4){
            //Comienza la partida
            iniciarPartida(id);
          }
          else {
            actualizarPartidas();
          }

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
        }
        else if(jqXHR.status === 405){
          alert(jqXHR.status + " - " + errorThrown + ": Ya estas dentro de la partida");
        }
        else{
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
  $("#actualizarPartida").data("id", id);
  estadoPartida(id);
});

$("#cancelar-buscar-partida").on("click", () =>{
  $(".buscar_partida").slideUp(500);
  $("#buscar-text-id-partida").val("");
});

$("#aceptar-buscar-partida").on("click", () =>{
  let id = $("#buscar-text-id-partida").val();

  if(id === ""){
    alert("El id de partida a buscar no puede estar vacio");
  }
  else if(isNaN(id)){
    alert("el id introducido no es válido. Debe ser un número.");
  }
  else{
    $("#actualizarPartida").data("id", id);
    estadoPartida(id);
  }
});

function actualizarPartida(id){
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
        $("#jugadores li").remove();
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

$("#volverAtras").on("click", (event) =>{
  $(".partida").hide();
  actualizarPartidas();
});

$("#actualizarPartida").on("click", (event) =>{
  //actualizarPartida($(event.target).data().id);
  estadoPartida($(event.target).data().id);
});

function iniciarPartida(id){
  let cad64 = btoa(user + ":" + contraseña);

  $.ajax({
    type: "POST",
    url: "/iniciarPartida",
    beforeSend: (req) =>{
      req.setRequestHeader("Authorization", "Basic " + cad64);
    },
    contentType: "application/json",
    data: JSON.stringify({ user: user, idPartida: id }),
    success: (data, textStatus, jqXHR) =>{

        //$(".buscar_partida").slideUp(500);

        mostrarPartida(data.id, data.nombre, data.estado);
        //data.estado;
        /*
        $("#jugadores li").remove();
        data.jugadores.forEach(jugador =>{
          $("#jugadores").append(`<li> ${jugador.login} </li>`);
        });
        $("#buscar-text-id-partida").val("");
        */

    },
    error: (jqXHR, textStatus, errorThrown) =>{
      if(jqXHR.status === 404){
        alert(jqXHR.status + " - " + errorThrown + ": Fallo al iniciar la partida");
      }else{
        alert("Se ha producido un error: " + errorThrown);
      }
    }
  })
}

function estadoPartida(id){
  let cad64 = btoa(user + ":" + contraseña);

  $.ajax({
    type: "GET",
    url: "/estadoPartida",
    beforeSend: (req) =>{
      req.setRequestHeader("Authorization", "Basic " + cad64);
    },
    data: {idPartida: id},
    success: (data, textStatus, jqXHR) =>{
      //Partida no iniciada
      if (data.partida.estado === null){
        actualizarPartida(id);
      }
      else {

        $("#tusCartas img").remove();
        let estado = JSON.parse(data.partida.estado);
        mostrarPartida(data.partida.id, data.partida.nombre, estado);

        //$(".buscar_partida").slideUp(500);
        //data.estado.turnoJugador
      }
    },
    error: (jqXHR, textStatus, errorThrown) =>{
      if(jqXHR.status === 404){
        alert(jqXHR.status + " - " + errorThrown + ": Fallo en el estado de la partida");
      }else{
        alert("Se ha producido un error: " + errorThrown);
      }
    }
  });
}

function actualizarEstado(id, estado){
  let cad64 = btoa(user + ":" + contraseña);

  $.ajax({
    type: "PUT",
    url: "/realizarAccion",
    beforeSend: (req) =>{
      req.setRequestHeader("Authorization", "Basic " + cad64);
    },
    contentType: "application/json",
    data: JSON.stringify({ idPartida: id, estado: estado }),
    success: (data, textStatus, jqXHR) =>{
      if (data.terminado === undefined){

      }
      //Partida terminada
      else {

      }
    },
    error: (jqXHR, textStatus, errorThrown) =>{
      if(jqXHR.status === 404){
        alert(jqXHR.status + " - " + errorThrown + ": Fallo al actualizar la partida");
      }else{
        alert("Se ha producido un error: " + errorThrown);
      }
    }
  });
}

function obtenerCartasJugador(estado){
  switch (user) {
    case estado.jugador1: return estado.cartasJugador1;
    case estado.jugador2: return estado.cartasJugador2;
    case estado.jugador3: return estado.cartasJugador3;
    case estado.jugador4: return estado.cartasJugador4;
    default: alert("Error en el usuario " + user + " al obtener el estado");
  }
}

function mostrarPartida(id, nombre, estado){
  $(".partidas").hide();
  $(".partida").fadeIn(500);
  $(".mesa table tr").remove();
  $("#jugadores span").text(`Partida ${id} - ${nombre}`);

  let cartas = obtenerCartasJugador(estado);
  cartas.forEach(carta =>{
    $("#tusCartas").append(`<img src="imagenes/${carta.Valor}_${carta.Palo}.png" class="carta">`)
  });

  //Hay que hacerlo bien, no esta correcto
  estado.valorCartasMesa.forEach(carta =>{
    $(".tablero").append(`<img src="imagenes/traseraCarta.jpg" class="trasera">`);
  })

  $(".mesa table").append("<tr> <th>Nombre</th>  <th>Nº Cartas</th> </tr>");
  $(".mesa table").append(`<tr><td>${estado.jugador1}</td> <td>${estado.cartasJugador1.length}</td> </tr>`);
  $(".mesa table").append(`<tr><td>${estado.jugador2}</td> <td>${estado.cartasJugador2.length}</td> </tr>`);
  $(".mesa table").append(`<tr><td>${estado.jugador3}</td> <td>${estado.cartasJugador3.length}</td> </tr>`);
  $(".mesa table").append(`<tr><td>${estado.jugador4}</td> <td>${estado.cartasJugador4.length}</td> </tr>`);
}

  return {
    getPartidas: getPartidas,
    actualizarPartidas: actualizarPartidas,
    actualizarPerfil: actualizarPerfil
  };

})
