document.addEventListener("DOMContentLoaded", async () => {
  // Elementos del DOM con verificaciones
  const menuNotas = document.getElementById("menu_notas");
  const seccionSubir = document.getElementById("seccion_subir_notas");
  const seccionCambiar = document.getElementById("seccion_cambiar_notas");
  const tablaCambiarNotas = document.getElementById("tabla_cambiar_notas");

  const btnSubirNotas = document.getElementById("boton_subir_notas");
  const btnCambiarNotas = document.getElementById("boton_cambiar_notas");
  const btnVolverSubir = document.getElementById("btn_volver_subir_notas");
  const btnVolverCambiar = document.getElementById("btn_volver_cambiar_notas");
  const btnVolverMenu = document.getElementById("volver_menu");

  const tipoNota = document.getElementById("tipo_nota");
  const opcionesTarea = document.getElementById("opciones_tarea");
  const opcionesEvaluacion = document.getElementById("opciones_evaluacion");
  const temaSelect = document.getElementById("tema_tarea");
  const tareaSelect = document.getElementById("tarea_tema");
  const moduloelect = document.getElementById("modulo_evaluacion");
  const btnMarcarCompletada = document.getElementById("btn_marcar_completada");
  const btnSubirNota = document.getElementById("btn_subir_nota");

  // Verificar que los elementos críticos existan
  if (!menuNotas || !seccionSubir || !seccionCambiar) {
    console.error("Elementos principales del DOM no encontrados");
    return;
  }

  // ───────────────────────────────────────────────
  // 🔹 Cambiar secciones
  // ───────────────────────────────────────────────
  function mostrarMenuPrincipal() {
    if (seccionSubir) seccionSubir.style.display = "none";
    if (seccionCambiar) seccionCambiar.style.display = "none";
    if (menuNotas) {
      menuNotas.style.display = "flex";
      menuNotas.style.flexDirection = "column";
      menuNotas.style.alignItems = "center";
      menuNotas.style.justifyContent = "center";
    }
  }

  // Configurar event listeners solo si los botones existen
  if (btnSubirNotas) {
    btnSubirNotas.onclick = async () => {
      if (menuNotas) menuNotas.style.display = "none";
      if (seccionCambiar) seccionCambiar.style.display = "none";
      if (seccionSubir) seccionSubir.style.display = "block";
      await cargarmodulo();
      await cargarTemas();
    };
  }

  if (btnCambiarNotas) {
    btnCambiarNotas.onclick = async () => {
      if (menuNotas) menuNotas.style.display = "none";
      if (seccionSubir) seccionSubir.style.display = "none";
      if (seccionCambiar) seccionCambiar.style.display = "block";
      await cargarNotasEvaluacion();
    };
  }

  if (btnVolverSubir) btnVolverSubir.onclick = mostrarMenuPrincipal;
  if (btnVolverCambiar) btnVolverCambiar.onclick = mostrarMenuPrincipal;
  if (btnVolverMenu) btnVolverMenu.onclick = mostrarMenuPrincipal;

  // ───────────────────────────────────────────────
  // 🔹 Mostrar opciones según tipo de nota
  // ───────────────────────────────────────────────
  if (tipoNota) {
    tipoNota.addEventListener("change", () => {
      const valor = tipoNota.value;
      if (opcionesTarea) {
        opcionesTarea.style.display = valor === "tarea" ? "block" : "none";
      }
      if (opcionesEvaluacion) {
        opcionesEvaluacion.style.display = valor === "evaluacion" ? "block" : "none";
      }
    });
  }

  // ───────────────────────────────────────────────
  // 🔹 Cargar módulos para evaluaciones
  // ───────────────────────────────────────────────
  async function cargarmodulo() {
    if (!moduloelect) {
      console.warn("Elemento modulo_evaluacion no encontrado");
      return;
    }

    try {
      const { data: modulo, error } = await supabase.from("modulo").select("id_modulo, titulo_modulo");
      if (error) {
        console.error("Error al cargar módulos:", error.message);
        return;
      }

      moduloelect.innerHTML = `<option value="" disabled selected>Seleccione un módulo...</option>`;
      
      if (modulo && modulo.length > 0) {
        modulo.forEach((modulo) => {
          const opt = document.createElement("option");
          opt.value = modulo.id_modulo;
          opt.textContent = modulo.titulo_modulo;
          moduloelect.appendChild(opt);
        });
      } else {
        moduloelect.innerHTML = `<option value="" disabled selected>No hay módulos disponibles</option>`;
      }
    } catch (error) {
      console.error("Error inesperado al cargar módulos:", error);
    }
  }

  // ───────────────────────────────────────────────
  // 🔹 Cargar temas
  // ───────────────────────────────────────────────
  async function cargarTemas() {
    if (!temaSelect) {
      console.warn("Elemento tema_tarea no encontrado");
      return;
    }

    try {
      const { data: temas, error } = await supabase.from("tema").select("id_tema, nombre_tema");
      if (error) {
        console.error("Error al cargar temas:", error.message);
        return;
      }

      temaSelect.innerHTML = `<option value="" disabled selected>Seleccione un tema...</option>`;
      
      if (temas && temas.length > 0) {
        temas.forEach((tema) => {
          const opt = document.createElement("option");
          opt.value = tema.id_tema;
          opt.textContent = tema.nombre_tema;
          temaSelect.appendChild(opt);
        });
      } else {
        temaSelect.innerHTML = `<option value="" disabled selected>No hay temas disponibles</option>`;
      }
    } catch (error) {
      console.error("Error inesperado al cargar temas:", error);
    }
  }

  // ───────────────────────────────────────────────
  // 🔹 Cargar tareas según tema
  // ───────────────────────────────────────────────
  if (temaSelect) {
    temaSelect.addEventListener("change", async () => {
      if (!tareaSelect) {
        console.warn("Elemento tarea_tema no encontrado");
        return;
      }

      const idTema = temaSelect.value;
      if (!idTema) return;

      try {
        const { data: tareas, error } = await supabase
          .from("tarea")
          .select("*")
          .eq("id_tema", idTema);

        if (error) {
          console.error("Error al cargar tareas:", error.message);
          return;
        }

        tareaSelect.innerHTML = `<option value="" disabled selected>Seleccione una tarea...</option>`;
        
        if (tareas && tareas.length > 0) {
          tareas.forEach((tarea) => {
            const opt = document.createElement("option");
            opt.value = tarea.id_tarea;
            opt.textContent = `${tarea.nombre_tarea} ${tarea.estado_tarea ? "✅" : "❌"}`;
            tareaSelect.appendChild(opt);
          });
        } else {
          tareaSelect.innerHTML = `<option value="" disabled selected>No hay tareas para este tema</option>`;
        }
      } catch (error) {
        console.error("Error inesperado al cargar tareas:", error);
      }
    });
  }

  // ───────────────────────────────────────────────
  // 🔹 Marcar tarea completada (usando procedimiento almacenado)
  // ───────────────────────────────────────────────
  if (btnMarcarCompletada) {
    btnMarcarCompletada.onclick = async () => {
      if (!tareaSelect || !temaSelect) {
        alert("Elementos necesarios no disponibles");
        return;
      }

      const idTarea = tareaSelect.value;
      const idTema = temaSelect.value;
      
      if (!idTarea || !idTema) {
        alert("Seleccione un tema y una tarea primero.");
        return;
      }

      try {
        const { data, error } = await supabase.rpc('marcar_tarea_completada', {
          p_id_tarea: parseInt(idTarea),
          p_id_tema: parseInt(idTema)
        });

        if (error) throw error;

        if (data && data.tema_completado) {
          alert("🎉 Todas las tareas del tema fueron completadas. ¡Tema finalizado!");
        } else {
          alert("✅ Tarea marcada como completada.");
        }

        // Actualizar la lista de tareas
        if (temaSelect) {
          temaSelect.dispatchEvent(new Event("change"));
        }
      } catch (error) {
        console.error("Error:", error);
        alert("❌ Error al marcar tarea.");
      }
    };
  }

// ───────────────────────────────────────────────
// 🔹 Subir nota de evaluación (usando procedimiento almacenado)
// ───────────────────────────────────────────────
if (btnSubirNota) {
  btnSubirNota.onclick = async () => {
    const notaInput = document.getElementById("nota_evaluacion");
    
    if (!moduloSelect || !notaInput) {
      alert("Elementos del formulario no disponibles");
      return;
    }

    const idModulo = moduloSelect.value;
    const nota = notaInput.value;

    // VALIDACIONES BÁSICAS
    if (!idModulo) {
      alert("Debe seleccionar un módulo.");
      return;
    }

    if (nota === "" || isNaN(nota) || nota < 0 || nota > 100) {
      alert("Debe ingresar una nota válida entre 0 y 100.");
      return;
    }

    try {
      console.log("Enviando datos:", { idModulo, nota });
      
      const { data, error } = await supabase.rpc('insertar_evaluacion', {
        p_id_modulo: parseInt(idModulo),
        p_notas: parseInt(nota)
        // Quitamos p_id_usuario ya que no existe en la tabla evaluacion
      });

      if (error) {
        console.error("Error de Supabase:", error);
        throw error;
      }

      alert(`📊 Nota subida correctamente: ${nota}`);
      moduloSelect.value = "";
      notaInput.value = "";
      
    } catch (error) {
      console.error("Error completo:", error);
      alert("❌ Error al subir nota: " + (error.message || "Error desconocido"));
    }
  };
}

  // ───────────────────────────────────────────────
  // 🔹 Función para obtener usuario actual
  // ───────────────────────────────────────────────
  async function obtenerUsuarioActual() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && user.email) {
        const { data: usuario, error } = await supabase
          .from('usuario')
          .select('id_usuario')
          .eq('correo', user.email)
          .single();
        
        if (error) {
          console.error("Error al obtener usuario:", error);
          return null;
        }
        
        return usuario?.id_usuario || 1; // Fallback a un ID por defecto si es necesario
      }
      return 1; // Fallback para desarrollo
    } catch (error) {
      console.error("Error en obtenerUsuarioActual:", error);
      return 1; // Fallback para desarrollo
    }
  }

