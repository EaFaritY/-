CREATE TYPE "public"."result_type" AS ENUM('winner', 'runner_up', 'second_runner_up', 'honorable_mention', 'participated');--> statement-breakpoint
CREATE TABLE "academic_years" (
	"id" serial PRIMARY KEY NOT NULL,
	"year_be" integer NOT NULL,
	"is_active" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "academic_years_year_be_unique" UNIQUE("year_be")
);
--> statement-breakpoint
CREATE TABLE "admins" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"username" varchar(100) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"role" varchar(20) DEFAULT 'admin' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "admins_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"admin_id" bigint,
	"action" varchar(50) NOT NULL,
	"target_type" varchar(50) NOT NULL,
	"target_id" bigint,
	"details" jsonb,
	"ip_address" varchar(45),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "certificates" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"student_result_id" bigint NOT NULL,
	"file_path" varchar(500) NOT NULL,
	"file_type" varchar(10) NOT NULL,
	"original_filename" varchar(255),
	"file_size_bytes" integer,
	"width_px" integer,
	"height_px" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "certificates_student_result_id_unique" UNIQUE("student_result_id")
);
--> statement-breakpoint
CREATE TABLE "competitions" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"name" varchar(150) NOT NULL,
	"sport_type" varchar(100) NOT NULL,
	"category" varchar(50) NOT NULL,
	"age_group" varchar(50),
	"color" varchar(50) NOT NULL,
	"academic_year_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "import_jobs" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"admin_id" bigint,
	"source" varchar(20) NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"total_rows" integer,
	"success_rows" integer,
	"error_rows" integer,
	"error_file_path" varchar(500),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"finished_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "search_logs" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "student_results" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"student_id" bigint NOT NULL,
	"competition_id" bigint NOT NULL,
	"result" "result_type" NOT NULL,
	"details" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "students" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"student_id" varchar(20) NOT NULL,
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"first_name_normalized" varchar(100) NOT NULL,
	"last_name_normalized" varchar(100) NOT NULL,
	"class" varchar(20) NOT NULL,
	"room" varchar(20) NOT NULL,
	"academic_year_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_admin_id_admins_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."admins"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_student_result_id_student_results_id_fk" FOREIGN KEY ("student_result_id") REFERENCES "public"."student_results"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competitions" ADD CONSTRAINT "competitions_academic_year_id_academic_years_id_fk" FOREIGN KEY ("academic_year_id") REFERENCES "public"."academic_years"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "import_jobs" ADD CONSTRAINT "import_jobs_admin_id_admins_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."admins"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_results" ADD CONSTRAINT "student_results_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_results" ADD CONSTRAINT "student_results_competition_id_competitions_id_fk" FOREIGN KEY ("competition_id") REFERENCES "public"."competitions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "students" ADD CONSTRAINT "students_academic_year_id_academic_years_id_fk" FOREIGN KEY ("academic_year_id") REFERENCES "public"."academic_years"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_audit_admin" ON "audit_logs" USING btree ("admin_id");--> statement-breakpoint
CREATE INDEX "idx_audit_created" ON "audit_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_competitions_year" ON "competitions" USING btree ("academic_year_id");--> statement-breakpoint
CREATE INDEX "idx_search_logs_created" ON "search_logs" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "student_results_student_id_competition_id_key" ON "student_results" USING btree ("student_id","competition_id");--> statement-breakpoint
CREATE INDEX "idx_results_student" ON "student_results" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "idx_results_competition" ON "student_results" USING btree ("competition_id");--> statement-breakpoint
CREATE UNIQUE INDEX "students_student_id_academic_year_id_key" ON "students" USING btree ("student_id","academic_year_id");--> statement-breakpoint
CREATE INDEX "idx_students_student_id" ON "students" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "idx_students_class_room_year" ON "students" USING btree ("academic_year_id","class","room");