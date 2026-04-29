export function verifyEmailErrorPage(message: string, status: number): string {
  const safe = message.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Could not verify — Garage Bet</title>
<style>
  body{font-family:system-ui,sans-serif;background:#111418;color:#f1f5f9;margin:0;padding:40px 16px;}
  .card{max-width:420px;margin:0 auto;background:#13161a;border:1px solid #7f1d1d;border-radius:12px;padding:28px;}
  h1{font-size:1.35rem;margin:0 0 12px;color:#f87171;}
  p{margin:0;line-height:1.6;color:#a1a1aa;font-size:15px;}
  code{font-size:12px;color:#94a3b8;}
</style></head><body><div class="card"><h1>Verification failed</h1><p>${safe}</p>
<p class="muted"><code>HTTP ${status}</code></p></div></body></html>`;
}
