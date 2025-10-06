import { Hono } from "hono";
import { cors } from "hono/cors";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

// Import types and middlewares from the realistic configuration
import {
  HonoEnv,
  supabaseClientMiddleware,
  supabaseAuthMiddleware,
} from '../supabase-config'; 

// Assuming these shared types were modified to be database-agnostic
import {
  UserRoleSchema,
  CreateServiceSchema,
  SetAvailabilitySchema,
  CreateBookingSchema,
} from "../../shared/types";


const app = new Hono<HonoEnv>();

// --- GLOBAL MIDDLEWARES ---

// Enable CORS
app.use("*", cors({
  origin: (origin) => origin,
  allowHeaders: ["Content-Type", "Authorization"],
  allowMethods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));

// Inject the Supabase client into the context for ALL routes
app.use(supabaseClientMiddleware);


// --- AUTH/SESSION ENDPOINT ---

app.post("/api/sessions", async (c) => {
  // This route is typically only used for special server-side token exchanges
  // or to validate a code from an OAuth provider using Supabase's PKCE flow.
  // For standard API usage, the client handles login and sends a Bearer token.
  return c.json({ success: true, message: "Authentication handled client-side or via Authorization header." }, 200);
});


// ------------------------------------------------------------------
// USER ROLE MANAGEMENT
// ------------------------------------------------------------------

app.get('/api/users/role', supabaseAuthMiddleware, async (c) => {
  const user = c.get('user');
  const supabase = c.get('supabase'); // Access the injected client
  
  const { data: userData, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  if (error) return c.json({ error: error.message }, 500);
  if (!userData) return c.json({ error: 'User profile not found in database' }, 404);

  return c.json({ role: userData.role });
});

app.put('/api/users/role', supabaseAuthMiddleware, zValidator('json', z.object({ role: UserRoleSchema })), async (c) => {
  const user = c.get('user');
  const supabase = c.get('supabase');
  const { role } = c.req.valid('json');

  // Upsert user in the `users` table
  const { error: userError } = await supabase
    .from('users')
    .upsert({
      id: user.id,
      email: user.email,
      name: user.name || '',
      role: role,
    }, { onConflict: 'id' });

  if (userError) return c.json({ error: 'Failed to update user role: ' + userError.message }, 500);

  // If becoming an expert, create expert profile
  if (role === 'expert') {
    await supabase
      .from('expert_profiles')
      // use upsert with ignoreDuplicates: true for 'ON CONFLICT DO NOTHING'
      .upsert({ user_id: user.id }, { onConflict: 'user_id', ignoreDuplicates: true });
  }

  return c.json({ role });
});

// ------------------------------------------------------------------
// SERVICES ENDPOINTS
// ------------------------------------------------------------------

app.get('/api/services', async (c) => {
  const supabase = c.get('supabase');
  
  const { data: services, error } = await supabase
    .from('services')
    // Select service columns and join the expert's name
    .select('*, expert:users(name)') 
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) return c.json({ error: error.message }, 500);

  // Flatten the result for a clean API response
  const results = services.map(s => ({
    ...s,
    expert_name: s.expert?.name,
    expert: undefined,
  }));

  return c.json(results);
});

app.get('/api/experts/:expertId/services', async (c) => {
  const expertId = c.req.param('expertId');
  const supabase = c.get('supabase');
  
  const { data: results, error } = await supabase
    .from('services')
    .select('*')
    .eq('expert_id', expertId)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) return c.json({ error: error.message }, 500);
  return c.json(results);
});

app.post('/api/services', supabaseAuthMiddleware, zValidator('json', CreateServiceSchema), async (c) => {
  const user = c.get('user');
  const supabase = c.get('supabase');
  const serviceData = c.req.valid('json');

  const { data: newService, error } = await supabase
    .from('services')
    .insert({
      expert_id: user.id,
      ...serviceData,
    })
    .select() 
    .maybeSingle();

  if (error) return c.json({ error: error.message }, 500);
  
  return c.json(newService);
});

