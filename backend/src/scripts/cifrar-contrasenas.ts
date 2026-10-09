// Cifra con bcrypt las contraseñas que todavía están en texto plano en la BD.
// Uso:  npm run cifrar-contrasenas
// Se puede ejecutar varias veces: las que ya están cifradas no se tocan.
import '../env';
import { RowDataPacket } from 'mysql2';
import { pool } from '../db';
import { cifrarContrasena, estaCifrada } from '../seguridad';

async function main() {
  const [usuarios] = await pool.query<RowDataPacket[]>(
    'SELECT id_usuario, email, contrasena_hash FROM usuario',
  );

  let cifradas = 0;
  for (const usuario of usuarios) {
    if (estaCifrada(usuario.contrasena_hash)) {
      continue;
    }
    const hash = await cifrarContrasena(usuario.contrasena_hash);
    await pool.query('UPDATE usuario SET contrasena_hash = ? WHERE id_usuario = ?', [hash, usuario.id_usuario]);
    cifradas++;
    console.log(`✔ ${usuario.email}`);
  }

  console.log(`\nListo: ${cifradas} contraseñas cifradas; ${usuarios.length - cifradas} ya estaban cifradas.`);
  await pool.end();
}

main().catch(async (error) => {
  console.error('Error:', error);
  await pool.end();
  process.exit(1);
});
