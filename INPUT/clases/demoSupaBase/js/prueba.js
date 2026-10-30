document.getElementById('btn-traer').addEventListener('click', async () => {

  // "async" convierte esta función (el listener del clic) en una función
  // ASÍNCRONA: una función que PUEDE usar "await" adentro para esperar
  // algo que tarda, sin congelar el resto de la página mientras espera.
  //
  // Diferencia clave con localStorage (semana 7): localStorage.getItem()
  // y localStorage.setItem() son operaciones SINCRÓNICAS — ocurren al
  // instante, en tu propio computador, sin viajar a ningún lado. Por eso
  // nunca necesitaste "async"/"await" para leer o escribir en
  // localStorage. Una consulta a Supabase, en cambio, viaja por internet
  // hasta el servidor de Supabase y la respuesta tiene que volver — eso
  // toma un tiempo real (aunque sea poco), y JavaScript necesita una
  // forma explícita de decir "espera aquí a que llegue la respuesta".

  // "await" pausa la ejecución DE ESTA FUNCIÓN (no de toda la página)
  // hasta que la consulta a Supabase responda. Mientras tanto, el resto
  // de tu página sigue funcionando con normalidad — solo esta función
  // en particular se detiene en esta línea hasta tener respuesta real.
  const { data, error } = await db.from('productos_practica').select('*');

  // Sin "await" en la línea de arriba, "data" y "error" NO tendrían el
  // resultado todavía — tendrías una "Promise" (promesa) sin resolver,
  // no los datos reales. Eso es justo lo que "await" evita: te obliga
  // a esperar antes de seguir usando el resultado.
  console.log(data, error);

  if (error) {
    // Revisamos "error" ANTES de tocar "data": si la consulta falló,
    // "data" llega como null, y usar null más adelante (ej. null.map())
    // rompería el script. Mismo patrón de "validar antes de operar"
    // que ya usaste en el CRUD de la semana 7.
    document.getElementById('resultado').textContent = 'Error: ' + error.message;
    return;
  }

  // JSON.stringify(data, null, 2) convierte el array completo a texto,
  // con sangría (el "2") para que se lea ordenado. Esta línea SÍ es
  // sincrónica (no necesita await) — ya no estamos esperando nada de
  // Supabase, solo transformando el array "data" que ya llegó.
  document.getElementById('resultado').textContent = JSON.stringify(data, null, 2);

  const nombres = data.map(producto => producto.nombre);
  console.log ("Nombres de productos:", nombres);

  const precios = data.map( p => p.precio)
  console.log(precios);

  const unidades = data.map( u => u.unidades)
  console.log(unidades);

   document.getElementById('resultado2').innerHTML =
    '<ul>' + nombres.map(n => `<li>${n}</li>`).join('') + '</ul>';

   document.getElementById('precios').innerHTML =
    '<ul>' + precios.map(n => `<li>${n}</li>`).join('') + '</ul>';

   document.getElementById('unidades').innerHTML =
    '<ul>' + unidades.map(n => `<li>${n}</li>`).join('') + '</ul>';

}); // <- este cierre le faltaba: sin él, todo lo de abajo quedaba
    // atrapado dentro del listener de "btn-traer" en vez de ser
    // código independiente (la función y el segundo botón)

async function agregarProducto(datos) {

  const { data, error } = await db
    .from('productos_practica')  // la tabla
    .insert([datos])             // insert() siempre recibe un ARRAY de objetos,
                                  // aunque insertes uno solo
    .select();                    // .select() le pide a Supabase que te
                                   // devuelva la fila ya creada (con su id
                                   // nuevo) — sin esto, insert() no te
                                   // devuelve nada útil

  if (error) {
    console.log("Error al agregar:", error);
    return null;
  }

  return data[0];   // data siempre es un array — tomamos el primer
                     // elemento, que es la fila recién creada
}

const productoNuevo ={
  nombre: 'reloj de arena',
  descripcion: 'producto de prueba xd',
  precio: 30000,
  descuento: 0.2,
  disponible: false,
  unidades: 78,
  categorias: ["decoracion", "ambiente"],
  image_url: "https://thumbs.dreamstime.com/z/reloj-de-arena-con-colores-en-una-playa-durante-el-atardecer-414853996.jpg?ct=jpeg"
}
    
document.getElementById('btn-agregar-obj').addEventListener('click', async () => {
const respuesta = await agregarProducto(productoNuevo);
  if (respuesta) {
    document.getElementById('notificacion').innerHTML = 'producto agregado con ID: ' + respuesta.id;
  } else {
    document.getElementById('notificacion').innerHTML = 'error al agregar producto.';
  }
    

});


//espacio para formulario de agregar producto

