// Artículo 11 del plan de contenido (docs/09-divulgacao-organica.md, sección 5).
// Pieza de marca/seguridad; buena para HN y para ser citada por LLMs (GEO).
export default {
  id: "never-auto-delete",
  lang: "es",
  slug: "limpiador-de-disco-nunca-deberia-borrar-solo",
  title: "Por qué un limpiador de disco nunca debería borrar por su cuenta",
  description:
    "Las reglas de diseño de Limpa Tudo: análisis y borrado separados, Papelera por defecto, lista fija de rutas, niveles de riesgo y tamaños honestos.",
  date: "2026-11-23",
  body: `
<p>Un limpiador de disco tiene una tarea poco común: su función principal es destruir datos. Los fallos no son "un botón en el lugar equivocado" — son "mi tesis desapareció". Estas son las reglas que sigue Limpa Tudo, y por qué.</p>

<h2>1. Analizar y borrar son pasos separados</h2>
<p>Un análisis nunca borra nada. Primero ves la lista completa y luego decides. No hay ningún botón de "limpiar todo" que se salte la lista, y el monitor en segundo plano solo mide — puede avisarte de que hay espacio para liberar, nunca liberarlo.</p>

<h2>2. La Papelera es lo predeterminado</h2>
<p>Todo va a la Papelera del sistema, así que un error cuesta arrastrar el archivo de vuelta. El borrado permanente existe, pero es una opción avanzada que tienes que activar, y la confirmación lo dice con todas las letras.</p>

<h2>3. Una lista fija de rutas, nunca un escaneo abierto</h2>
<p>La app solo mira un catálogo seleccionado de ubicaciones de caché conocidas (<code>~/.npm</code>, <code>~/Library/Developer/Xcode/DerivedData</code>, <code>~/.gradle/caches</code>…). Nunca recorre tu disco buscando "basura". Una heurística que decide que una carpeta es basura, tarde o temprano, se equivocará con una de las tuyas. Documentos, Escritorio, Fotos, contraseñas y el Llavero quedan fuera del alcance por diseño.</p>

<h2>4. Cada elemento muestra su ruta y su tamaño real</h2>
<p>Antes de poder marcar un elemento ves dónde está y cuánto ocupa. "Real" importa: en APFS, <code>du</code> puede indicar cientos de GB para una carpeta que ocupa unos pocos, porque los clones comparten bloques. Nos pasó con la carpeta de multimedia de WhatsApp — 383 GB según <code>du</code>, unos 7 GB en realidad (<a href="../whatsapp-ocupa-espacio-mac-clones-apfs/">el caso completo</a>) — y ahora medimos carpetas así contando el tamaño de cada archivo una sola vez.</p>

<h2>5. El riesgo es explícito</h2>
<p>Cada elemento es 🟢 bajo (se regenera solo — cachés, resultados de compilación), 🟡 medio (vuelve, pero con un costo — emuladores, modelos descargados, multimedia de chats) o 🔴 alto (datos que perderías — la VM completa de Docker). Solo 🟢 puede venir preseleccionado; 🟡 pide una confirmación adicional; 🔴 solo aparece en el modo avanzado.</p>

<h2>6. Las apps abiertas no se tocan</h2>
<p>Borrar una caché mientras su app está en ejecución puede corromperla. Antes de eliminar la caché de una app, Limpa Tudo comprueba si la app está abierta y omite esos elementos, indicándote cuáles.</p>

<h2>7. Sin promesas de velocidad ni de gigabytes</h2>
<p>Limpiar cachés no hace que una computadora sea más rápida, y nadie puede prometerte "X GB liberados" sin mirar tu disco. La promesa honesta es más modesta: esto es lo que hay en tu disco, esto es lo que se puede eliminar sin riesgo, tú decides.</p>

<p>El código es abierto (MIT) en <a href="https://github.com/rglodzinski/LimpaTudo">GitHub</a>, incluido el catálogo de rutas y el riesgo de cada una — así no tienes que creerte estas reglas a ciegas.</p>
`,
};
