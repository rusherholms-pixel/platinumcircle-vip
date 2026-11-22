// Shared per-category field configs for creating/editing `listings`.
// Used by both the admin listing form and the provider listing form so the
// two produce the same category_data shape for a given category.

export const CURRENCIES = ["USD", "EUR", "GBP", "AED", "CHF", "CAD", "AUD"];

export interface CategoryField {
  key: string;
  label: string;
  type: string; // "text" | "number" | "select" | "textarea" | "toggle"
  options?: string[];
}

export interface CategoryConfig {
  label: string;
  rateLabel: string;
  fields: CategoryField[];
}

export const CATEGORY_FIELDS: Record<string, CategoryConfig> = {
  homes: {
    label: "Homes",
    rateLabel: "Nightly Rate",
    fields: [
      { key: "property_type", label: "Property Type", type: "select", options: ["Villa", "Penthouse", "Private Estate", "Serviced Apartment", "Boutique Property", "Yacht", "Chalet", "Other"] },
      { key: "bedrooms", label: "Bedrooms", type: "number" },
      { key: "bathrooms", label: "Bathrooms", type: "number" },
      { key: "max_guests", label: "Maximum Guests", type: "number" },
      { key: "weekly_rate", label: "Weekly Rate", type: "number" },
      { key: "monthly_rate", label: "Monthly Rate", type: "number" },
      { key: "minimum_stay", label: "Minimum Stay (nights)", type: "number" },
      { key: "cancellation_policy", label: "Cancellation Policy", type: "select", options: ["Flexible", "Moderate", "Strict", "Non-refundable"] },
    ],
  },
  drivers: {
    label: "Drivers",
    rateLabel: "Hourly Rate",
    fields: [
      { key: "driver_name", label: "Driver Full Name", type: "text" },
      { key: "years_experience", label: "Years of Experience", type: "number" },
      { key: "languages", label: "Languages Spoken", type: "text" },
      { key: "bio", label: "Short Bio", type: "textarea" },
      { key: "half_day_rate", label: "Half Day (4hr) Rate", type: "number" },
      { key: "full_day_rate", label: "Full Day (8hr) Rate", type: "number" },
      { key: "airport_rate", label: "Airport Transfer Rate", type: "number" },
    ],
  },
  car_fleets: {
    label: "Car Fleets",
    rateLabel: "Daily Rate",
    fields: [
      { key: "fleet_type", label: "Fleet Type", type: "select", options: ["Executive Fleet", "Exotic and Supercar Fleet", "SUV Fleet", "Armored Fleet", "Classic Fleet", "Event Fleet", "Mixed Fleet"] },
      { key: "minimum_rental", label: "Minimum Rental Period", type: "text" },
      { key: "driver_included", label: "Driver Included", type: "toggle" },
      { key: "delivery_available", label: "Delivery Available", type: "toggle" },
      { key: "insurance_included", label: "Insurance Included", type: "toggle" },
    ],
  },
  experiences: {
    label: "Experiences",
    rateLabel: "Price Per Person",
    fields: [
      { key: "experience_category", label: "Experience Category", type: "text" },
      { key: "duration", label: "Duration", type: "text" },
      { key: "min_guests", label: "Minimum Guests", type: "number" },
      { key: "max_guests", label: "Maximum Guests", type: "number" },
      { key: "whats_included", label: "What Is Included", type: "textarea" },
      { key: "advance_booking", label: "Advance Booking Required", type: "select", options: ["24h", "48h", "72h", "1 week", "2 weeks", "Custom"] },
    ],
  },
  security: {
    label: "Security",
    rateLabel: "Hourly Rate",
    fields: [
      { key: "provider_name", label: "Provider / Team Name", type: "text" },
      { key: "service_types", label: "Security Service Types", type: "text" },
      { key: "team_size", label: "Team Size Available", type: "select", options: ["Solo officer", "2-person team", "4-person team", "Full detail (6+)", "Custom on request"] },
      { key: "armed_unarmed", label: "Armed or Unarmed", type: "select", options: ["Armed", "Unarmed", "Both"] },
      { key: "response_time", label: "Response Time", type: "select", options: ["Under 2 hours", "2-4 hours", "Same day", "Next day"] },
      { key: "day_rate", label: "8-Hour Day Rate", type: "number" },
      { key: "24h_rate", label: "24-Hour Rate", type: "number" },
      { key: "weekly_rate", label: "Weekly Rate", type: "number" },
    ],
  },
};
