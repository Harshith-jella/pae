export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          email: string;
          name: string;
          role: 'admin' | 'owner' | 'user';
          phone: string | null;
          address: string | null;
          avatar_url: string | null;
          date_of_birth: string | null;
          emergency_contact: string | null;
          bio: string | null;
          is_verified: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name: string;
          role?: 'admin' | 'owner' | 'user';
          phone?: string | null;
          address?: string | null;
          avatar_url?: string | null;
          date_of_birth?: string | null;
          emergency_contact?: string | null;
          bio?: string | null;
          is_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          role?: 'admin' | 'owner' | 'user';
          phone?: string | null;
          address?: string | null;
          avatar_url?: string | null;
          date_of_birth?: string | null;
          emergency_contact?: string | null;
          bio?: string | null;
          is_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      parking_spaces: {
        Row: {
          id: string;
          owner_id: string;
          title: string;
          description: string | null;
          address: string;
          city: string;
          state: string;
          zip_code: string;
          latitude: number | null;
          longitude: number | null;
          price_per_hour: number;
          size: 'compact' | 'standard' | 'large' | 'oversized';
          type: 'outdoor' | 'covered' | 'garage' | 'street';
          amenities: string[];
          images: string[];
          is_active: boolean;
          rating: number;
          review_count: number;
          total_bookings: number;
          total_revenue: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          title: string;
          description?: string | null;
          address: string;
          city: string;
          state: string;
          zip_code: string;
          latitude?: number | null;
          longitude?: number | null;
          price_per_hour: number;
          size?: 'compact' | 'standard' | 'large' | 'oversized';
          type?: 'outdoor' | 'covered' | 'garage' | 'street';
          amenities?: string[];
          images?: string[];
          is_active?: boolean;
          rating?: number;
          review_count?: number;
          total_bookings?: number;
          total_revenue?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          title?: string;
          description?: string | null;
          address?: string;
          city?: string;
          state?: string;
          zip_code?: string;
          latitude?: number | null;
          longitude?: number | null;
          price_per_hour?: number;
          size?: 'compact' | 'standard' | 'large' | 'oversized';
          type?: 'outdoor' | 'covered' | 'garage' | 'street';
          amenities?: string[];
          images?: string[];
          is_active?: boolean;
          rating?: number;
          review_count?: number;
          total_bookings?: number;
          total_revenue?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      bookings: {
        Row: {
          id: string;
          user_id: string;
          space_id: string;
          start_date: string;
          end_date: string;
          start_time: string;
          end_time: string;
          total_hours: number;
          hourly_rate: number;
          total_amount: number;
          platform_fee: number;
          owner_earnings: number;
          status: 'pending' | 'confirmed' | 'rejected' | 'completed' | 'cancelled' | 'no_show';
          payment_status: 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded';
          payment_intent_id: string | null;
          is_recurring: boolean;
          recurring_days: string[];
          recurring_end_date: string | null;
          special_instructions: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          space_id: string;
          start_date: string;
          end_date: string;
          start_time: string;
          end_time: string;
          total_hours: number;
          hourly_rate: number;
          total_amount: number;
          platform_fee?: number;
          owner_earnings: number;
          status?: 'pending' | 'confirmed' | 'rejected' | 'completed' | 'cancelled' | 'no_show';
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded';
          payment_intent_id?: string | null;
          is_recurring?: boolean;
          recurring_days?: string[];
          recurring_end_date?: string | null;
          special_instructions?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          space_id?: string;
          start_date?: string;
          end_date?: string;
          start_time?: string;
          end_time?: string;
          total_hours?: number;
          hourly_rate?: number;
          total_amount?: number;
          platform_fee?: number;
          owner_earnings?: number;
          status?: 'pending' | 'confirmed' | 'rejected' | 'completed' | 'cancelled' | 'no_show';
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded';
          payment_intent_id?: string | null;
          is_recurring?: boolean;
          recurring_days?: string[];
          recurring_end_date?: string | null;
          special_instructions?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      reviews: {
        Row: {
          id: string;
          user_id: string;
          space_id: string;
          booking_id: string;
          rating: number;
          comment: string | null;
          is_anonymous: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          space_id: string;
          booking_id: string;
          rating: number;
          comment?: string | null;
          is_anonymous?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          space_id?: string;
          booking_id?: string;
          rating?: number;
          comment?: string | null;
          is_anonymous?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: 'booking_confirmed' | 'booking_rejected' | 'booking_cancelled' | 'booking_reminder' | 'payment_successful' | 'payment_failed' | 'payout_processed' | 'review_received' | 'space_approved' | 'space_rejected' | 'system_announcement' | 'security_alert';
          title: string;
          message: string;
          data: any;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: 'booking_confirmed' | 'booking_rejected' | 'booking_cancelled' | 'booking_reminder' | 'payment_successful' | 'payment_failed' | 'payout_processed' | 'review_received' | 'space_approved' | 'space_rejected' | 'system_announcement' | 'security_alert';
          title: string;
          message: string;
          data?: any;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: 'booking_confirmed' | 'booking_rejected' | 'booking_cancelled' | 'booking_reminder' | 'payment_successful' | 'payment_failed' | 'payout_processed' | 'review_received' | 'space_approved' | 'space_rejected' | 'system_announcement' | 'security_alert';
          title?: string;
          message?: string;
          data?: any;
          is_read?: boolean;
          created_at?: string;
        };
      };
      transactions: {
        Row: {
          id: string;
          booking_id: string;
          user_id: string;
          space_owner_id: string;
          stripe_payment_intent_id: string | null;
          amount: number;
          platform_fee: number;
          owner_earnings: number;
          currency: string;
          status: 'pending' | 'succeeded' | 'failed' | 'cancelled' | 'refunded';
          payment_method_type: string | null;
          failure_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          booking_id: string;
          user_id: string;
          space_owner_id: string;
          stripe_payment_intent_id?: string | null;
          amount: number;
          platform_fee: number;
          owner_earnings: number;
          currency?: string;
          status?: 'pending' | 'succeeded' | 'failed' | 'cancelled' | 'refunded';
          payment_method_type?: string | null;
          failure_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          booking_id?: string;
          user_id?: string;
          space_owner_id?: string;
          stripe_payment_intent_id?: string | null;
          amount?: number;
          platform_fee?: number;
          owner_earnings?: number;
          currency?: string;
          status?: 'pending' | 'succeeded' | 'failed' | 'cancelled' | 'refunded';
          payment_method_type?: string | null;
          failure_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      analytics_overview: {
        Row: {
          total_users: number;
          total_customers: number;
          total_owners: number;
          total_spaces: number;
          active_spaces: number;
          total_bookings: number;
          completed_bookings: number;
          total_revenue: number;
          platform_revenue: number;
          average_rating: number;
          total_reviews: number;
        };
      };
    };
    Functions: {
      get_dashboard_stats: {
        Args: { user_role?: string };
        Returns: any;
      };
      get_booking_analytics: {
        Args: { start_date?: string; end_date?: string };
        Returns: any;
      };
    };
  };
}