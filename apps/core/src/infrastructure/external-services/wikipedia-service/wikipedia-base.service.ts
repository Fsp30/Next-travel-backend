import { BaseService } from '../../shared';
import { AxiosClient } from '../http/axios.client';

export abstract class WikipediaBaseService<
  I = void,
  O = void,
> extends BaseService<I, O> {
  protected readonly http: AxiosClient;
  protected readonly language: string;

  constructor(language: string = 'pt') {
    super();
    this.language = language;
    this.http = new AxiosClient(
      `https://${language}.wikipedia.org/api/rest_v1`
    );
  }
}
