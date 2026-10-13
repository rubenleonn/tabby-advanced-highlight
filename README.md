# tabby-router-event-highlight

Plugin ultraligero y de alto rendimiento para **[Tabby](https://tabby.sh/)**, diseñado específicamente para conexiones por consola a routers y conmutadores de red (Cisco, Huawei, Juniper, etc.) y terminales locales.

*Fork mejorado y extendido de `tabby-error-highlight`.*

Creado por [Rubén León (rubenleonn)](https://github.com/rubenleonn).

---

## ¿Qué hace?

Resalta automáticamente y de forma visualmente llamativa los eventos más críticos en conexiones serie, SSH y consolas de red:

1. **`Error:`** (insensible a mayúsculas: `Error:`, `ERROR:`, `error:`): Resaltado en **rojo vivo** con texto en blanco puro (`\x1b[38;2;255;255;255;48;2;220;0;0m`). Ideal para detectar fallos de sintaxis o comandos erróneos al pegar configuraciones.
2. **`UP`** (case sensitive, palabra independiente): Resaltado en **verde vivo** con texto en blanco puro (`\x1b[38;2;255;255;255;48;2;22;160;50m`). Para identificar interfaces activas, transiciones de protocolo y estados UP al instante.
3. **`DOWN`** (case sensitive, palabra independiente): Resaltado en **naranja vivo** con texto en blanco puro (`\x1b[38;2;255;255;255;48;2;230;95;0m`). Para alertar de interfaces caídas, caídas de vecinos BGP/OSPF o líneas desconectadas.

Usa códigos ANSI TrueColor RGB (24-bit) para garantizar una legibilidad uniforme y pastillas de color nítidas sin importar el tema del terminal ni la paleta de colores configurada.

---

## Características

* **Protección contra falsos positivos:** Emplea comprobación estricta de límites de palabra (`\b` y estados de stream) para evitar resaltar `UP` o `DOWN` dentro de comandos o palabras compuestas habituales en consolas (por ejemplo, `GROUP`, `SHUTDOWN`, `SETUP`, `BACKUP`, `UPDATE`, `DOWNLOAD`, `STARTUP-CONFIG`).
* **Optimizado para conexiones serie (UART / 9600 baudios):** Implementa un acumulador de flujo inteligente (*stream buffer*) con temporizador de 25ms para ensamblar paquetes fragmentados a baja velocidad sin introducir latencia perceptible al teclear o recibir prompts.
* **Cero configuración:** No requiere menús, perfiles ni configuraciones manuales. Se conecta automáticamente a todas las sesiones de terminal (Serie, Local, SSH, Telnet).
* **Ultraligero:** Bundle compilado de apenas unos pocos kilobytes, sin dependencias pesadas ni interfaces gráficas innecesarias.

---

## Compilación y despliegue local

Para compilar e instalar en tu Tabby local en macOS:

```bash
npm run deploy
```

Para generar los paquetes portables (`.tar`, `.tar.gz` y `.tgz`):

```bash
npm run pack
```

O para compilar únicamente el bundle:

```bash
npm run build
```

---

## Instalación portable en cualquier equipo

### Opción 1: Descomprimir el `.tar` / `.tar.gz` portable (Sin necesidad de npm ni Node)

Descomprime `tabby-router-event-highlight-portable.tar.gz` (o `.tar`) dentro del directorio de plugins de Tabby:

* **macOS:** `~/Library/Application Support/tabby/plugins/node_modules/`
* **Linux:** `~/.config/tabby/plugins/node_modules/`
* **Windows:** `%APPDATA%\tabby\plugins\node_modules\`
* **Tabby Portable (Windows/Linux):** `<carpeta_tabby>\data\plugins\node_modules\`

La estructura final debe quedar así:
```
.../plugins/node_modules/tabby-router-event-highlight/
├── dist/
│   ├── index.js
│   └── index.js.LICENSE.txt
├── package.json
└── README.md
```

### Opción 2: Usar el tarball `.tgz` con npm o Tabby `package.json`

Añade la ruta del archivo `.tgz` a las dependencias de `package.json` en la carpeta de plugins de Tabby:

```json
{
  "name": "tabby-plugins",
  "dependencies": {
    "tabby-router-event-highlight": "file:/ruta/a/tabby-router-event-highlight-1.0.0.tgz"
  }
}
```

---

## Licencia

[MIT](LICENSE)
