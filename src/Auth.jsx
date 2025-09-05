import React, { useState, useContext, createContext, useEffect } from 'react';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebaseConfig';

// Los ROLES ahora solo definen los permisos. La información del usuario vendrá de Firestore.
const ROLES = {
  ADMIN_PRINCIPAL: {
    name: 'Administrador Principal',
    permissions: [
      'view_all',
      'create_reservations',
      'cancel_reservations',
      'edit_reservations',
      'move_reservations',
      'verify_payments',
      'view_statistics',
      'edit_statistics',
      'export_data',
      'view_historic',
      'edit_historic',
      'view_full_history',
      'backup_restore',
      'convert_palcos',
      'access_all_reservations',
      'manage_qr'
    ]
  },
  ADMIN_SECUNDARIO: {
    name: 'Administrador Secundario',
    permissions: [
      'view_all',
      'create_reservations',
      'cancel_reservations',
      'edit_reservations',
      'move_reservations',
      'verify_payments',
      'view_statistics',
      'export_data',
      'view_historic',
      'edit_historic',
      'view_full_history',
      'backup_restore',
      'convert_palcos',
      'access_all_reservations',
      'manage_qr'
    ]
  },
  EMPLEADO: {
    name: 'Vendedor',
    permissions: [
      'create_reservations',
      'verify_payments',
      'view_own_statistics',
      'view_own_history',
      'view_map',
      'edit_own_reservations'
    ]
  }
};

