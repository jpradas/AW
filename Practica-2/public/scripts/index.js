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
          console.log(textStatus);
          if(data.resultado){
            alert("Se ha insertado correctamente el usuario");
            iniciarPerfil();
          }
        },
        error: (jqXHR, textStatus, errorThrown) =>{
          alert("Se ha producido un error: " + errorThrown);
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
      console.log(name);
      $.ajax({
        type: "GET",
        url: "/getPartidas",
        data: { user: name},
        success: (data, textStatus, jqXHR) =>{
          console.log();
          let nuevoElem=null;
          data.partidas.forEach( partida => {
            nuevoElem = $(`<li>Partida ${partida.id} - ${partida.nombre}</li>`);
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
    })

    $("#cancelar-crear-partida").on("click", () =>{
      $(".crear_partida").slideUp(500);
    })

    $("#desconectar").on("click", ()=>{ //TODO hace falta destruir la lista de partidas que hemos añadido a la lista en html
      $(".info-perfil").slideUp(500);
      $(".cuerpo").fadeIn(500);
      $(".partidas").hide();
      $(".crear_partida").hide();
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
