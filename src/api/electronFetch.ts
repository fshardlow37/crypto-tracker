/**
 * Drop-in fetch wrapper: uses IPC when running in Electron, native fetch in browser.
 */
export async function electronFetch(
  url: string,
  init?: RequestInit
): Promise<Response> {
  if (window.electronAPI) {
    const headers: Record<string, string> = {};
    if (init?.headers) {
      const h = init.headers;
      if (h instanceof Headers) {
        h.forEach((v, k) => { headers[k] = v; });
      } else if (Array.isArray(h)) {
        h.forEach(([k, v]) => { headers[k] = v; });
      } else {
        Object.assign(headers, h);
      }
    }

    const result = await window.electronAPI.fetch(url, { headers });

    return {
      ok: result.ok,
      status: result.status,
      statusText: result.statusText,
      json: () => Promise.resolve(result.body),
      text: () => Promise.resolve(JSON.stringify(result.body)),
    } as Response;
  }

  return fetch(url, init);
}
