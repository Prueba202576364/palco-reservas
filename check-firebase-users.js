// Script para verificar usuarios en Firebase
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDxjJQxbIgQ0p7V8Z0zHMEdQiS48sR8fNQ",
  authDomain: "feria-2025.firebaseapp.com",
  projectId: "feria-2025",
  storageBucket: "feria-2025.firebasestorage.app",
  messagingSenderId: "606697537967",
  appId: "1:606697537967:web:55c7b45f15438ff723ef5a",
  measurementId: "G-3XHDSNORZD"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function checkUsers() {
  console.log('🔍 Verificando usuarios en Firebase...\n');
  
  // Verificar usuarios en Authentication
  console.log('📋 Usuarios en Authentication:');
  console.log('(Estos son los que puedes usar para login)');
  console.log('- admin@feria.com');
  console.log('- admin2@feria.com');
  console.log('- vendedor1@feria.com');
  console.log('- vendedor2@feria.com');
  console.log('- vendedor3@feria.com');
  console.log('- vendedor4@feria.com\n');
  
  // Verificar datos en Firestore
  console.log('📊 Datos en Firestore (colección "usuarios"):');
  try {
    const querySnapshot = await getDocs(collection(db, 'usuarios'));
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`- ${data.email}: ${data.name} (${data.role})`);
    });
  } catch (error) {
    console.error('❌ Error al obtener datos de Firestore:', error.message);
  }
  
  console.log('\n🧪 Probando login con admin@feria.com...');
  try {
    await signInWithEmailAndPassword(auth, 'admin@feria.com', 'admin123');
    console.log('✅ Login exitoso con admin@feria.com / admin123');
  } catch (error) {
    console.log(`❌ Error de login: ${error.message}`);
    console.log('💡 Posibles problemas:');
    console.log('1. La contraseña no es "admin123"');
    console.log('2. El usuario no existe en Authentication');
    console.log('3. El usuario no está habilitado');
  }
  
  console.log('\n🧪 Probando login con vendedor1@feria.com...');
  try {
    await signInWithEmailAndPassword(auth, 'vendedor1@feria.com', 'vend123');
    console.log('✅ Login exitoso con vendedor1@feria.com / vend123');
  } catch (error) {
    console.log(`❌ Error de login: ${error.message}`);
  }
}

checkUsers().catch(console.error); 