import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { PromiseHttpClient } from './promise-http-client';

describe('PromiseHttpClient', () => {
  let client: PromiseHttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    client = TestBed.inject(PromiseHttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('resolves get() with the response body', async () => {
    const promise = client.get<{ id: number }>('/api/things/1');

    httpMock.expectOne('/api/things/1').flush({ id: 1 });

    await expect(promise).resolves.toEqual({ id: 1 });
  });

  it('sends post() body and resolves with the response', async () => {
    const promise = client.post<{ ok: boolean }>('/api/things', { name: 'a' });

    const req = httpMock.expectOne('/api/things');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ name: 'a' });
    req.flush({ ok: true });

    await expect(promise).resolves.toEqual({ ok: true });
  });

  it('rejects on HTTP errors', async () => {
    const promise = client.get('/api/things/missing');

    httpMock.expectOne('/api/things/missing').flush('not found', {
      status: 404,
      statusText: 'Not Found',
    });

    await expect(promise).rejects.toMatchObject({ status: 404 });
  });

  it('sends delete() with an optional body', async () => {
    const promise = client.delete('/api/things/1', { body: { reason: 'cleanup' } });

    const req = httpMock.expectOne('/api/things/1');
    expect(req.request.method).toBe('DELETE');
    expect(req.request.body).toEqual({ reason: 'cleanup' });
    req.flush(null);

    await promise;
  });
});
