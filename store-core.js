import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SUPABASE_URL, SUPABASE_ANON_KEY, validarConfiguracao } from "./supabase-config.js";

if (!validarConfiguracao()) {
  document.body.insertAdjacentHTML("afterbegin",
    '<div style="padding:12px;background:#fff3cd;color:#664d03;text-align:center">Configure a URL e a chave pública do Supabase no arquivo supabase-config.js.</div>');
  throw new Error("Configuração do Supabase ausente.");
}
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
export const money = value => Number(value || 0).toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
export const escapeHTML = value => String(value ?? "").replace(/[&<>"']/g, c =>
  ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
