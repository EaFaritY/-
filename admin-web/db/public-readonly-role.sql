-- Run once as a superuser AFTER `npm run db:migrate` in admin-web.
-- The public site can read results but never modify them; its only write is
-- the anonymous search counter (search_logs).
CREATE ROLE sports_public LOGIN PASSWORD 'publicpass';  -- change the password!
GRANT CONNECT ON DATABASE sports_awards TO sports_public;
GRANT USAGE ON SCHEMA public TO sports_public;
GRANT SELECT ON students, student_results, competitions, certificates, academic_years TO sports_public;
GRANT SELECT, INSERT ON search_logs TO sports_public;
GRANT USAGE ON SEQUENCE search_logs_id_seq TO sports_public;
