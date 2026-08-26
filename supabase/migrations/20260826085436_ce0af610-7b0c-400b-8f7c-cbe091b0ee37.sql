CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  bio TEXT,
  education_level TEXT,
  field_of_study TEXT,
  location TEXT,
  skills TEXT[] DEFAULT '{}',
  interests TEXT[] DEFAULT '{}',
  experience_level TEXT,
  eligibility TEXT[] DEFAULT '{}',
  onboarding_complete BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own profile"
ON public.profiles FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  host TEXT,
  location TEXT,
  mode TEXT,
  starts_at TIMESTAMP WITH TIME ZONE,
  ends_at TIMESTAMP WITH TIME ZONE,
  deadline_at TIMESTAMP WITH TIME ZONE,
  prize TEXT,
  certificate BOOLEAN DEFAULT FALSE,
  url TEXT,
  image_url TEXT,
  skills TEXT[] DEFAULT '{}',
  eligibility TEXT[] DEFAULT '{}',
  published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT ON public.opportunities TO anon;
GRANT SELECT ON public.opportunities TO authenticated;
GRANT ALL ON public.opportunities TO service_role;

ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published opportunities are public"
ON public.opportunities FOR SELECT
TO anon, authenticated
USING (published = TRUE);

CREATE TABLE public.saved_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  opportunity_id UUID NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, opportunity_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.saved_opportunities TO authenticated;
GRANT ALL ON public.saved_opportunities TO service_role;

ALTER TABLE public.saved_opportunities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own saved opportunities"
ON public.saved_opportunities FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.opportunities (title, description, type, host, location, mode, starts_at, ends_at, deadline_at, prize, certificate, url, image_url, skills, eligibility) VALUES
('NeuralGrid AI Hackathon', 'Build a computer-vision model that detects real-time accessibility barriers in public spaces. 48-hour hybrid sprint in San Jose.', 'hackathon', 'NeuralGrid Labs', 'San Jose, CA', 'hybrid', '2025-03-12 09:00:00+00', '2025-03-14 18:00:00+00', '2025-03-10 23:59:00+00', '$40,000', false, 'https://example.com/neuralgrid', '/images/opportunity-hackathon.jpg', ARRAY['machine-learning','python','computer-vision'], ARRAY['undergrad','grad','us_based']),
('Quantum Ledger Challenge', 'Design a decentralized settlement protocol for student-run marketplaces. Teams of up to four.', 'competition', 'Quantum Ledger Foundation', 'Remote', 'remote', '2025-04-02 00:00:00+00', '2025-04-30 23:59:00+00', '2025-03-28 23:59:00+00', '$25,000', false, 'https://example.com/quantum', '/images/opportunity-competition.jpg', ARRAY['web3','blockchain','fintech'], ARRAY['undergrad','grad']),
('Design Systems at Scale', 'A six-week intensive on token architecture, theming, and shipping consistent UI across teams.', 'course', 'Design Academy', 'Remote', 'remote', '2025-04-15 00:00:00+00', '2025-05-27 23:59:00+00', '2025-04-10 23:59:00+00', NULL, true, 'https://example.com/design-systems', '/images/opportunity-course.jpg', ARRAY['product-design','figma','ui-engineering'], ARRAY['undergrad','grad']),
('Advanced Systems Workshop', 'Deep dive into distributed systems and architectural patterns led by senior engineers.', 'workshop', 'University of Technology', 'Boston, MA', 'hybrid', '2025-10-12 10:00:00+00', '2025-10-12 16:00:00+00', '2025-10-08 23:59:00+00', NULL, true, 'https://example.com/systems-workshop', '/images/opportunity-workshop.jpg', ARRAY['distributed-systems','backend','go'], ARRAY['undergrad','grad']),
('Global Policy Pitch', 'Present a 10-minute pitch on a civic-tech problem. Open to current undergraduates worldwide.', 'competition', 'Policy Institute', 'Boston, MA', 'in_person', '2025-05-15 09:00:00+00', '2025-05-16 18:00:00+00', '2025-05-01 23:59:00+00', '$5,000', false, 'https://example.com/policy-pitch', '/images/opportunity-competition-2.jpg', ARRAY['public-speaking','civic-tech','policy'], ARRAY['undergrad']),
('Foundations of Data Visualization', 'A 6-week intro to charting, color and storytelling with real datasets. Certificate included.', 'course', 'Data Institute', 'Remote', 'remote', '2025-04-01 00:00:00+00', '2025-05-13 23:59:00+00', '2025-03-30 23:59:00+00', NULL, true, 'https://example.com/data-viz', '/images/opportunity-course-2.jpg', ARRAY['data-visualization','python','storytelling'], ARRAY['undergrad','grad']),
('Open Source Sprint', 'Contribute to impactful open-source projects with mentorship from maintainers.', 'workshop', 'OpenSource Collective', 'Remote', 'remote', '2025-06-01 00:00:00+00', '2025-06-30 23:59:00+00', '2025-05-25 23:59:00+00', NULL, true, 'https://example.com/oss-sprint', '/images/opportunity-workshop-2.jpg', ARRAY['open-source','git','javascript'], ARRAY['undergrad','grad']),
('AI Research Mentorship', 'Pair with a graduate student mentor working on natural language processing research.', 'mentorship', 'AI Research Group', 'Remote', 'remote', '2025-09-01 00:00:00+00', '2025-12-15 23:59:00+00', '2025-08-15 23:59:00+00', 'Stipend', false, 'https://example.com/ai-mentorship', '/images/opportunity-mentorship.jpg', ARRAY['machine-learning','nlp','python'], ARRAY['undergrad']),
('Student Founder Grant', 'Micro-grants for student-led projects at the intersection of climate and technology.', 'grant', 'Future Founders', 'Remote', 'remote', '2025-07-01 00:00:00+00', '2025-07-31 23:59:00+00', '2025-06-20 23:59:00+00', '$3,000', false, 'https://example.com/founder-grant', '/images/opportunity-grant.jpg', ARRAY['entrepreneurship','climate-tech'], ARRAY['undergrad','grad']);
