export async function register() {
  console.log("[instrumentation] register() called, NEXT_RUNTIME =", process.env.NEXT_RUNTIME);
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
  console.log("[instrumentation] proxyUrl =", proxyUrl);
  if (!proxyUrl) return;

  const { ProxyAgent, setGlobalDispatcher } = await import("undici");
  setGlobalDispatcher(new ProxyAgent(proxyUrl));
  console.log("[instrumentation] global proxy dispatcher set");
}
