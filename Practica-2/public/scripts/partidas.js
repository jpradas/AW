
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

  $("#cancelarJugada").on("click", () =>{
    $(".decirCartas").hide();
    $(".boton").fadeIn(500);
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
    actualizarPartida(id);
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
        $(".mano").hide();
        $(".mesa").hide();
        $(".partida").fadeIn(500);
        $("#jugadores span").text(`Partida ${data.partida.id} - ${data.partida.nombre}`);
        $("#jugadores li").remove();
        data.jugadores.forEach(jugador =>{
          $("#jugadores").append(`<li> ${jugador.login} </li>`);
        });
        $(".buscar_partida").slideUp(500);
        $("#buscar-text-id-partida").val("");
        $("#mensajeFinal").remove();
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


        mostrarPartida(data.id, data.nombre, data.estado);
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
    data: {idPartida: id, user: user},
    success: (data, textStatus, jqXHR) =>{
      //Partida no iniciada
      if (data.partida.estado === ""){
        actualizarPartida(id);
      }
      else {
        let estado = data.partida.estado;
        if (estado.terminado === undefined){

          if (estado.valorCartasMesa.length > 0){
            let num = estado.valorCartasMesa.length;
            let indice = estado.valorCartasMesa.length;
            let carta = estado.valorCartasMesa[indice - 1];
            indice = estado.ordenJugadores.indexOf(estado.turnoJugador) - 1;
            if (indice === -1){
              indice = 3;
            }
            let jugadorAnterior = estado.ordenJugadores[indice];
            $(".mesa .info").remove();
            $(".mesa .info").append(`<span>${jugadorAnterior} dice que ha colocado ${num} "${carta}" en la mesa </span>`)
          }
          mostrarPartida(data.partida.id, data.partida.nombre, estado);
        }
        //La partida ha terminado
        else{
          mostrarPartidaTerminada(data.partida.id, data.partida.nombre, estado);
        }
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

function realizarAccion(id, accion){
  let cad64 = btoa(user + ":" + contraseña);

  $.ajax({
    type: "PUT",
    url: "/realizarAccion",
    beforeSend: (req) =>{
      req.setRequestHeader("Authorization", "Basic " + cad64);
    },
    contentType: "application/json",
    data: JSON.stringify({ idPartida: id, accion: accion, jugador: user}),
    success: (data, textStatus, jqXHR) =>{
      if (data.error !== undefined){
        alert(data.error);
      }
      //La accion se ha hecho correctamente
      else if (data.partida.estado.terminado === undefined){
        mostrarPartida(data.partida.id, data.partida.nombre, data.partida.estado);
        $(".mano .info").remove();
        $(".mano").append(`<div class="info">Turno realizado correctamente, turno de ${data.partida.estado.turnoJugador}</div>`);
      }
      //Partida terminada
      else {
        mostrarPartidaTerminada(data.partida.id, data.partida.nombre, data.partida.estado);
        alert("La partida ha acabado, tenemos un ganador");
      }
    },
    error: (jqXHR, textStatus, errorThrown) =>{
      if(jqXHR.status === 404){
        alert(jqXHR.status + " - " + errorThrown + ": Fallo al realizar la accion");
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

    $("#tusCartas img").remove();
    $(".trasera").remove();
    $(".decirCartas").hide();
    $(".partidas").hide();
    $(".mesa").show();
    $(".partida").fadeIn(500);
    $(".jugadores div").remove();
    $("#jugadores span").text(`Partida ${id} - ${nombre}`);
    $(".mano .info").remove();
    $(".tablero .carta").remove();
    $(".partida #mensajeFinal").remove();
    $("#mentiroso").data("mentiroso", estado.mentiroso);
    $("#mentiroso").data("cartasMesa", estado.valorCartasMesa);
    $("#jugadores li").remove();
    $("#actualizarPartida").data("id", id);
    if (estado.valorCartasMesa.length > 0){
      $("#jugarCartas").data("ultimoValor", estado.valorCartasMesa[estado.valorCartasMesa.length - 1]);
    }
    else{
      $("#jugarCartas").data("ultimoValor", 0);
    }

    let cartas = obtenerCartasJugador(estado);
    cartas.forEach(carta =>{
      $("#tusCartas").append(`<img data-valor=${carta.valor} data-palo=${carta.palo} data-click=0 src="imagenes/${carta.valor}_${carta.palo}.png" class="carta">`);
    });
    if (estado.turnoJugador === user){
      $(".mano .boton").show();
    }
    //Mostrar que no es su turno
    else {
      $(".mano .boton").hide();
      $(".mano ").append(`<div class="info">No es tu turno, turno de ${estado.turnoJugador}</div>`);
    }
    $(".mano").show();

    estado.valorCartasMesa.forEach(carta =>{
      $(".tablero").append(`<div class="trasera" style="background-image: url(imagenes/traseraCarta.jpg)">${carta}</div>`);
    })

    mostrarTablaJugadores(estado);
  }

  function mostrarTablaJugadores(estado){
    if (isNaN(estado.cartasJugador1)){
      $(".jugadores").append(`<div class="jugador"> <span>${estado.jugador1}</span> <span class="margen">${estado.cartasJugador1.length}</span> </div>`);
    }
    else{
      $(".jugadores").append(`<div class="jugador"> <span>${estado.jugador1}</span> <span class="margen">${estado.cartasJugador1}</span> </div>`);
    }

    if (isNaN(estado.cartasJugador2)){
      $(".jugadores").append(`<div class="jugador"> <span>${estado.jugador2}</span> <span class="margen">${estado.cartasJugador2.length}</span> </div>`);
    }
    else{
      $(".jugadores").append(`<div class="jugador"> <span>${estado.jugador2}</span> <span class="margen">${estado.cartasJugador2}</span> </div>`);
    }

    if (isNaN(estado.cartasJugador3)){
      $(".jugadores").append(`<div class="jugador"> <span>${estado.jugador3}</span> <span class="margen">${estado.cartasJugador3.length}</span> </div>`);
    }
    else{
      $(".jugadores").append(`<div class="jugador"> <span>${estado.jugador3}</span> <span class="margen">${estado.cartasJugador3}</span> </div>`);
    }

    if (isNaN(estado.cartasJugador4)){
      $(".jugadores").append(`<div class="jugador"> <span>${estado.jugador4}</span> <span class="margen">${estado.cartasJugador4.length}</span> </div>`);
    }
    else{
      $(".jugadores").append(`<div class="jugador"> <span>${estado.jugador4}</span> <span class="margen">${estado.cartasJugador4}</span> </div>`);
    }

  }

  $("#tusCartas").on("click", "img", (event) =>{
    if ($(event.target).data("click") === 1){
      $(event.target).css("border", "none");
      $(event.target).data("click", 0);
    }
    else{
      $(event.target).css("border", "solid red");
      $(event.target).data("click", 1);
    }
  });

  function mostrarPartidaTerminada(id, nombre, estado){
    $(".partidas").hide();
    $(".mesa").hide();
    $(".mano").hide();
    $(".partida #mensajeFinal").remove();
    $("#jugadores li").remove();
    $("#actualizarPartida").data("id", id);
    $("#jugadores span").text(`Partida ${id} - ${nombre}`);
    $(".partida").append(`<div id="mensajeFinal">Ha ganado ${estado.ganador}, gracias por jugar</div>`);
    $(".partida").show();
  }

  $("#jugarCartas").on("click", () =>{

    if ($("#jugarCartas").data("ultimoValor") !== 0){
      realizarJugada($("#jugarCartas").data("ultimoValor"));
    }
    else {
      $(".boton").hide();
      $(".decirCartas").fadeIn(500);
    }

  });

  $("#mentiroso").on("click", (event) => {
    let mentiroso = $("#mentiroso").data().mentiroso;
    let cartasMesa = $("#mentiroso").data().cartasMesa;
    if (cartasMesa.length > 0){
      //Poner 5 seg de retardo para ver la mesa
      realizarAccion($("#actualizarPartida").data("id"), mentiroso);
    }
  })

  $("#hacerJugada").on("click", () =>{
    realizarJugada($("select option:selected").text());
  });

  function realizarJugada(valor){
    let cartas = [];
    $("#tusCartas img").each((index, carta) => {
      if ($(carta).data("click") === 1){
        let c = {palo: $(carta).attr("data-palo"),valor: $(carta).attr("data-valor")}
        cartas.push(c);
      }
    });

    if (cartas.length > 0){
      if (cartas.length < 4){
        cartas.push(valor);
        realizarAccion($("#actualizarPartida").data("id"), cartas);
      }
      else {
        alert("Has seleccionado " + cartas.length + " cartas, no puedes seleccionar mas de 3");
      }
    }
    else{
      alert("No has seleccionado ninguna carta");
    }
  }

  $("#descartar").on("click", () =>{
    let cartas = [];
    $("#tusCartas img").each((index, carta) => {
      if ($(carta).data("click") === 1){
        let c = {palo: $(carta).attr("data-palo"),valor: $(carta).attr("data-valor")}
        cartas.push(c);
      }
    });
    if (cartas.length === 4){
      if (cartas[0].valor === cartas[1].valor && cartas[1].valor === cartas[2].valor && cartas[2].valor === cartas[3].valor){
        //peticion ajax para quitar cartas
        quitarRepetidas($("#actualizarPartida").data("id"), cartas);
      }
      else{
        alert("Las cartas seleccionadas no tienen el mismo valor");
      }
    }
    else {
      alert("No has seleccionado 4 cartas");
    }
  })

  function quitarRepetidas(id, cartas){
    let cad64 = btoa(user + ":" + contraseña);

    $.ajax({
      type: "PUT",
      url: "/quitarRepetidas",
      beforeSend: (req) =>{
        req.setRequestHeader("Authorization", "Basic " + cad64);
      },
      contentType: "application/json",
      data: JSON.stringify({ idPartida: id, cartas: cartas, jugador: user}),
      success: (data, textStatus, jqXHR) =>{
        if (data.error === undefined){
          mostrarPartida(data.partida.id, data.partida.nombre, data.partida.estado);
        }else{
          alert(data.error);
        }
      },
      error: (jqXHR, textStatus, errorThrown) =>{
        if(jqXHR.status === 404){
          alert(jqXHR.status + " - " + errorThrown + ": Fallo al quitar las cartas");
        }else{
          alert("Se ha producido un error: " + errorThrown);
        }
      }
    });
  }

  return {
    getPartidas: getPartidas,
    actualizarPartidas: actualizarPartidas,
    actualizarPerfil: actualizarPerfil
  };

})
