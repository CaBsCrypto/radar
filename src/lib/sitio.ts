/**
 * Datos públicos del sitio. Se usan en la página y en el servidor MCP para que las
 * direcciones mostradas sean siempre las del sitio publicado, no las del entorno donde se ejecuta.
 */
export const SITIO_PUBLICO = 'https://radar.browns.studio';
export const URL_SERVIDOR_MCP = `${SITIO_PUBLICO}/api/mcp`;
export const WHATSAPP_CONTACTO = '56945429495';
export const CORREO_CONTACTO = 'cabscryptocontacto@gmail.com';

export const enlaceWhatsApp = (mensaje: string) =>
  `https://wa.me/${WHATSAPP_CONTACTO}?text=${encodeURIComponent(mensaje)}`;
