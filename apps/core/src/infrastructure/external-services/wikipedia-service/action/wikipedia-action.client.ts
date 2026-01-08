import { AxiosClient } from '../../http/axios.client';

export class WikipediaActionClient extends AxiosClient {
  constructor(language: string = 'pt') {
    super(`https://${language}.wikipedia.org/w/api.php`);
  }

  async query(params: any): Promise<any> {
    return this.get('', {
      ...params,
      action: 'query',
      format: 'json',
      origin: '*',
    });
  }
}
