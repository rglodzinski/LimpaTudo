// Article 3 of the content plan (docs/09-divulgacao-organica.md, section 5), Spanish version.
// Real case and measurement: docs/02-apps-viloes.md (APFS clones, sizeStrategy "uniqueFileSizes").
export default {
  id: "whatsapp",
  lang: "es",
  slug: "whatsapp-ocupa-espacio-mac-clones-apfs",
  title: "¿WhatsApp ocupa 383 GB en el Mac? Los clones APFS y el tamaño real",
  description:
    "Por qué du y algunos limpiadores muestran cientos de GB de WhatsApp en el Mac cuando el real es mucho menor, cómo medirlo y liberar espacio sin perder nada.",
  date: "2026-11-23",
  body: `
<p>En un Mac con un SSD de 228 GB, <code>du</code> decía que la carpeta de archivos multimedia de WhatsApp ocupaba <strong>383 GB</strong>, más que el disco entero. El propio WhatsApp, en "Administrar almacenamiento", decía <strong>7.35 GB</strong>. Los dos medían la misma carpeta.</p>

<h2>1. Dónde guarda WhatsApp sus cosas en el Mac</h2>
<ul>
<li><strong>Archivos descargados</strong> (fotos, videos, notas de voz, documentos): <code>~/Library/Group Containers/group.net.whatsapp.WhatsApp.shared/Message/Media</code></li>
<li><strong>Caché</strong> (WhatsApp Desktop antiguo): <code>~/Library/Application Support/WhatsApp/Cache</code></li>
</ul>

<h2>2. Por qué el número es absurdo: los clones APFS</h2>
<p>Cuando la misma foto llega a varios grupos, WhatsApp guarda una copia en la carpeta de cada chat. Esas copias son <em>clones APFS</em>: archivos distintos que apuntan a los mismos bloques del disco. Diez "copias" de un video de 50 MB ocupan 50 MB.</p>
<p><code>du</code> no lo sabe. Suma cada archivo como si fuera independiente, y la carpeta de archivos multimedia está llena de clones. En el caso real: <strong>822,000 archivos</strong> con solo <strong>16,000 tamaños distintos</strong>, que suman <strong>7.12 GB</strong>. Muy cerca de los 7.35 GB de WhatsApp, y a años luz de los 383 GB de <code>du</code>.</p>
<p>El mismo error aparece en cualquier herramienta que sume los tamaños de los archivos uno por uno, limpiadores de disco incluidos.</p>
<div class="note"><strong>En la práctica:</strong> borrar la carpeta de un chat puede no liberar casi nada, porque los bloques siguen en uso por los clones de otros chats. El espacio solo vuelve cuando desaparecen todas las copias de ese archivo.</div>

<h2>3. Cómo medirlo bien</h2>
<ul>
<li><strong>En WhatsApp:</strong> los ajustes de almacenamiento ("Administrar almacenamiento") muestran el total y cada chat.</li>
<li><strong>En macOS:</strong> anota el espacio libre en <em>Ajustes del Sistema › General › Almacenamiento</em> (o <code>df -h /</code>) antes y después de limpiar. Es el único número que no miente.</li>
<li>Desconfía de cualquier número mayor que tu disco.</li>
</ul>

<h2>4. Cómo liberar espacio sin perder lo importante</h2>
<p><strong>Caché 🟢:</strong> la carpeta <code>Cache</code> se puede borrar con WhatsApp cerrado.</p>
<p><strong>Archivos multimedia 🟡:</strong> los que ya no están en tu teléfono (ni en su copia de seguridad) pueden no volver. El camino más seguro es el propio "Administrar almacenamiento" de WhatsApp: lista los chats y archivos más grandes y borra todos los clones juntos, así que el espacio se recupera de verdad.</p>

<h2>5. Cómo trata Limpa Tudo a WhatsApp</h2>
<ul>
<li>La caché es 🟢 y los archivos descargados son 🟡, lo que pide una confirmación adicional.</li>
<li>Los archivos multimedia se miden sumando cada tamaño de archivo <strong>una sola vez</strong>. Es una estimación (dos archivos distintos con exactamente el mismo tamaño cuentan una vez, así que se queda un poco corta), pero se acerca a la cifra real en lugar de superar tu disco.</li>
<li>Si WhatsApp está abierto, la app te avisa y no toca sus archivos.</li>
</ul>
`,
};
