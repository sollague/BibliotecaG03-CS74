import { app } from './app.js';
import { env } from './config/env.js';
import { prisma } from './config/prisma.js';

const servidor = app.listen(env.PORT, () => {
  console.log(`API Biblioteca G03 disponible en http://localhost:${env.PORT}`);
});

async function cerrar(senal) {
  console.log(`\n${senal} recibido. Cerrando servidor...`);
  servidor.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on('SIGINT', () => cerrar('SIGINT'));
process.on('SIGTERM', () => cerrar('SIGTERM'));
