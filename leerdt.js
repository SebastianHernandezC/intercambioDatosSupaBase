// Importación compatible con node-fetch v3+
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Configuración
const SUPABASE_URL = 'https://ugizugbplgxhawlyqztx.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnaXp1Z2JwbGd4aGF3bHlxenR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxMTkyNjAsImV4cCI6MjA1ODY5NTI2MH0.EWkCVPmh4dYejtzd81ADMWqo4dvunKh1ay4IS4nucKU';

// Función para obtener todos los campos de los usuarios
async function getAllUserData() {
  try {
    console.log('\nObteniendo todos los datos de usuarios...');
   
    const response = await fetch(`${SUPABASE_URL}/rest/v1/usuarios?select=*`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const users = await response.json();
   
    // Mostrar todos los datos de cada usuario
    console.log('\n✅ Todos los datos de usuarios obtenidos:');
    console.log('='.repeat(60));
   
    users.forEach((user, index) => {
      console.log(`👤 Usuario ${index + 1}:`);
      console.log('─'.repeat(30));
     
      // Mostrar cada campo del usuario
      for (const [key, value] of Object.entries(user)) {
        console.log(`  ${key.padEnd(25)}: ${value}`);
      }
     
      console.log('─'.repeat(30) + '\n');
    });
   
    console.log(`📊 Total de usuarios: ${users.length}`);
    console.log('='.repeat(60));
   
    return users;
  } catch (error) {
    console.error('\n❌ Error al obtener los usuarios:');
    console.error('='.repeat(60));
    console.error(error.message);
    console.error('='.repeat(60));
    process.exit(1);
  }
}

// Ejecutar la función
(async () => {
  await getAllUserData();
})();