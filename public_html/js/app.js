
 //Sistema de Gestión de Quehaceres Domésticos
 //Taller 4 - Programación Avanzada
 // API REST: http://localhost:8081/api/actividades


const API_URL = 'http://localhost:8081/api/actividades';

async function cargarActividades() {
    const tbody = document.getElementById('tabla-body');
    const vacio = document.getElementById('mensaje-vacio');
    try {
        const res = await fetch(API_URL);
        const actividades = await res.json();
        if (actividades.length === 0) {
            tbody.innerHTML = '';
            vacio.style.display = 'block';
            return;
        }
        vacio.style.display = 'none';
        tbody.innerHTML = actividades.map(a => `
            <tr>
                <td>${a.id}</td><td>${a.titulo}</td>
                <td><span class="${getBadge(a.tipoActividad)}">${a.tipoActividad}</span></td>
                <td>${a.fechaInicio}</td><td>${a.fechaTerminacion}</td>
                <td>${a.idQuehacer}</td><td>${a.idTutor}</td><td>${a.idHijo}</td>
                <td>
                    <button class="btn btn-info" style="padding:6px 12px;font-size:0.8em;" onclick="modificarAct(${a.id})">Editar</button>
                    <button class="btn btn-danger" style="padding:6px 12px;font-size:0.8em;" onclick="eliminarAct(${a.id},'${a.titulo}')">Eliminar</button>
                </td>
            </tr>`).join('');
    } catch (e) {
        tbody.innerHTML = '<tr><td colspan="9" style="color:red;">⚠️ Error de conexión. ¿Backend corriendo en puerto 8081?</td></tr>';
    }
}

function getBadge(tipo) {
    const map = {'Fisica': 'badge-fisica', 'Acompanamiento': 'badge-acompanamiento', 'Supervision': 'badge-supervision', 'Creativa': 'badge-creativa'};
    return `badge ${map[tipo] || ''}`;
}

async function crearActividad(e) {
    e.preventDefault();
    const act = {
        titulo: document.getElementById('titulo').value,
        descripcion: document.getElementById('descripcion').value,
        fechaInicio: document.getElementById('fechaInicio').value,
        fechaTerminacion: document.getElementById('fechaTerminacion').value,
        tipoActividad: document.getElementById('tipoActividad').value,
        idQuehacer: parseInt(document.getElementById('idQuehacer').value),
        idTutor: parseInt(document.getElementById('idTutor').value),
        idHijo: parseInt(document.getElementById('idHijo').value)
    };
    try {
        const res = await fetch(API_URL, {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(act)});
        const msg = document.getElementById('mensaje');
        if (res.ok) {
            msg.className = 'mensaje mensaje-exito';
            msg.textContent = '✅ Actividad creada exitosamente';
            document.getElementById('form-actividad').reset();
        } else {
            msg.className = 'mensaje mensaje-error';
            msg.textContent = '❌ Error al crear';
        }
    } catch (e) {
        const msg = document.getElementById('mensaje');
        msg.className = 'mensaje mensaje-error';
        msg.textContent = '❌ Sin conexión con el servidor';
    }
}

function modificarAct(id) {
    fetch(`${API_URL}/${id}`).then(r => r.json()).then(a => {
        localStorage.setItem('actModificar', JSON.stringify(a));
        window.location.href = 'modificar.html';
    });
}

function cargarDatosModificacion() {
    const d = localStorage.getItem('actModificar');
    if (!d) {
        document.getElementById('form-modificar').innerHTML = '<p class="mensaje mensaje-error">Seleccione una actividad desde Consultar.</p>';
        return;
    }
    const a = JSON.parse(d);
    document.getElementById('id').value = a.id;
    document.getElementById('titulo').value = a.titulo;
    document.getElementById('descripcion').value = a.descripcion;
    document.getElementById('fechaInicio').value = a.fechaInicio;
    document.getElementById('fechaTerminacion').value = a.fechaTerminacion;
    document.getElementById('tipoActividad').value = a.tipoActividad;
    document.getElementById('idQuehacer').value = a.idQuehacer;
    document.getElementById('idTutor').value = a.idTutor;
    document.getElementById('idHijo').value = a.idHijo;
}

async function modificarActividad(e) {
    e.preventDefault();
    const id = document.getElementById('id').value;
    const act = {
        titulo: document.getElementById('titulo').value,
        descripcion: document.getElementById('descripcion').value,
        fechaInicio: document.getElementById('fechaInicio').value,
        fechaTerminacion: document.getElementById('fechaTerminacion').value,
        tipoActividad: document.getElementById('tipoActividad').value,
        idQuehacer: parseInt(document.getElementById('idQuehacer').value),
        idTutor: parseInt(document.getElementById('idTutor').value),
        idHijo: parseInt(document.getElementById('idHijo').value)
    };
    const res = await fetch(`${API_URL}/${id}`, {method: 'PUT', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(act)});
    const msg = document.getElementById('mensaje');
    if (res.ok) {
        msg.className = 'mensaje mensaje-exito';
        msg.textContent = '✅ Modificado. Redirigiendo...';
        localStorage.removeItem('actModificar');
        setTimeout(() => window.location.href = 'consultar.html', 1500);
    } else {
        msg.className = 'mensaje mensaje-error';
        msg.textContent = '❌ Error al modificar';
    }
}

function eliminarAct(id, titulo) {
    localStorage.setItem('actEliminar', JSON.stringify({id, titulo}));
    window.location.href = 'eliminar.html';
}

function cargarDatosEliminacion() {
    const d = localStorage.getItem('actEliminar');
    if (!d) {
        document.getElementById('confirm-box').innerHTML = '<p class="mensaje mensaje-error">Seleccione una actividad desde Consultar.</p>';
        return;
    }
    const a = JSON.parse(d);
    document.getElementById('actividad-id').textContent = a.id;
    document.getElementById('actividad-titulo').textContent = a.titulo;
}

async function eliminarActividad() {
    const d = localStorage.getItem('actEliminar');
    if (!d)
        return;
    const a = JSON.parse(d);
    const res = await fetch(`${API_URL}/${a.id}`, {method: 'DELETE'});
    if (res.ok || res.status === 204) {
        localStorage.removeItem('actEliminar');
        document.getElementById('confirm-box').innerHTML = `<h3>✅ Eliminado</h3><p>"${a.titulo}" eliminada.</p><a href="consultar.html" class="btn btn-primary">Volver</a>`;
    } else {
        alert('Error al eliminar');
    }
}