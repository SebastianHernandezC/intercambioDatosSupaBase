//const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Configuración
const SUPABASE_URL = 'https://ugizugbplgxhawlyqztx.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnaXp1Z2JwbGd4aGF3bHlxenR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxMTkyNjAsImV4cCI6MjA1ODY5NTI2MH0.EWkCVPmh4dYejtzd81ADMWqo4dvunKh1ay4IS4nucKU';

// Datos de los nuevos usuarios a insertar
const nuevosUsuarios = [
  {
    identificacion: 1122334,
    nombre_usuario: "Sebastian Hernandez",
    clave_encriptada: "anaSecure1234",
    usuario_normal: 1,
    usuario_administrador: 0,
    usuario_superadministrador: 0,
    email: "ana.lopez@ejemplo4.com"
  },
  {
    identificacion: 4455664,
    nombre_usuario: "Sebastian Hernandez",
    clave_encriptada: "carlosPass4564",
    usuario_normal: 0,
    usuario_administrador: 1,
    usuario_superadministrador: 0,
    email: "carlos.ruiz@ejemplo4.com"
  },
  {
    identificacion: 7788994,
    nombre_usuario: "Sebastian Hernandez",
    clave_encriptada: "sofiaM7894",
    usuario_normal: 0,
    usuario_administrador: 0,
    usuario_superadministrador: 1,
    email: "sofia.mendoza4@ejemplo.com"
  }
];

async function verificarUsuarioExistente(identificacion, nombre_usuario, email) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/usuarios?or=(identificacion.eq.${identificacion},nombre_usuario.eq.${nombre_usuario},email.eq.${email})`, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`
    }
  });
  
  if (!response.ok) {
    throw new Error(`Error al verificar usuarios: ${response.statusText}`);
  }
  
  return await response.json();
}

async function insertarUsuarios() {
  try {
    console.log('\nInsertando nuevos usuarios...');
    
    // Filtrar usuarios que no existen
    const usuariosParaInsertar = [];
    
    for (const usuario of nuevosUsuarios) {
      const existentes = await verificarUsuarioExistente(
        usuario.identificacion, 
        usuario.nombre_usuario, 
        usuario.email
      );
      
      if (existentes.length === 0) {
        usuariosParaInsertar.push(usuario);
      } else {
        console.log(`⚠️ Usuario con identificación ${usuario.identificacion}, nombre ${usuario.nombre_usuario} o email ${usuario.email} ya existe. Omitiendo...`);
      }
    }
    
    if (usuariosParaInsertar.length === 0) {
      console.log('ℹ️ Todos los usuarios ya existen en la base de datos');
      return;
    }
    
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
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const usuariosInsertados = await response.json();
   
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