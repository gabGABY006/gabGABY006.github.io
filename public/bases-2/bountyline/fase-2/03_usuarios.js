// =====================================================================
// BountyLine - MongoDB: usuarios
//   bountyline_admin: administrador del servidor (rol root).
//   bountyline_app:   la aplicación; solo lee y escribe en la base bountyline.
// Se ejecuta antes de activar la autenticación (security.authorization).
// Ejecutar con: mongosh 03_usuarios.js
// =====================================================================
const admin = db.getSiblingDB('admin');

for (const u of ['bountyline_admin', 'bountyline_app']) {
  if (admin.getUser(u)) {
    admin.dropUser(u);
  }
}

admin.createUser({
  user: 'bountyline_admin',
  pwd: '<CONTRASENA_LOCAL>',
  roles: [{ role: 'root', db: 'admin' }]
});

admin.createUser({
  user: 'bountyline_app',
  pwd: '<CONTRASENA_LOCAL>',
  roles: [{ role: 'readWrite', db: 'bountyline' }]
});

print('Usuarios: ' + admin.getUsers().users.map(u => u.user).join(', '));
