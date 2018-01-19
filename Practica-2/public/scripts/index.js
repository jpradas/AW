"use scrict"

require.config({
  // Directorio en el que se encuentran los scripts
  baseUrl: "scripts",
});

define(["partidas"], (p) =>{

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
        type: "POST",
        url: "/setUser", //Deberiamos cambiar a PUT o POST
        data: JSON.stringify({ user: name, password: pass }),
        contentType: "application/json",
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
      p.actualizarPerfil(name, pass);
      p.getPartidas();
    }

  $("#desconectar").on("click", ()=>{ //TODO hace falta destruir la lista de partidas que hemos añadido a la lista en html
    $(".info-perfil").slideUp(500);
    $(".cuerpo").fadeIn(500);
    $(".partidas").hide();
    $(".crear_partida").hide();
    $(".unirse_partida").hide();
    $(".partida").hide();
    $("#lista-partidas li").remove();
    $("#jugadores li").remove();
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

});
