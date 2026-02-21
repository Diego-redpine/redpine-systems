-- 032: Classes, Schedule & Enrollments
-- Supports martial arts studios, yoga studios, dance studios, gyms, tutoring centers

CREATE TABLE IF NOT EXISTS public.classes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  instructor_name TEXT,
  category TEXT,
  capacity INTEGER,
  drop_in_price_cents INTEGER DEFAULT 0,
  member_only BOOLEAN DEFAULT FALSE,
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'classes' AND policyname = 'Users see own classes') THEN
    CREATE POLICY "Users see own classes" ON public.classes FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'classes' AND policyname = 'Users insert own classes') THEN
    CREATE POLICY "Users insert own classes" ON public.classes FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'classes' AND policyname = 'Users update own classes') THEN
    CREATE POLICY "Users update own classes" ON public.classes FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'classes' AND policyname = 'Users delete own classes') THEN
    CREATE POLICY "Users delete own classes" ON public.classes FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_classes_user_id ON public.classes(user_id);

CREATE TABLE IF NOT EXISTS public.class_schedule (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  day_of_week TEXT NOT NULL,  -- Monday, Tuesday, etc.
  start_time TIME NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  room TEXT,
  is_active BOOLEAN DEFAULT TRUE
);

ALTER TABLE public.class_schedule ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'class_schedule' AND policyname = 'Users see own class schedule') THEN
    CREATE POLICY "Users see own class schedule" ON public.class_schedule FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'class_schedule' AND policyname = 'Users insert own class schedule') THEN
    CREATE POLICY "Users insert own class schedule" ON public.class_schedule FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'class_schedule' AND policyname = 'Users update own class schedule') THEN
    CREATE POLICY "Users update own class schedule" ON public.class_schedule FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'class_schedule' AND policyname = 'Users delete own class schedule') THEN
    CREATE POLICY "Users delete own class schedule" ON public.class_schedule FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_class_schedule_class_id ON public.class_schedule(class_id);

CREATE TABLE IF NOT EXISTS public.class_enrollments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  class_schedule_id UUID NOT NULL REFERENCES public.class_schedule(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  enrollment_date DATE NOT NULL,
  status TEXT DEFAULT 'enrolled',
  is_drop_in BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.class_enrollments ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'class_enrollments' AND policyname = 'Anyone can enroll in classes') THEN
    CREATE POLICY "Anyone can enroll in classes" ON public.class_enrollments FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'class_enrollments' AND policyname = 'Class owners see enrollments') THEN
    CREATE POLICY "Class owners see enrollments" ON public.class_enrollments FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM public.class_schedule cs
        JOIN public.classes c ON c.id = cs.class_id
        WHERE cs.id = class_enrollments.class_schedule_id AND c.user_id = auth.uid()
      )
    );
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_class_enrollments_schedule_id ON public.class_enrollments(class_schedule_id);
