// supabase-config.ts

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Context } from 'hono';

// 1. Define the User and Hono Environment Types
export type SupabaseUser = {
  id: string;
  email: string;
  name?: string;
};

// Assuming your Cloudflare Worker 'Env' includes your Supabase secrets
export type HonoEnv = {
  Bindings: {
    SUPABASE_URL: string;
    SUPABASE_ANON_KEY: string;
    // ... any other bindings ...
  };
  Variables: {
    user: SupabaseUser; // Where the authenticated user will be stored
    supabase: SupabaseClient; // The initialized client
  };
};

// 2. Client Initialization Function
// In Hono/Workers, we initialize the client using the environment variables (Bindings).
const getSupabaseClient = (env: HonoEnv['Bindings']): SupabaseClient => {
    return createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
};

// 3. Client Injection Middleware
// This middleware initializes the Supabase client and makes it available
// on the Hono context (c.get('supabase')).
export const supabaseClientMiddleware = async (c: Context<HonoEnv>, next: any) => {
    // Initialize client and attach to the context variables
    c.set('supabase', getSupabaseClient(c.env));
    await next();
};

// 4. Authentication Middleware
// This middleware replaces Mocha's authMiddleware, using the real Supabase client.
export const supabaseAuthMiddleware = async (c: Context<HonoEnv>, next: any) => {
    // We expect the client to be available from the previous middleware
    const supabase = c.get('supabase');

    // Supabase auth tokens are usually sent in the Authorization header.
    const token = c.req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return c.json({ error: "Unauthorized: Missing token" }, 401);
    }

    // Verify the token using the Supabase service
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
        console.error("Supabase Auth Error:", error?.message);
        return c.json({ error: "Unauthorized: Invalid session" }, 401);
    }

    // Attach the clean user object to the context for use in routes
    c.set('user', {
        id: user.id,
        email: user.email!,
        // Supabase user_metadata is where fields like 'name' are stored
        name: user.user_metadata.name as string
    });

    await next();
};