app.put('/api/services/:id', supabaseAuthMiddleware, zValidator('json', CreateServiceSchema), async (c) => {
  const user = c.get('user');
  const supabase = c.get('supabase');
  const serviceId = c.req.param('id');
  const serviceData = c.req.valid('json');

  const { data: updatedService, error } = await supabase
    .from('services')
    .update(serviceData)
    .eq('id', serviceId)
    .eq('expert_id', user.id)
    .select()
    .maybeSingle();

  if (error) return c.json({ error: error.message }, 500);
  if (!updatedService) return c.json({ error: 'Service not found or unauthorized' }, 404);

  return c.json(updatedService);
});

app.delete('/api/services/:id', supabaseAuthMiddleware, async (c) => {
  const user = c.get('user');
  const supabase = c.get('supabase');
  const serviceId = c.req.param('id');

  // Soft delete
  const { error } = await supabase
    .from('services')
    .update({ is_active: false })
    .eq('id', serviceId)
    .eq('expert_id', user.id);

  if (error) return c.json({ error: error.message }, 500);
  return c.json({ success: true });
});

// ------------------------------------------------------------------
// AVAILABILITY ENDPOINTS
// ------------------------------------------------------------------

app.get('/api/availability/:expertId', async (c) => {
  const expertId = c.req.param('expertId');
  const supabase = c.get('supabase');
  
  const { data: results, error } = await supabase
    .from('availability')
    .select('*')
    .eq('expert_id', expertId)
    .order('day_of_week')
    .order('start_time');

  if (error) return c.json({ error: error.message }, 500);
  return c.json(results);
});

app.post('/api/availability', supabaseAuthMiddleware, zValidator('json', SetAvailabilitySchema), async (c) => {
  const user = c.get('user');
  const supabase = c.get('supabase');
  const { availability } = c.req.valid('json');

  // 1. Delete existing availability for the expert
  const { error: deleteError } = await supabase
    .from('availability')
    .delete()
    .eq('expert_id', user.id);

  if (deleteError) return c.json({ error: deleteError.message }, 500);

  // 2. Prepare data for bulk insert
  const insertData = availability.map(slot => ({
    expert_id: user.id,
    day_of_week: slot.day_of_week,
    start_time: slot.start_time,
    end_time: slot.end_time,
  }));

  // 3. Insert new availability (Supabase/Postgres bulk array inserts)
  const { error: insertError } = await supabase
    .from('availability')
    .insert(insertData);

  if (insertError) return c.json({ error: insertError.message }, 500);

  return c.json({ success: true });
});

// ------------------------------------------------------------------
// BOOKING ENDPOINTS
// ------------------------------------------------------------------

app.get('/api/bookings/expert', supabaseAuthMiddleware, async (c) => {
  const user = c.get('user');
  const supabase = c.get('supabase');
  
  const { data: results, error } = await supabase
    .from('bookings')
    .select('*, service:services(name), user_booked:users!bookings_user_id_fkey(name)')
    .eq('expert_id', user.id)
    .eq('status', 'confirmed')
    .order('booking_date')
    .order('booking_time');

  if (error) return c.json({ error: error.message }, 500);

  const flattenedResults = results.map(b => ({
      ...b,
      service_name: b.service.name,
      user_name: b.user_booked.name,
      service: undefined, 
      user_booked: undefined, 
  }));
  
  return c.json(flattenedResults);
});

app.get('/api/bookings/user', supabaseAuthMiddleware, async (c) => {
  const user = c.get('user');
  const supabase = c.get('supabase');
  
  const { data: results, error } = await supabase
    .from('bookings')
    .select('*, service:services(name), expert:users!bookings_expert_id_fkey(name)')
    .eq('user_id', user.id)
    .eq('status', 'confirmed')
    .order('booking_date')
    .order('booking_time');
    
  if (error) return c.json({ error: error.message }, 500);

  const flattenedResults = results.map(b => ({
      ...b,
      service_name: b.service.name,
      expert_name: b.expert.name,
      service: undefined,
      expert: undefined,
  }));
  
  return c.json(flattenedResults);
});

