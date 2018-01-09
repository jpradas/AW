"use scrict"

/*require.config({
  // Directorio en el que se encuentran los scripts
  baseUrl: "scripts",
  partidas: "/scripts/partidas"
});*/

$(() =>{
    let name=null; let pass=null;

    $("#Aceptar").on("click", () =>{
      name = $("#name").prop("value");
      pass = $("#password").prop("value");

      if(name === "" || pass === ""){
        alert("El email y/o contraseña no pueden estar vacios");
        return;
      }

      $.ajax({
        type: "GET",
        url: "/checkUser",
        data: { user: name, password: pass },
        success: (data, textStatus, jqXHR) =>{
          if(!data.resultado){
            alert("El nombre o la contraseña son incorrectos");
          }else{
            iniciarPerfil();
          }
        },
        error: (jqXHR, textStatus, errorThrown) =>{
          alert("Se ha producido un error: " + errorThrown);
        }

      });
    });

    $("#Nuevo").on("click", () =>{
      name = $("#name").prop("value");
      pass = $("#password").prop("value");

      if(name === "" || pass === ""){
        alert("El email y/o contraseña no pueden estar vacios");
        return;
      }

      $.ajax({
        type: "GET",
        url: "/setUser",
        data: { user: name, password: pass },
        success: (data, textStatus, jqXHR) =>{
          if(data.resultado){
            alert("Se ha insertado correctamente el usuario");
            iniciarPerfil();
          }
        },
        error: (jqXHR, textStatus, errorThrown) =>{
          if(jqXHR.status === 400){
            alert(jqXHR.status + " - " + errorThrown + " : El usuario ya existe en base de datos");
          }else{
            alert("Se ha producido un error: " + errorThrown);
          }
        }

      });
    });

    function iniciarPerfil(){
      $(".cuerpo").hide();
      $("#usuario").text(name);
      $(".info-perfil").slideDown(500);
      getPartidas();
    }

    function getPartidas(){
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

    $("#crear-partida").on("click", () =>{
      //$("html").addClass("blur");
      $(".crear_partida").slideDown(500);
    });

    $("#aceptar-crear-partida").on("click", () =>{
      //TODO crear partida en bbdd - ya lo hago mañana xddd
      let nombre = $("#input-text").prop("value");
      let estado = $("#input-text-desc").prop("value");
      let cad64 = btoa(name + ":" + pass);

      $.ajax({
        type: "GET",
        url: "/crearPartida",
        beforeSend: (req) =>{
          req.setRequestHeader("Authorization", "Basic " + cad64);
        },
        data: { user: name, partida: nombre, estado: estado},
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

    function actualizarPartidas(){
      $("#lista-partidas li").remove();
      $(".partidas").hide();
      getPartidas();
    }

    $("#unirse-partida").on("click", () =>{
      $(".unirse_partida").slideDown(500);
/*
      */
      /*$("#buscador").animate({
            width: "toggle",
            opacity: "toggle"
        });*/
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
        let cad64 = btoa(name + ":" + pass);
        $.ajax({
          type: "GET",
          url: "/unirsePartida",
          beforeSend: (req) =>{
            req.setRequestHeader("Authorization", "Basic " + cad64);
          },
          data: { user: name, idPartida: id},
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
    })

    $("#desconectar").on("click", ()=>{ //TODO hace falta destruir la lista de partidas que hemos añadido a la lista en html
      $(".info-perfil").slideUp(500);
      $(".cuerpo").fadeIn(500);
      $(".partidas").hide();
      $(".crear_partida").hide();
      $(".unirse_partida").hide();
      $("#lista-partidas li").remove();
    });

    /*var item = $("#lista-partidas li");

    // agrego la clase blur a todos los 'ítem' que NO sea al que le se le esta aplicando el evento 'hover'
    item.hover(function() {
    item.not($(this)).addClass('blur');
    // al perder el foco, retiro la clase a todos los 'item'
    }, function() {
    item.removeClass('blur');
  });*/
});
