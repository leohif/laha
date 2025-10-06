
-- Drop indexes first
DROP INDEX IF EXISTS idx_bookings_status;
DROP INDEX IF EXISTS idx_bookings_date;
DROP INDEX IF EXISTS idx_bookings_service_id;
DROP INDEX IF EXISTS idx_bookings_expert_id;
DROP INDEX IF EXISTS idx_bookings_user_id;
DROP INDEX IF EXISTS idx_availability_day;
DROP INDEX IF EXISTS idx_availability_expert_id;
DROP INDEX IF EXISTS idx_services_active;
DROP INDEX IF EXISTS idx_services_expert_id;
DROP INDEX IF EXISTS idx_expert_profiles_user_id;
DROP INDEX IF EXISTS idx_users_role;
DROP INDEX IF EXISTS idx_users_email;

-- Drop tables in reverse order
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS availability;
DROP TABLE IF EXISTS services;
DROP TABLE IF EXISTS expert_profiles;
DROP TABLE IF EXISTS users;