app.post('/api/bookings', supabaseAuthMiddleware, zValidator('json', CreateBookingSchema), async (c) => {
  const user = c.get('user');
  const supabase = c.get('supabase');
  const bookingData = c.req.valid('json');

  // 1. Check for conflict
  const { data: existingBookings, error: checkError } = await supabase
    .from('bookings')
    .select('id')
    .eq('expert_id', bookingData.expert_id)
    .eq('booking_date', bookingData.booking_date)
    .eq('booking_time', bookingData.booking_time)
    .eq('status', 'confirmed');

  if (checkError) return c.json({ error: checkError.message }, 500);
  if (existingBookings && existingBookings.length > 0) {
    return c.json({ error: 'Time slot is already booked' }, 400);
  }

  // 2. Insert new booking
  const { data: newBooking, error: insertError } = await supabase
    .from('bookings')
    .insert({
      user_id: user.id,
      ...bookingData,
    })
    .select()
    .maybeSingle();

  if (insertError) return c.json({ error: insertError.message }, 500);

  return c.json(newBooking);
});

app.delete('/api/bookings/:id', supabaseAuthMiddleware, async (c) => {
  const user = c.get('user');
  const supabase = c.get('supabase');
  const bookingId = c.req.param('id');

  // Soft delete
  const { error } = await supabase
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('id', bookingId)
    .eq('user_id', user.id);

  if (error) return c.json({ error: error.message }, 500);
  return c.json({ success: true });
});

// ------------------------------------------------------------------
// GET AVAILABLE TIME SLOTS
// ------------------------------------------------------------------

app.get('/api/availability/:expertId/:serviceId/:date', async (c) => {
  const expertId = c.req.param('expertId');
  const serviceId = c.req.param('serviceId');
  const dateString = c.req.param('date');
  const supabase = c.get('supabase');

  const dayOfWeek = new Date(dateString).getDay();

  // 1. Get expert's availability
  const { data: availability, error: availError } = await supabase
    .from('availability')
    .select('start_time, end_time')
    .eq('expert_id', expertId)
    .eq('day_of_week', dayOfWeek);

  if (availError) return c.json({ error: availError.message }, 500);
  if (!availability || availability.length === 0) return c.json([]);

  // 2. Get service duration
  const { data: services, error: serviceError } = await supabase
    .from('services')
    .select('duration')
    .eq('id', serviceId)
    .maybeSingle();

  if (serviceError) return c.json({ error: serviceError.message }, 500);
  if (!services) return c.json([]);

  const serviceDuration = services.duration as number;

  // 3. Get existing confirmed bookings
  const { data: bookings, error: bookingError } = await supabase
    .from('bookings')
    .select('booking_time')
    .eq('expert_id', expertId)
    .eq('booking_date', dateString)
    .eq('status', 'confirmed');
    
  if (bookingError) return c.json({ error: bookingError.message }, 500);

  const bookedTimes = new Set(bookings.map(b => b.booking_time));

  // --- Slot generation logic (business logic) ---
  const slots: string[] = [];
  for (const timeSlot of availability) {
    const startTime = timeSlot.start_time;
    const endTime = timeSlot.end_time;
    
    // Create Date objects for time math (using '2000-01-01T' to treat them as times on the same day)
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    
    // Iterate through 30-minute intervals
    for (let current = start.getTime(); current < end.getTime(); current += 30 * 60000) {
      const slotStart = new Date(current);
      const slotEnd = new Date(current + serviceDuration * 60000);
      
      if (slotEnd <= end) {
        const timeString = slotStart.toTimeString().slice(0, 5);
        if (!bookedTimes.has(timeString)) {
          slots.push(timeString);
        }
      }
    }
  }

  return c.json(slots);
});

export default app;