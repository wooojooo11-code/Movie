import { createClient } from 'npm:@supabase/supabase-js@2';

const DELETE_CONFIRMATION = '회원탈퇴';
const AVATAR_BUCKET = 'avatars';
const AVATAR_BATCH_SIZE = 100;

const corsHeaders = {
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Origin': '*'
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });

const removeAvatarFiles = async (
  adminClient: ReturnType<typeof createClient>,
  userId: string
) => {
  while (true) {
    const { data, error } = await adminClient.storage.from(AVATAR_BUCKET).list(userId, {
      limit: AVATAR_BATCH_SIZE,
      sortBy: { column: 'name', order: 'asc' }
    });

    if (error) throw error;
    if (!data?.length) return;

    const paths = data
      .filter((item) => item.id && item.name)
      .map((item) => `${userId}/${item.name}`);

    if (paths.length === 0) return;

    if (paths.length > 0) {
      const { error: removeError } = await adminClient.storage.from(AVATAR_BUCKET).remove(paths);
      if (removeError) throw removeError;
    }

    if (data.length < AVATAR_BATCH_SIZE) return;
  }
};

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed.' }, 405);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const authorization = request.headers.get('Authorization') ?? '';

  if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
    return json({ error: 'Required Edge Function secrets are not configured.' }, 500);
  }

  let payload: { confirmation?: unknown };
  try {
    payload = await request.json();
  } catch {
    return json({ error: 'Invalid JSON body.' }, 400);
  }

  if (payload.confirmation !== DELETE_CONFIRMATION) {
    return json({ error: 'Account deletion confirmation does not match.' }, 400);
  }

  const userClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false }
  });
  const {
    data: { user },
    error: userError
  } = await userClient.auth.getUser();

  if (userError || !user) {
    return json({ error: 'Authentication is required.' }, 401);
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  try {
    await removeAvatarFiles(adminClient, user.id);

    const { error: deleteError } = await adminClient.auth.admin.deleteUser(user.id, false);
    if (deleteError) throw deleteError;

    return json({ deleted: true });
  } catch (error) {
    console.error('Unable to delete the authenticated account.', error);
    return json({ error: 'Unable to delete the account.' }, 500);
  }
});