document.getElementById('form-producto').addEventListener('submit', async (evento) => {
  // evitamos que el form haga su comportamiento por defecto (recargar la pagina)
  evento.preventDefault();

  const mensaje = document.getElementById('mensaje-formulario');

  // armamos un objeto con la MISMA forma que "productoNuevo", pero con los
  // valores que la persona escribio en el formulario en vez de texto fijo
  const datosFormulario = {
    nombre: document.getElementById('input-nombre').value,
    descripcion: document.getElementById('input-descripcion').value,
    precio: Number(document.getElementById('input-precio').value),
    descuento: Number(document.getElementById('input-descuento').value),
    unidades: Number(document.getElementById('input-unidades').value),
    disponible: document.getElementById('input-disponible').checked,
    categorias: document.getElementById('input-categorias').value
      .split(',')
      .map(categoria => categoria.trim())
      .filter(categoria => categoria !== ''),
    image_url: document.getElementById('input-image-url').value,
  };

  mensaje.textContent = 'Guardando...';

  const respuesta = await agregarProducto(datosFormulario);

  if (respuesta) {
    mensaje.textContent = 'Producto agregado con ID: ' + respuesta.id;
    document.getElementById('form-producto').reset();
  } else {
    mensaje.textContent = 'Error al agregar producto (mirá la consola).';
  }
});

// ============================================================
// READ del CRUD: boton "Ver todos los productos" -> trae TODAS las
// filas de la tabla y pinta una card por cada producto.
// ============================================================

// arma el HTML de una sola card a partir de un producto de la base de datos
function crearTarjetaProducto(producto) {
  // si no cargaron una imagen, mostramos un cuadrito con un emoji en vez
  // de un <img> roto
  const imagen = producto.image_url
    ? `<img class="card-producto-y2k__imagen" src="${producto.image_url}" alt="${producto.nombre}">`
    : `<div class="card-producto-y2k__imagen card-producto-y2k__imagen--vacia">🖼️</div>`;

  // si hay descuento, mostramos el precio original tachado al lado del precio final
  const tieneDescuento = producto.descuento && producto.descuento > 0;
  const precioFinal = tieneDescuento
    ? producto.precio * (1 - producto.descuento)
    : producto.precio;

  const precios = `
    <div class="card-producto-y2k__precios">
      <span class="card-producto-y2k__precio-final">$${precioFinal.toFixed(2)}</span>
      ${tieneDescuento ? `<span class="card-producto-y2k__precio-original">$${producto.precio.toFixed(2)}</span>` : ''}
    </div>`;

  // "categorias" llega como array desde supabase -> un badge por cada una
  const categorias = (producto.categorias || [])
    .map((categoria) => `<span class="badge-y2k badge-y2k--categoria">${categoria}</span>`)
    .join('');

  const badgeDisponible = producto.disponible
    ? `<span class="badge-y2k badge-y2k--disponible">✅ Disponible</span>`
    : `<span class="badge-y2k badge-y2k--agotado">❌ Agotado</span>`;

  return `
    <article class="card-producto-y2k" data-id="${producto.id}">
      ${imagen}
      <div class="card-producto-y2k__cuerpo">
        <h4 class="card-producto-y2k__nombre">${producto.nombre}</h4>
        <p class="card-producto-y2k__descripcion">${producto.descripcion || ''}</p>
        ${precios}
        <div class="card-producto-y2k__badges">
          ${badgeDisponible}
          <span class="badge-y2k">📦 ${producto.unidades ?? 0} unidades</span>
          ${categorias}
        </div>
        <div class="card-producto-y2k__acciones">
          <button type="button" class="btn-editar-producto" data-id="${producto.id}">✏️ Editar</button>
        </div>
      </div>
    </article>`;
}

// pinta un array completo de productos dentro de #grid-productos
function pintarProductosEnCards(productos) {
  const grid = document.getElementById('grid-productos');
  const mensaje = document.getElementById('mensaje-productos');

  if (!productos || productos.length === 0) {
    grid.innerHTML = '';
    mensaje.textContent = 'Todavía no hay productos cargados.';
    return;
  }

  mensaje.textContent = `${productos.length} producto(s) encontrados.`;
  grid.innerHTML = productos.map(crearTarjetaProducto).join('');
}

document.getElementById('btn-ver-productos').addEventListener('click', async () => {
  const mensaje = document.getElementById('mensaje-productos');
  mensaje.textContent = 'Cargando productos...';

  // mismo SELECT que usamos en btn-traer, pero esta vez el resultado se
  // pinta como tarjetas en vez de JSON crudo
  const { data, error } = await db.from('productos_practica').select('*');

  if (error) {
    mensaje.textContent = 'Error al traer productos: ' + error.message;
    console.error(error);
    return;
  }

  pintarProductosEnCards(data);
});

