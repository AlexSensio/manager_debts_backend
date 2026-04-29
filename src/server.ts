import 'dotenv/config';
import app from './app';
import connectDB from './config/database';

const PORT = process.env.PORT || 3000;

const start = async (): Promise<void> => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  });
};

start().catch((error) => {
  console.error('❌ Falha ao iniciar o servidor:', error);
  process.exit(1);
});
