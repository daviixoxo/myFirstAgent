// supabaseClient.js — acá se crea el cliente de Supabase que van a usar datos.js y gestion.js
//
// Pasos para conectarlo a TU proyecto:
// 1) entrá a https://supabase.com/dashboard y abrí tu proyecto (o creá uno nuevo)
// 2) ve a Project Settings > API
// 3) copiá la "Project URL" y la key "anon public", y pegalas abajo
//    (NUNCA uses la "service_role" key acá, esa es secreta y es solo para el backend)

const SUPABASE_URL = 'https://dkdjhdujnzwxnyjlnhxx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRrZGpoZHVqbnp3eG55amxuaHh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIxMTE4NDUsImV4cCI6MjEwNzY4Nzg0NX0.btzKbf7EFzFuoDJuhMFCCmFLigKr_m446zIKxLFJL3o';

// "supabase" ya existe como variable global gracias al script del CDN (supabase-js)
// que se carga antes que este archivo en index.html / prueba.html.
// "db" es el cliente ya conectado a tu proyecto — lo usan datos.js y prueba.js
const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);