import Navbar from "../components/Navbar";
import Events from "../components/sections/Events";
import Hero from "../components/sections/Hero";
import Projects from "../components/sections/Projects";
import Resume from "../components/sections/Resume";
import TechStack from "../components/sections/TechStack";
import {
  fallbackEducation,
  fallbackEvents,
  fallbackPortfolioData,
  fallbackProfile,
  fallbackProjects,
  fallbackWorkExperience,
} from "../lib/fallback-data";
import { getSupabaseClient } from "../lib/supabase";
import type {
  EducationRow,
  EventRow,
  PortfolioData,
  ProjectRow,
  WorkExperienceRow,
} from "../types/database";

export const revalidate = 300;

export default async function Home() {
  const data = await getPortfolioData();

  return (
    <main className="relative overflow-x-clip">
      <Navbar
        initials={data.profile.initials ?? "AS"}
        name={data.profile.name ?? "Annas"}
      />
      <Hero profile={data.profile} />
      <Resume education={data.education} workExperience={data.workExperience} />
      <TechStack />
      <Projects projects={data.projects} />
      <Events events={data.events} />
      <footer className="px-5 pb-12 pt-10 md:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 border-t border-white/10 pt-8 text-sm text-white/50 md:flex-row md:items-center md:justify-between">
          <p>{data.profile.name ?? "Annas"} Sovianto</p>
          <p>Built with Next.js, Supabase, Lenis, and Framer Motion.</p>
        </div>
      </footer>
    </main>
  );
}

async function getPortfolioData(): Promise<PortfolioData> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return fallbackPortfolioData;
  }

  const [
    profileResult,
    projectsResult,
    workResult,
    educationResult,
    eventsResult,
  ] = await Promise.all([
    supabase.from("profiles").select("*").limit(1).maybeSingle(),
    supabase
      .from("projects")
      .select("*")
      .eq("active", "true")
      .order("id", { ascending: true }),
    supabase
      .from("work_experience")
      .select("*")
      .order("id", { ascending: true }),
    supabase.from("education").select("*").order("id", { ascending: true }),
    supabase
      .from("events")
      .select("*")
      .order("sort_order", { ascending: true, nullsFirst: false })
      .order("id", { ascending: true }),
  ]);

  const errors = [
    profileResult.error,
    projectsResult.error,
    workResult.error,
    educationResult.error,
    eventsResult.error,
  ].filter(Boolean);

  if (errors.length > 0) {
    console.warn(
      "Supabase portfolio fetch failed, rendering fallback data:",
      errors.map((error) => error?.message).join("; "),
    );

    return fallbackPortfolioData;
  }

  return {
    profile: profileResult.data ?? fallbackProfile,
    projects: withFallback<ProjectRow>(projectsResult.data, fallbackProjects),
    workExperience: withFallback<WorkExperienceRow>(
      workResult.data,
      fallbackWorkExperience,
    ),
    education: withFallback<EducationRow>(
      educationResult.data,
      fallbackEducation,
    ),
    events: withFallback<EventRow>(eventsResult.data, fallbackEvents),
  };
}

function withFallback<Row>(rows: Row[] | null, fallbackRows: Row[]): Row[] {
  return rows && rows.length > 0 ? rows : fallbackRows;
}
