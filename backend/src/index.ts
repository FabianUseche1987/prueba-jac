import './env'; // primero: carga el .env
import app from './app';

const PORT = Number(process.env.PORT ?? 3000);

app.listen(PORT, () => {
  console.log(`API de JAC Connect funcionando en http://localhost:${PORT}`);
});