// Contexto de autenticación
const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Contendrá el usuario de Firebase Auth
  const [userData, setUserData] = useState(null); // Contendrá tus datos custom (rol, nombre, permisos)
  const [loadingAuth, setLoadingAuth] = useState(true); // Para saber si ya se verificó la sesión

  useEffect(() => {
    // onAuthStateChanged es un listener que se ejecuta cuando el usuario inicia o cierra sesión
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Si el usuario está logueado en Firebase, buscamos sus datos adicionales en Firestore
        const userDocRef = doc(db, 'usuarios', firebaseUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const customData = userDocSnap.data();
          // Combinamos la info de Auth y Firestore
          setUser(firebaseUser);
          setUserData({
            ...customData, // rol, nombre, etc. de Firestore
            permissions: ROLES[customData.role]?.permissions || [], // Añadimos los permisos
            uid: firebaseUser.uid
          });
        } else {
          // El usuario existe en Firebase Auth, pero no tenemos registro de él en Firestore.
          // Esto es un caso raro, lo mejor es desloguear.
          console.error("Usuario autenticado pero sin datos en Firestore.");
          await signOut(auth);
        }
      } else {
        // No hay usuario logueado
        setUser(null);
        setUserData(null);
      }
      setLoadingAuth(false); // Terminamos de verificar
    });

    // Limpiamos el listener cuando el componente se desmonte
    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // No necesitamos hacer más, el onAuthStateChanged se encargará del resto.
      return { success: true };
    } catch (error) {
      console.error("Error en login:", error.code);
      return { success: false, error: "Correo o contraseña incorrectos." };
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setUserData(null);
  };

  const hasPermission = (permission) => {
    return userData?.permissions.includes(permission) || false;
  };

  // Funciones de permisos mejoradas
  const canEdit = (item) => {
    if (!userData) return false;
    // Administradores pueden editar todo
    if (hasPermission('edit_reservations')) return true;
    // Vendedores solo pueden editar sus propias reservas
    if (hasPermission('edit_own_reservations') && item?.vendedor === userData.vendedor) return true;
    return false;
  };

  const canCancel = (item) => {
    if (!userData) return false;
    // Solo administradores pueden cancelar
    return hasPermission('cancel_reservations');
  };

  const canConvertPalcos = () => {
    if (!userData) return false;
    // Solo administradores pueden cambiar tipo de palcos
    return hasPermission('convert_palcos');
  };

  const canViewFullHistory = () => {
    if (!userData) return false;
    // Solo administradores pueden ver historial completo
    return hasPermission('view_full_history');
  };

  const canViewAllStatistics = () => {
    if (!userData) return false;
    // Solo administradores pueden ver estadísticas de todos
    return hasPermission('view_statistics');
  };

  const canViewOwnStatistics = () => {
    if (!userData) return false;
    // Vendedores pueden ver sus propias estadísticas
    return hasPermission('view_own_statistics');
  };

  const canViewAllHistory = () => {
    if (!userData) return false;
    // Solo administradores pueden ver historial de todos
    return hasPermission('view_historic');
  };

  const canViewOwnHistory = () => {
    if (!userData) return false;
    // Vendedores pueden ver su propio historial
    return hasPermission('view_own_history');
  };

  const canExportData = () => {
    if (!userData) return false;
    // Solo administradores pueden exportar
    return hasPermission('export_data');
  };

  const canBackupRestore = () => {
    if (!userData) return false;
    // Solo administradores pueden hacer backup/restore
    return hasPermission('backup_restore');
  };

  const canManageQR = () => {
    if (!userData) return false;
    // Solo administradores pueden gestionar QR
    return hasPermission('manage_qr');
  };

  const value = {
    user: userData, // Pasamos nuestros datos combinados como 'user' para no romper el resto de tu app
    loadingAuth,
    login,
    logout,
    hasPermission,
    canEdit,
    canCancel,
    canConvertPalcos,
    canViewFullHistory,
    canViewAllStatistics,
    canViewOwnStatistics,
    canViewAllHistory,
    canViewOwnHistory,
    canExportData,
    canBackupRestore,
    canManageQR
  };
  
  // Mientras verifica la sesión, puedes mostrar un loader para evitar parpadeos
  if (loadingAuth) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '3px solid rgba(255, 255, 255, 0.3)',
          borderTop: '3px solid white',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const LoginForm = () => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // La función 'login' ahora es asíncrona y habla con Firebase
    const result = await login(formData.email, formData.password);
    
    if (!result.success) {
      setError(result.error);
      setLoading(false);
    }
    // Si tiene éxito, el AuthProvider se encarga del resto, no necesitamos hacer nada aquí.
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)',
      backgroundSize: '400% 400%',
      animation: 'gradientShift 15s ease infinite',
      padding: '20px'
    }}>
      <style>
        {`
          @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      
      <div style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 0.95))',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        padding: '40px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        maxWidth: '400px',
        width: '100%',
        animation: 'fadeInUp 0.6s ease-out',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Efecto de brillo en la parte superior */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: 'linear-gradient(90deg, transparent, rgba(52, 152, 219, 0.8), transparent)'
        }} />

        {/* Logo y título */}
        <div style={{
          textAlign: 'center',
          marginBottom: '32px'
        }}>
          <div style={{
            fontSize: '3rem',
            marginBottom: '16px',
            animation: 'pulse 2s infinite'
          }}>
            🏇
          </div>
          <h1 style={{
            fontSize: '2.2rem',
            fontWeight: '800',
            margin: '0 0 8px 0',
            background: 'linear-gradient(135deg, #2c3e50, #3498db)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
          }}>
            Sistema de Reservas
          </h1>
          <p style={{
            color: '#7f8c8d',
            fontSize: '1.1rem',
            margin: '0',
            fontWeight: '500'
          }}>
            Exposición Equina Tenjo 2025
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} style={{ marginBottom: '24px' }}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '600',
              color: '#2c3e50',
              fontSize: '1rem'
            }}>
              Correo Electrónico
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              style={{
                width: '100%',
                padding: '14px 16px',
                border: '2px solid rgba(52, 152, 219, 0.2)',
                borderRadius: '12px',
                fontSize: '1rem',
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s ease',
                boxSizing: 'border-box',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                color: '#2c3e50'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#3498db';
                e.target.style.boxShadow = '0 0 0 3px rgba(52, 152, 219, 0.2)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(52, 152, 219, 0.2)';
                e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
              }}
              placeholder="Ingresa tu correo"
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '600',
              color: '#2c3e50',
              fontSize: '1rem'
            }}>
              Contraseña
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              style={{
                width: '100%',
                padding: '14px 16px',
                border: '2px solid rgba(52, 152, 219, 0.2)',
                borderRadius: '12px',
                fontSize: '1rem',
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s ease',
                boxSizing: 'border-box',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                color: '#2c3e50'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#3498db';
                e.target.style.boxShadow = '0 0 0 3px rgba(52, 152, 219, 0.2)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(52, 152, 219, 0.2)';
                e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
              }}
              placeholder="Ingresa tu contraseña"
            />
          </div>

          {error && (
            <div style={{
              background: 'linear-gradient(135deg, #e74c3c, #c0392b)',
              color: 'white',
              padding: '12px 16px',
              borderRadius: '10px',
              marginBottom: '20px',
              fontSize: '0.9rem',
              fontWeight: '600',
              textAlign: 'center',
              boxShadow: '0 4px 12px rgba(231, 76, 60, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              ❌ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '16px',
              background: 'linear-gradient(135deg, #3498db, #2980b9)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '1.1rem',
              fontWeight: '700',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 4px 16px rgba(52, 152, 219, 0.4)',
              position: 'relative',
              overflow: 'hidden',
              opacity: loading ? 0.7 : 1
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 25px rgba(52, 152, 219, 0.5)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 16px rgba(52, 152, 219, 0.4)';
              }
            }}
          >
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                Iniciando sesión...
              </div>
            ) : (
              '🚀 Iniciar Sesión'
            )}
          </button>
        </form>



        {/* Footer */}
        <div style={{
          textAlign: 'center',
          padding: '16px 0 0 0',
          borderTop: '1px solid rgba(52, 152, 219, 0.1)'
        }}>
          <p style={{
            margin: '0',
            fontSize: '0.9rem',
            color: '#95a5a6',
            fontWeight: '500'
          }}>
            © 2025 Sistema de Reservas Equinas
          </p>
          <p style={{
            margin: '4px 0 0 0',
            fontSize: '0.8rem',
            color: '#bdc3c7'
          }}>
            Desarrollado con ❤️ para Tenjo
          </p>
          

        </div>
      </div>
    </div>
  );
};

export const ProtectedComponent = ({ 
  permission, 
  children, 
  fallback = null
}) => {
  const { hasPermission } = useAuth();
  
  if (!hasPermission(permission)) {
    return fallback;
  }
  
  return children;
};

export const UserHeader = () => {
  const { user, logout } = useAuth();

  const getRoleColor = (role) => {
    switch (role) {
      case 'ADMIN_PRINCIPAL': return 'linear-gradient(135deg, #e74c3c, #c0392b)';
      case 'ADMIN_SECUNDARIO': return 'linear-gradient(135deg, #f39c12, #e67e22)';
      case 'EMPLEADO': return 'linear-gradient(135deg, #27ae60, #2ecc71)';
      default: return 'linear-gradient(135deg, #95a5a6, #7f8c8d)';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'ADMIN_PRINCIPAL': return '👑';
      case 'ADMIN_SECUNDARIO': return '⚡';
      case 'EMPLEADO': return '👤';
      default: return '❓';
    }
  };

  if (!user) return null;

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(52, 152, 219, 0.1), rgba(41, 128, 185, 0.1))',
      borderRadius: '16px',
      padding: '16px 20px',
      marginBottom: '20px',
      border: '1px solid rgba(52, 152, 219, 0.2)',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
      backdropFilter: 'blur(10px)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Efecto de brillo */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '1px',
        background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent)'
      }} />

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: getRoleColor(user.role),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: '700',
            fontSize: '1.2rem',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
            border: '2px solid rgba(255, 255, 255, 0.3)'
          }}>
            {getRoleIcon(user.role)}
          </div>
          
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}>
            <div style={{
              fontWeight: '700',
              color: '#2c3e50',
              fontSize: '1.1rem',
              textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)'
            }}>
              {user.name}
            </div>
            <div style={{
              fontSize: '0.9rem',
              color: '#7f8c8d',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <span style={{
                background: getRoleColor(user.role),
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontWeight: '600'
              }}>
                {ROLES[user.role]?.name}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={logout}
          style={{
            background: 'linear-gradient(135deg, #e74c3c, #c0392b)',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '8px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 2px 8px rgba(231, 76, 60, 0.3)',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 4px 12px rgba(231, 76, 60, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 2px 8px rgba(231, 76, 60, 0.3)';
          }}
        >
          🚪 Cerrar Sesión
        </button>
      </div>
    </div>
  );
};