// ───────────────────────────────────────────────
// 🔹 Cargar notas en tabla
// ───────────────────────────────────────────────
async function cargarNotasEvaluacion() {
  if (!tablaCambiarNotas) {
    console.warn("Elemento tabla_cambiar_notas no encontrado");
    return;
  }

  try {
    const { data: evaluaciones, error } = await supabase
      .from("evaluacion")
      .select(`
        id_evaluacion,
        notas,
        fecha_subida,
        modulo:modulo(id_modulo, titulo_modulo)
      `)
      .order('fecha_subida', { ascending: false });

    if (error) {
      console.error("Error al obtener notas:", error.message);
      tablaCambiarNotas.innerHTML = "<tr><td colspan='5'>Error al cargar las notas</td></tr>";
      return;
    }

    if (!evaluaciones || evaluaciones.length === 0) {
      tablaCambiarNotas.innerHTML = "<tr><td colspan='5'>No hay notas cargadas.</td></tr>";
      return;
    }

    let html = `
      <tr>
        <th>ID</th>
        <th>Módulo</th>
        <th>Nota</th>
        <th>Fecha</th>
        <th>Acciones</th>
      </tr>`;

    // CORRECCIÓN: Cambiar 'eval' por 'evaluacionItem' para evitar conflicto con palabra reservada
    evaluaciones.forEach((evaluacionItem) => {
      html += `
        <tr data-id="${evaluacionItem.id_evaluacion}">
          <td>${evaluacionItem.id_evaluacion}</td>
          <td>${evaluacionItem.modulo?.titulo_modulo || 'N/A'}</td>
          <td><input type="number" value="${evaluacionItem.notas}" class="editable-nota" min="0" max="100"></td>
          <td>${new Date(evaluacionItem.fecha_subida).toLocaleDateString()}</td>
          <td>
            <button class="btn-actualizar" data-id="${evaluacionItem.id_evaluacion}">Actualizar</button>
            <button class="btn-eliminar" data-id="${evaluacionItem.id_evaluacion}">Eliminar</button>
          </td>
        </tr>`;
    });

    tablaCambiarNotas.innerHTML = html;

    // Agregar event listeners para los botones
    tablaCambiarNotas.querySelectorAll(".btn-actualizar").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        const idEvaluacion = e.target.dataset.id;
        const fila = e.target.closest("tr");
        const nuevaNota = fila.querySelector(".editable-nota").value;
        await actualizarNota(idEvaluacion, nuevaNota);
      });
    });

    tablaCambiarNotas.querySelectorAll(".btn-eliminar").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        const idEvaluacion = e.target.dataset.id;
        await eliminarNota(idEvaluacion);
      });
    });

  } catch (error) {
    console.error("Error inesperado al cargar notas:", error);
    tablaCambiarNotas.innerHTML = "<tr><td colspan='5'>Error inesperado al cargar las notas</td></tr>";
  }
}

  // ───────────────────────────────────────────────
  // 🔹 Actualizar nota (usando procedimiento almacenado)
  // ───────────────────────────────────────────────
  async function actualizarNota(idEvaluacion, nuevaNota) {
    if (!idEvaluacion || !nuevaNota) {
      alert("Datos inválidos para actualizar");
      return;
    }

    try {
      const { error } = await supabase.rpc('actualizar_evaluacion', {
        p_id_evaluacion: parseInt(idEvaluacion),
        p_nueva_nota: parseInt(nuevaNota)
      });

      if (error) throw error;

      alert("✅ Nota actualizada correctamente");
      await cargarNotasEvaluacion();
    } catch (error) {
      console.error("Error:", error);
      alert("❌ Error al actualizar nota.");
    }
  }

  // ───────────────────────────────────────────────
  // 🔹 Eliminar nota (usando procedimiento almacenado)
  // ───────────────────────────────────────────────
  async function eliminarNota(idEvaluacion) {
    if (!idEvaluacion) return;

    if (!confirm("¿Está seguro de eliminar esta nota?")) return;

    try {
      const { error } = await supabase.rpc('eliminar_evaluacion', {
        p_id_evaluacion: parseInt(idEvaluacion)
      });

      if (error) throw error;

      alert("✅ Nota eliminada correctamente");
      await cargarNotasEvaluacion();
    } catch (error) {
      console.error("Error:", error);
      alert("❌ Error al eliminar nota.");
    }
  }

  // Inicializar la vista principal
  mostrarMenuPrincipal();
});