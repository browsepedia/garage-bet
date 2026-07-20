import { HttpClient, type HttpClientCommonOptions } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

/**
 * Options for the typed JSON, single-value ("body") case — the same shape `HttpClient`
 * accepts on its default `get`/`post`/etc. overloads, minus `observe`/`responseType` since
 * this client always resolves the parsed JSON body.
 */
export type PromiseHttpOptions = Omit<HttpClientCommonOptions, 'observe' | 'responseType'> & {
  responseType?: 'json';
};

export type PromiseHttpDeleteOptions = PromiseHttpOptions & { body?: unknown };

/**
 * Promise-returning mirror of `HttpClient`. Method names and parameter order match
 * `HttpClient` exactly; each call delegates to the real `HttpClient` and unwraps the
 * observable with `firstValueFrom`.
 *
 * `firstValueFrom` (not `lastValueFrom`) is correct here: these requests observe the
 * `'body'`, so the underlying observable emits exactly one value and completes, making the
 * two equivalent — `firstValueFrom` is preferred because it unsubscribes the moment that
 * value arrives instead of waiting for a completion that's already effectively happened.
 *
 * Only the typed-JSON, single-value overloads are mirrored. `observe: 'events' | 'response'`
 * and non-JSON `responseType`s (`arraybuffer`/`blob`/`text`) don't reduce to a single Promise
 * value (progress events in particular are a stream, not a result) — use `HttpClient`
 * directly for those.
 */
@Injectable({ providedIn: 'root' })
export class PromiseHttpClient {
  private readonly http = inject(HttpClient);

  request<T>(
    method: string,
    url: string,
    options?: PromiseHttpOptions & { body?: unknown },
  ): Promise<T> {
    return firstValueFrom(this.http.request<T>(method, url, options));
  }

  get<T>(url: string, options?: PromiseHttpOptions): Promise<T> {
    return firstValueFrom(this.http.get<T>(url, options));
  }

  post<T>(url: string, body: unknown | null, options?: PromiseHttpOptions): Promise<T> {
    return firstValueFrom(this.http.post<T>(url, body, options));
  }

  put<T>(url: string, body: unknown | null, options?: PromiseHttpOptions): Promise<T> {
    return firstValueFrom(this.http.put<T>(url, body, options));
  }

  patch<T>(url: string, body: unknown | null, options?: PromiseHttpOptions): Promise<T> {
    return firstValueFrom(this.http.patch<T>(url, body, options));
  }

  delete<T>(url: string, options?: PromiseHttpDeleteOptions): Promise<T> {
    return firstValueFrom(this.http.delete<T>(url, options));
  }

  head<T>(url: string, options?: PromiseHttpOptions): Promise<T> {
    return firstValueFrom(this.http.head<T>(url, options));
  }

  options<T>(url: string, options?: PromiseHttpOptions): Promise<T> {
    return firstValueFrom(this.http.options<T>(url, options));
  }
}
