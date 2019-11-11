import * as Gb from './gbapi.js'

function createMessageCollapsable(mensaje) {
  const rid = 'x_' + Math.floor(Math.random()*1000000);
  const hid = 'h_'+rid;
  const cid = 'c_'+rid;
  
  const html = [
    '<div class="card">',
    '<div class="card-header" id="', hid, '">',
    '  <h2 class="mb-0">',
    '    <button class="btn btn-link" type="button"',
        ' data-toggle="collapse" data-target="#', cid, '"',
    '      aria-expanded="true" aria-controls="', rid, '">',
    '<b class="msg mtitle">', mensaje.title, '</b>',
    '<div class="msg mdate"> Enviado el ', 
    new Intl.DateTimeFormat('es-ES').format(mensaje.date),
    ' por ', mensaje.from,
    '</div>',
    '    </button>',
    '  </h2>',
    '</div>',
    '',
    '<div id="', cid, '" class="collapse show" aria-labelledby="', hid,'" ',
       'data-parent="#accordionExample">',
    '  <div class="card-body msg">',
    mensaje.body,
    '  </div>',
    '</div>',
    '</div>'
  ];
  return $(html.join(''));
}

function createGuardiansLine(student) {

  let responsables = [];
  student.guardians.forEach(gid => {
    const g = Gb.resolve(gid);
    responsables.push(g.first_name);
  });

const html = [
'<tr>',
'  <td>',
'    <label class="checkbox-inline">',
'      <input type="checkbox" id="st_' + student.sid + '" value="' + student.sid + '">',
'   </label>',
' </td>',
' <td>' + student.first_name + ', ' + student.last_name + '</td>',
' <td>' + student.cid  + '</td>',
' <td>' + responsables.join(", ") + '</td>',
' <td>',
'   <div class="btn-group" role="group" aria-label="options">',
'      <button type="button" class="btn btn-default b-resp-view">👁</button>',
'      <button type="button" class="btn btn-default b-resp-add">➕</button>',
'      <button type="button" class="btn btn-default b-resp-rm">➖</button>',
'      <button type="button" class="btn btn-default b-resp-msg">✉</button>',
'    </div>',
'  </td>',
'</tr>'
];
return $(html.join(''));
}


//
//
// Código de pegamento, ejecutado sólo una vez que la interfaz esté cargada.
// Generalmente de la forma $("selector").comportamiento(...)
//
//
$(function() { 
  
  // funcion de actualización de ejemplo. Llámala para refrescar interfaz
  function update(result) {
    try {
      // vaciamos un contenedor
      $("#accordionExample").empty();
      // y lo volvemos a rellenar con su nuevo contenido
      Gb.globalState.messages.forEach(m =>  $("#accordionExample").append(createMessageCollapsable(m)));      
      // y asi para cada cosa que pueda haber cambiado

      $("#gente>tbody").empty();
      // y lo volvemos a rellenar con su nuevo contenido
      Gb.globalState.students.forEach(s =>  $("#gente>tbody").append(createGuardiansLine(s)));      
      // y asi para cada cosa que pueda haber cambiado
    } catch (e) {
      console.log('Error actualizando', e);
    }
  }


  // expone Gb y update para que esté accesible desde la consola
  window.Gb = Gb;
  window.update = update;

  const U = Gb.Util;


  // genera datos de ejemplo
  let classIds = ["1A", "1B", "2A", "2B", "3A", "3B"];
  let userIds = [];
  classIds.forEach(cid => {
    let teacher = U.randomUser(Gb.UserRoles.TEACHER, [cid]);
    Gb.addUser(teacher);
    userIds.push(teacher.uid);

    let students = U.fill(U.randomInRange(15,20), () => U.randomStudent(cid));

    students.forEach(s => {
      Gb.addStudent(s);           

      let parents = U.fill(U.randomInRange(1,2), 
        () => U.randomUser(Gb.UserRoles.GUARDIAN, [cid], [s.sid]));
      parents.forEach( p => {
        s.guardians.push(p.uid);
        userIds.push(p.uid);
        Gb.addUser(p);
      });      
    });

    Gb.addClass(new Gb.EClass(cid, students.map(s => s.sid), [teacher.uid]));
  });
  Gb.addUser(U.randomUser(Gb.UserRoles.ADMIN));
  console.log(userIds);
  U.fill(30, () => U.randomMessage(userIds)).forEach( 
    m => Gb.send(m)
  );

  // muestra un mensaje de bienvenida
  console.log("online!", JSON.stringify(Gb.globalState, null, 2));
  update();

  $(".b-resp-rm").click(e => {
    const b = e.currentTarget;
    console.log("Aqui muestro un popup para elegir a quien eliminar");
  });
});
