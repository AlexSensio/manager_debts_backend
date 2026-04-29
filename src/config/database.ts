import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI não definida nas variáveis de ambiente');
  }

  try {
    await mongoose.connect(uri);
    console.log('✅ MongoDB conectado com sucesso');
  } catch (error) {
    console.error('❌ Erro ao conectar no MongoDB:', error);
    process.exit(1);
  }

  mongoose.connection.on('disconnected', () => {
    console.warn('⚠️  MongoDB desconectado');
  });

  mongoose.connection.on('error', (err) => {
    console.error('❌ Erro de conexão MongoDB:', err);
  });
};

export default connectDB;
