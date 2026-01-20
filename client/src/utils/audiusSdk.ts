import Web3 from "web3";

// Expose Web3 on window for libs that expect it
// @ts-ignore
window.Web3 = Web3;

// audius sdk uses some Node-style globals (global, Buffer, process).
// Static ESM imports are hoisted, so we must NOT import the SDK at module
// top-level. Instead set up small shims first and then dynamically import
// the SDK inside an async initializer so browser-only globals exist.

let audiusSdk: any = null;

const initAudiusSdk = async () => {
  // Ensure `global` exists (some node libs reference global)
  try {
    (window as any).global = window as any;
  } catch (e) {
    // ignore
  }

  // Polyfill Buffer if not present (some crypto shims expect Buffer)
  if (!(window as any).Buffer) {
    try {
      const bufferMod = await import("buffer");
      (window as any).Buffer = bufferMod.Buffer;
    } catch (e) {
      // ignore if buffer isn't available
    }
  }

  // Polyfill process if not present (some libs check process.env)
  if (!(window as any).process) {
    try {
      const procMod = await import("process");
      // process module may export default or named
      (window as any).process =
        (procMod && (procMod as any).default) || procMod;
    } catch (e) {
      // ignore
    }
  }

  // Now dynamically import the audius sdk after shims are in place
  try {
    // @ts-ignore - module has no type declarations
    const audius = await import("@audius/sdk");
    // sdk is a named export on the package
    const { sdk } = audius as any;
    audiusSdk = sdk({
      appName: import.meta.env.VITE_AUDIUS_APP_NAME,
      apiKey: import.meta.env.VITE_AUDIUS_API_KEY,
    });
  } catch (e) {
    // keep audiusSdk null on failure; calling code should handle this
    // (optionally log or surface the error in dev)
    // console.error('Failed to initialize Audius SDK', e);
  }
};

// Initialize but don't block module evaluation — callers should handle
// the fact that `audiusSdk` may be null until initialization completes.
const audiusSdkReady = initAudiusSdk();

// Export a promise callers can await to know when the SDK is ready.
export { audiusSdk, audiusSdkReady };
