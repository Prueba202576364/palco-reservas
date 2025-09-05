// Script para configurar usuarios en Firestore
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

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
const db = getFirestore(app);

// Datos de los usuarios con sus UIDs correctos
const users = [
  {
    uid: "CqmzC70LCSYZlD1S8JCm182NaXc2",
    email: "admin@feria.com",
    role: "ADMIN_PRINCIPAL",
    name: "Administrador Principal",
    vendedor: "Sistema"
  },
  {
    uid: "u64LQzt1xiU0nqA9HQjBOC9HfGq2",
    email: "admin2@feria.com",
    role: "ADMIN_SECUNDARIO",
    name: "Administrador Secundario",
    vendedor: "Admin Secundario"
  },
  {
    uid: "qWIHrOlq7LNjrHqMdiXD8LKZGDN2",
    email: "vendedor1@feria.com",
    role: "EMPLEADO",
    name: "Juan Pérez",
    vendedor: "Juan Pérez"
  },
  {
    uid: "COcXdfm93pQZQPc3RCuBEFWXbsq2",
    email: "vendedor2@feria.com",
    role: "EMPLEADO",
    name: "María González",
    vendedor: "María González"
  },
  {
    uid: "69BUDwduq9OzjJtTfdhnpu3zemd2",
    email: "vendedor3@feria.com",
    role: "EMPLEADO",
    name: "Carlos Rodríguez",
    vendedor: "Carlos Rodríguez"
  },
  {
    uid: "9aNFr7cVrZUmRkivwn8Ybq56sbQ2",
    email: "vendedor4@feria.com",
    role: "EMPLEADO",
    name: "Ana Martínez",
    vendedor: "Ana Martínez"
  }
];

async function setupFirestoreUsers() {
  console.log('🚀 Configurando usuarios en Firestore...\n');
  
  for (const userData of users) {
    try {
      console.log(`📝 Creando documento para: ${userData.email}`);
      
      // Crear documento en Firestore
      await setDoc(doc(db, 'usuarios', userData.uid), {
        email: userData.email,
        role: userData.role,
        name: userData.name,
        vendedor: userData.vendedor,
        createdAt: new Date()
      });
      
      console.log(`✅ Documento creado para: ${userData.email} (${userData.role})`);
      
    } catch (error) {
      console.error(`❌ Error creando documento para ${userData.email}:`, error.message);
    }
  }
  
  console.log('\n🎉 Configuración de Firestore completada!');
  console.log('\n📋 Credenciales para login:');
  console.log('- admin@feria.com / admin123');
  console.log('- admin2@feria.com / admin456');
  console.log('- vendedor1@feria.com / vend123');
  console.log('- vendedor2@feria.com / vend456');
  console.log('- vendedor3@feria.com / vend321');
  console.log('- vendedor4@feria.com / vend410');
}

setupFirestoreUsers().catch(console.error); 