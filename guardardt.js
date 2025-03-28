// Importación compatible con node-fetch v3+
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Configuración
const SUPABASE_URL = 'https://ugizugbplgxhawlyqztx.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnaXp1Z2JwbGd4aGF3bHlxenR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxMTkyNjAsImV4cCI6MjA1ODY5NTI2MH0.EWkCVPmh4dYejtzd81ADMWqo4dvunKh1ay4IS4nucKU';

// Datos de los nuevos usuarios a insertar
const nuevosUsuarios = [
  {
    identificacion: 1122334,
    nombre_usuario: "Ana López4",
    clave_encriptada: "anaSecure1234",
    usuario_normal: 1,
    usuario_administrador: 0,
    usuario_superadministrador: 0,
    email: "ana.lopez@ejemplo4.com"
  },
  {
    identificacion: 4455664,
    nombre_usuario: "Carlos Ruiz4",
    clave_encriptada: "carlosPass4564",
    usuario_normal: 0,
    usuario_administrador: 1,
    usuario_superadministrador: 0,
    email: "carlos.ruiz@ejemplo4.com"
  },
  {
    identificacion: 7788994,
    nombre_usuario: "Sofía Mendoza4",
    clave_encriptada: "sofiaM7894",
    usuario_normal: 0,
    usuario_administrador: 0,
    usuario_superadministrador: 1,
    email: "sofia.mendoza4@ejemplo.com"
  }
];

// Función para insertar usuarios
async function insertarUsuarios() {
  try {
    console.log('\nInsertando nuevos usuarios...');
   
    const response = await fetch(`${SUPABASE_URL}/rest/v1/usuarios`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation' // Para recibir los datos insertados
      },
      body: JSON.stringify(nuevosUsuarios)
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const usuariosInsertados = await response.json();
   
    // Mostrar resultados
    console.log('\n✅ Usuarios insertados correctamente:');
    console.log('='.repeat(60));
   
    usuariosInsertados.forEach((usuario, index) => {
      console.log(`👤 Usuario ${index + 1} insertado:`);
      console.log('─'.repeat(40));
      console.log(`  ID: ${usuario.id_usuario}`);
      console.log(`  Nombre: ${usuario.nombre_usuario}`);
      console.log(`  Email: ${usuario.email}`);
      console.log(`  Tipo: ${usuario.usuario_superadministrador ? 'Super Admin' :
                          usuario.usuario_administrador ? 'Administrador' : 'Usuario Normal'}`);
      console.log('─'.repeat(40) + '\n');
    });
   
    console.log(`📌 Total de usuarios insertados: ${usuariosInsertados.length}`);
    console.log('='.repeat(60));
   
    return usuariosInsertados;
  } catch (error) {
    console.error('\n❌ Error al insertar usuarios:');
    console.error('='.repeat(60));
    console.error(error.message);
    console.error('='.repeat(60));
    process.exit(1);
  }
}

// Ejecutar la función
(async () => {
  await insertarUsuarios();
})();