
import { AxiosClient } from '../http/axios.client';

async function testWikipediaConnection() {
  const http = new AxiosClient('https://en.wikipedia.org/api/rest_v1');

  try {
    const data = await http.get<any>('/page/summary/London');
    console.log('✅ Conexão bem-sucedida!');
    console.log('Título:', data.title);
    console.log('Descrição:', data.description);
  } catch (error: any) {
    console.error('❌ Erro ao conectar com a API da Wikipedia:');
    console.error(error.message);
  }
}

testWikipediaConnection();
