const fetch = require('node-fetch');

// Configuración de Supabase
const SUPABASE_URL = 'https://ugizugbplgxhawlyqztx.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnaXp1Z2JwbGd4aGF3bHlxenR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxMTkyNjAsImV4cCI6MjA1ODY5NTI2MH0.EWkCVPmh4dYejtzd81ADMWqo4dvunKh1ay4IS4nucKU';

// Función para obtener la estructura de la tabla
async function obtenerEstructuraTabla() {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/usuarios?limit=0`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    // Obtener los campos disponibles de los headers
    const contentType = response.headers.get('Content-Type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    
    // Alternativa: obtener de los headers (PostgREST)
    const rangeHeader = response.headers.get('Content-Range');
    if (rangeHeader) {
      console.log('Estructura de tabla obtenida de headers');
      return []; // Retornar array vacío ya que solo necesitamos validar la conexión
    }
    
    throw new Error('No se pudo obtener la estructura de la tabla');
  } catch (error) {
    console.error('Error al obtener estructura de tabla:', error.message);
    throw error;
  }
}

// Función para insertar usuarios (versión corregida)
async function insertarUsuarios(usuarios) {
  try {
    console.log('\nPreparando para insertar usuarios...');
    
    // Verificar estructura de datos
    if (!Array.isArray(usuarios)) {
      throw new Error('El parámetro usuarios debe ser un array');
    }

    // Filtrar solo los campos válidos
    const usuariosParaInsertar = usuarios.map(usuario => {
      const { fecha_creacion, ...usuarioSinFecha } = usuario; // Eliminar fecha_creacion
      return {
        ...usuarioSinFecha,
        // Campos requeridos
        identificacion: usuario.identificacion,
        nombre_usuario: usuario.nombre_usuario,
        clave_encriptada: usuario.clave_encriptada,
        email: usuario.email,
        usuario_normal: usuario.usuario_normal || 0,
        usuario_administrador: usuario.usuario_administrador || 0,
        usuario_superadministrador: usuario.usuario_superadministrador || 0
      };
    });

    const response = await fetch(`${SUPABASE_URL}/rest/v1/usuarios`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(usuariosParaInsertar)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Detalles del error:', errorData);
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('✅ Usuarios insertados correctamente');
    return result;
  } catch (error) {
    console.error('❌ Error al insertar usuarios:');
    console.error(error.message);
    throw error;
  }
}

// Ejemplo de uso corregido
async function main() {
  try {
    // Primero verificamos la estructura de la tabla
    await obtenerEstructuraTabla();
    console.log('Estructura de tabla verificada con éxito');

    const nuevoUsuario = {
      identificacion: Math.floor(Math.random() * 900000) + 100000,
      nombre_usuario: `user_${Math.random().toString(36).substring(2, 8)}`,
      clave_encriptada: 'contraseñaSegura123',
      email: `test_${Date.now()}@example.com`,
      usuario_normal: 1,
      usuario_administrador: 0,
      usuario_superadministrador: 0
      // Eliminado fecha_creacion ya que no existe en la tabla
    };

    const resultado = await insertarUsuarios([nuevoUsuario]);
    console.log('\nResultado de la inserción:');
    console.log(resultado);
  } catch (error) {
    console.error('\nError en la ejecución principal:');
    console.error(error.message);
    
    // Sugerencias para resolver el error
    console.log('\nPosibles soluciones:');
    console.log('1. Verifica que todos los campos existan en tu tabla de Supabase');
    console.log('2. Revisa los nombres de las columnas (distingue mayúsculas/minúsculas)');
    console.log('3. Asegúrate que los tipos de datos coincidan');
    
    process.exit(1);
  }
}

// Ejecutar
main();