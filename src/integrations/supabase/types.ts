export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      applications: {
        Row: {
          applicant_type: string
          business_name: string | null
          business_type: string | null
          city: string
          country: string
          created_at: string
          email: string
          full_name: string
          heard_about_us: string | null
          id: string
          personal_statement: string | null
          phone: string
          portfolio_url: string | null
          preferred_services: string[] | null
          reference_number: string
          reviewed_at: string | null
          reviewed_by: string | null
          service_categories: string[] | null
          service_cities: string | null
          service_countries: string[] | null
          service_description: string | null
          status: string
          travel_frequency: string | null
          travel_party_size: string | null
          traveler_status: string[] | null
          updated_at: string
          user_id: string | null
          years_experience: number | null
        }
        Insert: {
          applicant_type: string
          business_name?: string | null
          business_type?: string | null
          city: string
          country: string
          created_at?: string
          email: string
          full_name: string
          heard_about_us?: string | null
          id?: string
          personal_statement?: string | null
          phone: string
          portfolio_url?: string | null
          preferred_services?: string[] | null
          reference_number?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          service_categories?: string[] | null
          service_cities?: string | null
          service_countries?: string[] | null
          service_description?: string | null
          status?: string
          travel_frequency?: string | null
          travel_party_size?: string | null
          traveler_status?: string[] | null
          updated_at?: string
          user_id?: string | null
          years_experience?: number | null
        }
        Update: {
          applicant_type?: string
          business_name?: string | null
          business_type?: string | null
          city?: string
          country?: string
          created_at?: string
          email?: string
          full_name?: string
          heard_about_us?: string | null
          id?: string
          personal_statement?: string | null
          phone?: string
          portfolio_url?: string | null
          preferred_services?: string[] | null
          reference_number?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          service_categories?: string[] | null
          service_cities?: string | null
          service_countries?: string[] | null
          service_description?: string | null
          status?: string
          travel_frequency?: string | null
          travel_party_size?: string | null
          traveler_status?: string[] | null
          updated_at?: string
          user_id?: string | null
          years_experience?: number | null
        }
        Relationships: []
      }
      bundle_requests: {
        Row: {
          budget_range: string | null
          bundle_id: string | null
          bundle_name: string
          created_at: string
          destination_city: string | null
          destination_country: string | null
          email: string
          full_name: string
          id: string
          num_guests: number | null
          phone: string | null
          preferred_contact: string | null
          selected_addons: string[] | null
          special_requests: string | null
          status: string
          travel_date_end: string | null
          travel_date_start: string | null
        }
        Insert: {
          budget_range?: string | null
          bundle_id?: string | null
          bundle_name: string
          created_at?: string
          destination_city?: string | null
          destination_country?: string | null
          email: string
          full_name: string
          id?: string
          num_guests?: number | null
          phone?: string | null
          preferred_contact?: string | null
          selected_addons?: string[] | null
          special_requests?: string | null
          status?: string
          travel_date_end?: string | null
          travel_date_start?: string | null
        }
        Update: {
          budget_range?: string | null
          bundle_id?: string | null
          bundle_name?: string
          created_at?: string
          destination_city?: string | null
          destination_country?: string | null
          email?: string
          full_name?: string
          id?: string
          num_guests?: number | null
          phone?: string | null
          preferred_contact?: string | null
          selected_addons?: string[] | null
          special_requests?: string | null
          status?: string
          travel_date_end?: string | null
          travel_date_start?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bundle_requests_bundle_id_fkey"
            columns: ["bundle_id"]
            isOneToOne: false
            referencedRelation: "bundles"
            referencedColumns: ["id"]
          },
        ]
      }
      bundles: {
        Row: {
          addon_options: Json
          created_at: string
          description: string | null
          display_order: number | null
          featured_card_image: string | null
          featured_description: string | null
          featured_order: number | null
          gallery_images: string[] | null
          hero_image_url: string | null
          id: string
          included_items: Json
          is_active: boolean | null
          is_featured: boolean | null
          name: string
          slug: string
          starting_price: string | null
          tagline: string | null
          tags: string[]
          testimonial_author: string | null
          testimonial_quote: string | null
          updated_at: string
          who_its_for: string | null
        }
        Insert: {
          addon_options?: Json
          created_at?: string
          description?: string | null
          display_order?: number | null
          featured_card_image?: string | null
          featured_description?: string | null
          featured_order?: number | null
          gallery_images?: string[] | null
          hero_image_url?: string | null
          id?: string
          included_items?: Json
          is_active?: boolean | null
          is_featured?: boolean | null
          name: string
          slug: string
          starting_price?: string | null
          tagline?: string | null
          tags?: string[]
          testimonial_author?: string | null
          testimonial_quote?: string | null
          updated_at?: string
          who_its_for?: string | null
        }
        Update: {
          addon_options?: Json
          created_at?: string
          description?: string | null
          display_order?: number | null
          featured_card_image?: string | null
          featured_description?: string | null
          featured_order?: number | null
          gallery_images?: string[] | null
          hero_image_url?: string | null
          id?: string
          included_items?: Json
          is_active?: boolean | null
          is_featured?: boolean | null
          name?: string
          slug?: string
          starting_price?: string | null
          tagline?: string | null
          tags?: string[]
          testimonial_author?: string | null
          testimonial_quote?: string | null
          updated_at?: string
          who_its_for?: string | null
        }
        Relationships: []
      }
      homepage_content: {
        Row: {
          cta_label: string | null
          headline: string | null
          hero_image_url: string | null
          id: string
          section_key: string
          subheadline: string | null
          updated_at: string
          updated_by: string | null
          use_video: boolean
          video_url: string | null
        }
        Insert: {
          cta_label?: string | null
          headline?: string | null
          hero_image_url?: string | null
          id?: string
          section_key: string
          subheadline?: string | null
          updated_at?: string
          updated_by?: string | null
          use_video?: boolean
          video_url?: string | null
        }
        Update: {
          cta_label?: string | null
          headline?: string | null
          hero_image_url?: string | null
          id?: string
          section_key?: string
          subheadline?: string | null
          updated_at?: string
          updated_by?: string | null
          use_video?: boolean
          video_url?: string | null
        }
        Relationships: []
      }
      homepage_gallery_images: {
        Row: {
          caption: string | null
          created_at: string
          display_order: number
          id: string
          image_url: string
          section_key: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          display_order?: number
          id?: string
          image_url: string
          section_key: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          display_order?: number
          id?: string
          image_url?: string
          section_key?: string
        }
        Relationships: [
          {
            foreignKeyName: "homepage_gallery_images_section_key_fkey"
            columns: ["section_key"]
            isOneToOne: false
            referencedRelation: "homepage_content"
            referencedColumns: ["section_key"]
          },
        ]
      }
      private_inquiries: {
        Row: {
          created_at: string
          email: string
          first_name: string
          id: string
          looking_for: string | null
          preferred_contact: string | null
          status: string
        }
        Insert: {
          created_at?: string
          email: string
          first_name: string
          id?: string
          looking_for?: string | null
          preferred_contact?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          looking_for?: string | null
          preferred_contact?: string | null
          status?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          city: string | null
          country: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          email: string
          full_name: string
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      properties: {
        Row: {
          amenities: string[] | null
          bathrooms: number
          bedrooms: number
          city: string
          country: string
          created_at: string
          currency: string
          description: string | null
          host_id: string | null
          id: string
          images: string[] | null
          is_featured: boolean | null
          location: string
          max_guests: number
          price_per_night: number
          property_type: string
          rating: number | null
          review_count: number | null
          title: string
          updated_at: string
        }
        Insert: {
          amenities?: string[] | null
          bathrooms?: number
          bedrooms?: number
          city: string
          country: string
          created_at?: string
          currency?: string
          description?: string | null
          host_id?: string | null
          id?: string
          images?: string[] | null
          is_featured?: boolean | null
          location: string
          max_guests?: number
          price_per_night: number
          property_type?: string
          rating?: number | null
          review_count?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          amenities?: string[] | null
          bathrooms?: number
          bedrooms?: number
          city?: string
          country?: string
          created_at?: string
          currency?: string
          description?: string | null
          host_id?: string | null
          id?: string
          images?: string[] | null
          is_featured?: boolean | null
          location?: string
          max_guests?: number
          price_per_night?: number
          property_type?: string
          rating?: number | null
          review_count?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          converted_at: string | null
          created_at: string
          credit_amount: number | null
          id: string
          referral_code: string
          referred_email: string | null
          referred_user_id: string | null
          referrer_id: string
          status: string
        }
        Insert: {
          converted_at?: string | null
          created_at?: string
          credit_amount?: number | null
          id?: string
          referral_code: string
          referred_email?: string | null
          referred_user_id?: string | null
          referrer_id: string
          status?: string
        }
        Update: {
          converted_at?: string | null
          created_at?: string
          credit_amount?: number | null
          id?: string
          referral_code?: string
          referred_email?: string | null
          referred_user_id?: string | null
          referrer_id?: string
          status?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "member" | "provider"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "member", "provider"],
    },
  },
} as const
