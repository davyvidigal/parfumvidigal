// 1) Cole aqui os dados do seu projeto Supabase (Project Settings > API).
// Use a Project URL e a chave Publishable/anon. NUNCA use service_role/secret no navegador.
export const SUPABASE_URL = "https://fdvjardfdcpupgbicnhd.supabase.co";
export const SUPABASE_ANON_KEY = "sb_publishable_dJxdIhIgyNXjFzQLTT3nag_23p96BUe";

export function validarConfiguracao() {
  return SUPABASE_URL.startsWith("https://") &&
    !SUPABASE_URL.includes("COLE_AQUI") &&
    SUPABASE_ANON_KEY.length > 20 &&
    !SUPABASE_ANON_KEY.includes("COLE_AQUI");
}
