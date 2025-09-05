import React, { useState, useContext, createContext } from 'react';

// Definir los roles y permisos
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
      'backup_restore',
      'convert_palcos'
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
      'backup_restore',
      'convert_palcos'
    ]
  },
  EMPLEADO: {
    name: 'Empleado',
    permissions: [
      'create_reservations',
      'verify_payments',
      'view_own_sales'
    ]
  }
};

// Usuarios predefinidos (en producción esto vendría de una base de datos)
const USERS = {
  'admin': { 
    password: 'admin123', 
    role: 'ADMIN_PRINCIPAL', 
    name: 'Administrador Principal',
    vendedor: 'Sistema'
  },
  'admin2': { 
    password: 'admin456', 
    role: 'ADMIN_SECUNDARIO', 
    name: 'Administrador Secundario',
    vendedor: 'Admin Secundario'
  },
  'vendedor1': { 
    password: 'vend123', 
    role: 'EMPLEADO', 
    name: 'Juan Pérez',
    vendedor: 'Juan Pérez'
  },
  'vendedor2': { 
    password: 'vend456', 
    role: 'EMPLEADO', 
    name: 'María González',
    vendedor: 'María González'
  }
};

// Contexto de autenticación
const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Verificar si hay una sesión guardada
    const savedUser = localStorage.getItem('feriaUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = (username, password) => {
    const userData = USERS[username];
    if (userData && userData.password === password) {
      const userSession = {
        username,
        role: userData.role,
        name: userData.name,
        vendedor: userData.vendedor,
        permissions: ROLES[userData.role].permissions
      };
      setUser(userSession);
      localStorage.setItem('feriaUser', JSON.stringify(userSession));
      return { success: true };
    }
    return { success: false, error: 'Usuario o contraseña incorrectos' };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('feriaUser');
  };

  const hasPermission = (permission) => {
    return user?.permissions?.includes(permission) || false;
  };

  const canEdit = (item) => {
    // Los empleados solo pueden editar sus propias ventas
    if (user?.role === 'EMPLEADO') {
      return item?.vendedor === user.vendedor;
    }
    return hasPermission('edit_reservations');
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      hasPermission,
      canEdit,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Componente de Login
export const LoginForm = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 1000));

    const result = login(credentials.username, credentials.password);
    
    if (!result.success) {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f8f9fa',
      backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '16px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '400px',
        textAlign: 'center'
      }}>
        <div style={{ marginBottom: '30px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🐎</div>
          <h1 style={{ margin: 0, color: '#333', fontSize: '24px' }}>
            Feria Expoequinos
          </h1>
          <p style={{ color: '#666', margin: '8px 0 0 0' }}>
            Sistema de Gestión de Palcos
          </p>
        </div>

        <div>
          <div style={{ marginBottom: '20px', textAlign: 'left' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '6px', 
              fontWeight: '500',
              color: '#333'
            }}>
              Usuario:
            </label>
            <input
              type="text"
              required
              value={credentials.username}
              onChange={(e) => setCredentials({...credentials, username: e.target.value})}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e1e5e9',
                borderRadius: '8px',
                fontSize: '16px',
                outline: 'none',
                transition: 'border-color 0.2s ease',
                boxSizing: 'border-box'
              }}
              placeholder="Ingresa tu usuario"
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#e1e5e9'}
            />
          </div>

          <div style={{ marginBottom: '20px', textAlign: 'left' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '6px', 
              fontWeight: '500',
              color: '#333'
            }}>
              Contraseña:
            </label>
            <input
              type="password"
              required
              value={credentials.password}
              onChange={(e) => setCredentials({...credentials, password: e.target.value})}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e1e5e9',
                borderRadius: '8px',
                fontSize: '16px',
                outline: 'none',
                transition: 'border-color 0.2s ease',
                boxSizing: 'border-box'
              }}
              placeholder="Ingresa tu contraseña"
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#e1e5e9'}
            />
          </div>

          {error && (
            <div style={{
              backgroundColor: '#f8d7da',
              color: '#721c24',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '20px',
              fontSize: '14px',
              border: '1px solid #f5c6cb'
            }}>
              ❌ {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: loading ? '#94a3b8' : '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            {loading && (
              <div style={{
                width: '16px',
                height: '16px',
                border: '2px solid transparent',
                borderTop: '2px solid white',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
            )}
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </div>

        {/* Credenciales de prueba */}
        <div style={{
          marginTop: '30px',
          padding: '16px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          fontSize: '12px',
          textAlign: 'left'
        }}>
          <strong>Credenciales de prueba:</strong>
          <div style={{ marginTop: '8px' }}>
            <div><strong>Admin Principal:</strong> admin / admin123</div>
            <div><strong>Admin Secundario:</strong> admin2 / admin456</div>
            <div><strong>Empleado 1:</strong> vendedor1 / vend123</div>
            <div><strong>Empleado 2:</strong> vendedor2 / vend456</div>
          </div>
        </div>

        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
};

// Componente para proteger rutas/componentes
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

// Componente del header con información del usuario
export const UserHeader = () => {
  const { user, logout } = useAuth();

  const getRoleColor = (role) => {
    switch (role) {
      case 'ADMIN_PRINCIPAL': return '#e74c3c';
      case 'ADMIN_SECUNDARIO': return '#f39c12';
      case 'EMPLEADO': return '#3498db';
      default: return '#666';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'ADMIN_PRINCIPAL': return '👑';
      case 'ADMIN_SECUNDARIO': return '🛡️';
      case 'EMPLEADO': return '👤';
      default: return '🔒';
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      padding: '12px 20px',
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      border: `2px solid ${getRoleColor(user.role)}`
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <span style={{ fontSize: '24px' }}>{getRoleIcon(user.role)}</span>
        <div>
          <div style={{ fontWeight: '600', color: '#333' }}>
            {user.name}
          </div>
          <div style={{ 
            fontSize: '12px', 
            color: getRoleColor(user.role),
            fontWeight: '500'
          }}>
            {ROLES[user.role].name}
          </div>
        </div>
      </div>

      <button
        onClick={logout}
        style={{
          padding: '6px 12px',
          backgroundColor: '#e74c3c',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          fontSize: '12px',
          cursor: 'pointer',
          fontWeight: '500'
        }}
      >
        🚪 Cerrar Sesión
      </button>
    </div>
  );
};

// Ejemplo de aplicación con roles
export const ExampleRoleApp = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return (
    <div style={{ padding: '20px' }}>
      <UserHeader />
      
      <div style={{ marginTop: '20px' }}>
        <h2>Panel de Control</h2>
        
        {/* Solo admins pueden ver estadísticas */}
        <ProtectedComponent permission="view_statistics">
          <div style={{ 
            padding: '16px', 
            backgroundColor: '#e8f5e8', 
            borderRadius: '8px',
            marginBottom: '16px'
          }}>
            <h3>📊 Estadísticas</h3>
            <p>Aquí van las estadísticas...</p>
            
            {/* Solo admin principal puede editar estadísticas */}
            <ProtectedComponent permission="edit_statistics">
              <button style={{
                padding: '8px 16px',
                backgroundColor: '#e74c3c',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}>
                ✏️ Editar Estadísticas
              </button>
            </ProtectedComponent>
          </div>
        </ProtectedComponent>

        {/* Todos pueden crear reservas */}
        <ProtectedComponent permission="create_reservations">
          <div style={{ 
            padding: '16px', 
            backgroundColor: '#e8f4fd', 
            borderRadius: '8px',
            marginBottom: '16px'
          }}>
            <h3>🎫 Crear Reservas</h3>
            <p>Todos los usuarios pueden crear reservas...</p>
          </div>
        </ProtectedComponent>

        {/* Solo admins pueden hacer backup */}
        <ProtectedComponent permission="backup_restore">
          <div style={{ 
            padding: '16px', 
            backgroundColor: '#fff3e0', 
            borderRadius: '8px'
          }}>
            <h3>💾 Backup y Restauración</h3>
            <p>Solo administradores pueden hacer backup...</p>
          </div>
        </ProtectedComponent>
      </div>
    </div>
  );
};

export default ExampleRoleApp;



