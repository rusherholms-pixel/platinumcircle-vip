// Platinum Circle — service & provider application catalog.
// Single source of truth for the service categories a provider can offer,
// used by the public provider application form, the vetting gate, and the
// provider dashboard.

import { supabase } from "@/integrations/supabase/client";

export interface ServiceCategory {
  key: string;
  label: string;
  short: string;
  description: string;
  icon: string;
}

// Matches the `listings.category` CHECK constraint + admin/member nav.
export const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    key: "homes",
    label: "Luxury Homes & Estates",
    short: "Homes",
    description: "Private villas, penthouses, estates, serviced apartments, yachts and boutique properties in premier global destinations.",
    icon: "home",
  },
  {
    key: "drivers",
    label: "Elite Drivers & Chauffeurs",
    short: "Drivers",
    description: "Professional vetted chauffeurs for airport transfers, full-day & hourly hire, long-distance and multi-city tours.",
    icon: "car",
  },
  {
    key: "car_fleets",
    label: "Car Fleets",
    short: "Car Fleets",
    description: "Premium vehicle fleets — sedans, SUVs, limousines, sprinters and armored vehicles with WiFi and refreshments.",
    icon: "carFront",
  },
  {
    key: "experiences",
    label: "Curated Experiences",
    short: "Experiences",
    description: "Private dining, yacht charters, private aviation, wellness retreats, nightlife, shopping, culinary and bespoke travel.",
    icon: "sparkles",
  },
  {
    key: "security",
    label: "Personal Security",
    short: "Security",
    description: "Close protection, residential & event security, executive & travel security and risk assessment by former mil/police/intel professionals.",
    icon: "shield",
  },
];

// Business / provider legal types accepted in the vetting form.
export const PROVIDER_BUSINESS_TYPES = [
  "Individual",
  "Limited Company",
  "Partnership",
  "Registered Security Firm",
  "Property Management",
  "Travel & Concierge Agency",
  "Culinary / Hospitality",
  "Other",
];

// Statuses a provider application can be in (drives the vetting gate).
export type ProviderApplicationStatus =
  | "pending"
  | "approved"
  | "declined";

// Icon name -> lucide component map helper (imported in components).
export function categoryLabel(key: string): string {
  return SERVICE_CATEGORIES.find((c) => c.key === key)?.label ?? key;
}

export function categoryShort(key: string): string {
  return SERVICE_CATEGORIES.find((c) => c.key === key)?.short ?? key;
}

/**
 * Read the signed-in provider's approved application service_categories.
 * Returns the chosen category keys (e.g. ['homes','drivers']) or null if the
 * user isn't an approved provider. Relies on applications RLS (a user can read
 * their own rows).
 */
export async function getApprovedProviderCategories(userId: string): Promise<string[] | null> {
  const { data } = await supabase
    .from("applications")
    .select("service_categories, status")
    .eq("user_id", userId)
    .eq("applicant_type", "provider")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();
  if (data && data.status === "approved" && Array.isArray(data.service_categories)) {
    return data.service_categories as string[];
  }
  return null;
}
