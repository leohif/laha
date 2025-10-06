import z from "zod";

// User schemas
export const UserRoleSchema = z.enum(['user', 'expert']);

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().optional(),
  role: UserRoleSchema,
  created_at: z.string(),
  updated_at: z.string(),
});

export const ExpertProfileSchema = z.object({
  id: z.number(),
  user_id: z.string(),
  bio: z.string().optional(),
  specialization: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

// Service schemas
export const ServiceSchema = z.object({
  id: z.number(),
  expert_id: z.string(),
  name: z.string().min(1),
  price: z.number().positive(),
  duration: z.number().positive(), // in minutes
  description: z.string().optional(),
  is_active: z.boolean().default(true),
  created_at: z.string(),
  updated_at: z.string(),
});

export const CreateServiceSchema = z.object({
  name: z.string().min(1),
  price: z.number().positive(),
  duration: z.number().positive(),
  description: z.string().optional(),
});

// Availability schemas
export const AvailabilitySchema = z.object({
  id: z.number(),
  expert_id: z.string(),
  day_of_week: z.number().int().min(0).max(6), // 0=Sunday, 6=Saturday
  start_time: z.string().regex(/^\d{2}:\d{2}$/), // HH:MM format
  end_time: z.string().regex(/^\d{2}:\d{2}$/), // HH:MM format
  created_at: z.string(),
  updated_at: z.string(),
});

export const SetAvailabilitySchema = z.object({
  availability: z.array(z.object({
    day_of_week: z.number().int().min(0).max(6),
    start_time: z.string().regex(/^\d{2}:\d{2}$/),
    end_time: z.string().regex(/^\d{2}:\d{2}$/),
  })),
});

// Booking schemas
export const BookingStatusSchema = z.enum(['confirmed', 'cancelled']);

export const BookingSchema = z.object({
  id: z.number(),
  user_id: z.string(),
  expert_id: z.string(),
  service_id: z.number(),
  booking_date: z.string(), // YYYY-MM-DD format
  booking_time: z.string().regex(/^\d{2}:\d{2}$/), // HH:MM format
  status: BookingStatusSchema,
  created_at: z.string(),
  updated_at: z.string(),
});

export const CreateBookingSchema = z.object({
  expert_id: z.string(),
  service_id: z.number(),
  booking_date: z.string(),
  booking_time: z.string().regex(/^\d{2}:\d{2}$/),
});

// Type exports
export type UserRole = z.infer<typeof UserRoleSchema>;
export type User = z.infer<typeof UserSchema>;
export type ExpertProfile = z.infer<typeof ExpertProfileSchema>;
export type Service = z.infer<typeof ServiceSchema>;
export type CreateService = z.infer<typeof CreateServiceSchema>;
export type Availability = z.infer<typeof AvailabilitySchema>;
export type SetAvailability = z.infer<typeof SetAvailabilitySchema>;
export type BookingStatus = z.infer<typeof BookingStatusSchema>;
export type Booking = z.infer<typeof BookingSchema>;
export type CreateBooking = z.infer<typeof CreateBookingSchema>;

// Extended types with relations
export interface BookingWithDetails extends Booking {
  expert_name: string;
  service_name: string;
  user_name: string;
}

export interface ServiceWithExpert extends Service {
  expert_name: string;
}