// AHORA:
async function buscarProductoPorId(id) {
  const { data, error } = await db
    .from('productos_practica')
    .select('*')
    .eq('id', id)    // eq = "equal" (igual a) — equivalente a find(p => p.id === id)
    .single();         // single() = "espero exactamente una fila, dámela
                        // como objeto, no como array de un elemento"

  if (error) return null;
  return data;
}

async function buscarProductosPorNombre(texto) {
  const { data, error } = await db
    .from('productos_practica')
    .select('*')
    .ilike('nombre', `%${texto}%`);
    // ilike = "like" insensible a mayúsculas/minúsculas.
    // los símbolos % significan "cualquier texto antes/después" —
    // equivalente a .toLowerCase().includes(texto)

  if (error) return [];
  return data;
}

// ============================================================
// conectamos buscarProductoPorId() y buscarProductosPorNombre() con
// sus botones y pintamos el resultado reusando crearTarjetaProducto()
// ============================================================

document.getElementById('btn-buscar-id').addEventListener('click', async () => {
  const mensaje = document.getElementById('mensaje-busqueda');
  const grid = document.getElementById('grid-busqueda');
  const id = document.getElementById('input-buscar-id').value;

  if (!id) {
    mensaje.textContent = 'Escribí un ID para buscar.';
    return;
  }

  mensaje.textContent = 'Buscando...';
  const producto = await buscarProductoPorId(id);

  if (!producto) {
    grid.innerHTML = '';
    mensaje.textContent = `No se encontró ningún producto con ID ${id}.`;
    return;
  }

  mensaje.textContent = '1 producto encontrado.';
  grid.innerHTML = crearTarjetaProducto(producto);
});

document.getElementById('btn-buscar-nombre').addEventListener('click', async () => {
  const mensaje = document.getElementById('mensaje-busqueda');
  const grid = document.getElementById('grid-busqueda');
  const texto = document.getElementById('input-buscar-nombre').value.trim();

  if (!texto) {
    mensaje.textContent = 'Escribí un nombre (o parte de uno) para buscar.';
    return;
  }

  mensaje.textContent = 'Buscando...';
  const productos = await buscarProductosPorNombre(texto);

  if (productos.length === 0) {
    grid.innerHTML = '';
    mensaje.textContent = `No se encontraron productos que contengan "${texto}".`;
    return;
  }

  mensaje.textContent = `${productos.length} producto(s) encontrados.`;
  grid.innerHTML = productos.map(crearTarjetaProducto).join('');
});

// Enter en cualquiera de los dos inputs dispara la busqueda, no hace
// falta hacer click en el boton
document.getElementById('input-buscar-id').addEventListener('keydown', (evento) => {
  if (evento.key === 'Enter') document.getElementById('btn-buscar-id').click();
});

document.getElementById('input-buscar-nombre').addEventListener('keydown', (evento) => {
  if (evento.key === 'Enter') document.getElementById('btn-buscar-nombre').click();
});

// AHORA (Supabase resuelve "encontrar y actualizar" en una sola instrucción):
async function modificarProducto(id, cambios) {

  const { data, error } = await db
    .from('productos_practica')
    .update(cambios)   // solo actualiza las propiedades que vengan en "cambios"
    .eq('id', id)        // ...de la fila donde el id coincida
    .select();

  if (error) return null;
  return data[0];
}

// ============================================================
// conectamos modificarProducto() al modal de edicion: se abre
// apretando "Editar" en cualquier card, viene con los datos ya
// cargados y al guardar actualiza esa misma card en pantalla.
// ============================================================

const modalEditar = document.getElementById('modal-editar');

function abrirModalEditar(producto) {
  document.getElementById('editar-id').value = producto.id;
  document.getElementById('editar-nombre').value = producto.nombre || '';
  document.getElementById('editar-descripcion').value = producto.descripcion || '';
  document.getElementById('editar-precio').value = producto.precio ?? 0;
  document.getElementById('editar-descuento').value = producto.descuento ?? 0;
  document.getElementById('editar-unidades').value = producto.unidades ?? 0;
  document.getElementById('editar-categorias').value = (producto.categorias || []).join(', ');
  document.getElementById('editar-image-url').value = producto.image_url || '';
  document.getElementById('editar-disponible').checked = Boolean(producto.disponible);

  document.getElementById('mensaje-editar').textContent = '';
  modalEditar.classList.add('is-open');
}

function cerrarModalEditar() {
  modalEditar.classList.remove('is-open');
}

document.getElementById('cerrar-modal-editar').addEventListener('click', cerrarModalEditar);

// clic en el fondo oscuro (fuera de la tarjeta del modal) tambien cierra
modalEditar.addEventListener('click', (evento) => {
  if (evento.target === modalEditar) cerrarModalEditar();
});

document.addEventListener('keydown', (evento) => {
  if (evento.key === 'Escape') cerrarModalEditar();
});

// delegacion de eventos: un solo listener en <body> detecta el click en
// CUALQUIER boton ".btn-editar-producto", sin importar en que grilla este
// (grid-productos o grid-busqueda), incluso en cards pintadas despues
document.body.addEventListener('click', async (evento) => {
  const boton = evento.target.closest('.btn-editar-producto');
  if (!boton) return;

  const producto = await buscarProductoPorId(boton.dataset.id);
  if (!producto) {
    alert('No se pudo cargar ese producto para editarlo.');
    return;
  }

  abrirModalEditar(producto);
});

document.getElementById('form-editar').addEventListener('submit', async (evento) => {
  evento.preventDefault();

  const mensaje = document.getElementById('mensaje-editar');
  const id = document.getElementById('editar-id').value;

  // mismo armado de objeto que en el formulario de crear
  const cambios = {
    nombre: document.getElementById('editar-nombre').value,
    descripcion: document.getElementById('editar-descripcion').value,
    precio: Number(document.getElementById('editar-precio').value),
    descuento: Number(document.getElementById('editar-descuento').value),
    unidades: Number(document.getElementById('editar-unidades').value),
    disponible: document.getElementById('editar-disponible').checked,
    categorias: document.getElementById('editar-categorias').value
      .split(',')
      .map(categoria => categoria.trim())
      .filter(categoria => categoria !== ''),
    image_url: document.getElementById('editar-image-url').value,
  };

  mensaje.textContent = 'Guardando cambios...';
  const productoActualizado = await modificarProducto(id, cambios);

  if (!productoActualizado) {
    mensaje.textContent = 'Error al guardar los cambios (mirá la consola).';
    return;
  }

  // la card de este producto puede estar en el grid de "todos los
  // productos" Y en el grid de busqueda al mismo tiempo -> actualizamos
  // TODAS las que encontremos con ese id, en vez de volver a pedirle
  // todo a supabase
  document.querySelectorAll(`.card-producto-y2k[data-id="${id}"]`).forEach((card) => {
    card.outerHTML = crearTarjetaProducto(productoActualizado);
  });

  cerrarModalEditar();
});

async function eliminarProducto(id) {

  const { error } = await db
    .from('productos_practica')
    .delete()
    .eq('id', id);

  return !error;   // true si NO hubo error (se borró bien), false si falló
}

// ============================================================
// conectamos eliminarProducto() al boton "🗑️ Eliminar producto"
// que vive adentro del modal de editar (mismo modal del UPDATE)
// ============================================================

document.getElementById('btn-eliminar-editar').addEventListener('click', async () => {
  const mensaje = document.getElementById('mensaje-editar');
  const id = document.getElementById('editar-id').value;
  const nombre = document.getElementById('editar-nombre').value;

  // confirm() nativo antes de borrar -> mismo patron que ya usamos en
  // gestion.js, porque eliminar es una accion que no se puede deshacer
  const confirmado = confirm(`¿Seguro que querés eliminar "${nombre}"? Esto no se puede deshacer.`);
  if (!confirmado) return;

  mensaje.textContent = 'Eliminando...';
  const seEliminó = await eliminarProducto(id);

  if (!seEliminó) {
    mensaje.textContent = 'Error al eliminar el producto (mirá la consola).';
    return;
  }

  // sacamos de pantalla cualquier card de este producto, este donde este
  // (grid de "todos los productos" y/o grid de busqueda)
  document.querySelectorAll(`.card-producto-y2k[data-id="${id}"]`).forEach((card) => card.remove());

  cerrarModalEditar();
});

// ============================================================
// navbar: resalta el link del panel que se esta viendo en pantalla
// mientras se hace scroll (no hace falta clickear para que "sepa" donde estas)
// ============================================================

const linksNavbar = document.querySelectorAll('.navbar-y2k__link');

const observadorNavbar = new IntersectionObserver(
  (entradas) => {
    entradas.forEach((entrada) => {
      if (!entrada.isIntersecting) return;

      linksNavbar.forEach((link) => {
        link.classList.toggle('is-active', link.getAttribute('href') === '#' + entrada.target.id);
      });
    });
  },
  { rootMargin: '-40% 0px -50% 0px' } // "activo" cuando el panel cruza el centro de la pantalla
);

document.querySelectorAll('#panel-crear, #panel-leer, #panel-buscar')
  .forEach((panel) => observadorNavbar.observe(panel));