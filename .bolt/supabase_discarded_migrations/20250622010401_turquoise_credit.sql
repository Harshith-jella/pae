/*
  # PAE Platform - Analytics Views and Functions

  1. Views
    - `analytics_overview` - Platform-wide statistics
    - `owner_analytics` - Analytics for space owners
    - `user_analytics` - Analytics for users
    - `revenue_analytics` - Revenue and financial analytics

  2. Functions
    - Various analytics functions for dashboard data
*/

-- Create analytics overview view
CREATE OR REPLACE VIEW analytics_overview AS
SELECT
  (SELECT COUNT(*) FROM user_profiles) as total_users,
  (SELECT COUNT(*) FROM user_profiles WHERE role = 'user') as total_customers,
  (SELECT COUNT(*) FROM user_profiles WHERE role = 'owner') as total_owners,
  (SELECT COUNT(*) FROM parking_spaces) as total_spaces,
  (SELECT COUNT(*) FROM parking_spaces WHERE is_active = true) as active_spaces,
  (SELECT COUNT(*) FROM bookings) as total_bookings,
  (SELECT COUNT(*) FROM bookings WHERE status = 'completed') as completed_bookings,
  (SELECT COALESCE(SUM(total_amount), 0) FROM bookings WHERE status = 'completed') as total_revenue,
  (SELECT COALESCE(SUM(platform_fee), 0) FROM transactions WHERE status = 'succeeded') as platform_revenue,
  (SELECT COALESCE(AVG(rating), 0) FROM parking_spaces WHERE review_count > 0) as average_rating,
  (SELECT COUNT(*) FROM reviews) as total_reviews;

-- Create owner analytics view
CREATE OR REPLACE VIEW owner_analytics AS
SELECT
  ps.owner_id,
  up.name as owner_name,
  COUNT(ps.id) as total_spaces,
  COUNT(CASE WHEN ps.is_active THEN 1 END) as active_spaces,
  COALESCE(SUM(ps.total_bookings), 0) as total_bookings,
  COALESCE(SUM(ps.total_revenue), 0) as total_revenue,
  COALESCE(AVG(ps.rating), 0) as average_rating,
  COALESCE(SUM(ps.review_count), 0) as total_reviews,
  COUNT(DISTINCT b.id) as current_month_bookings,
  COALESCE(SUM(CASE WHEN b.created_at >= date_trunc('month', CURRENT_DATE) THEN b.total_amount ELSE 0 END), 0) as current_month_revenue
FROM parking_spaces ps
LEFT JOIN user_profiles up ON ps.owner_id = up.id
LEFT JOIN bookings b ON ps.id = b.space_id AND b.status = 'completed'
GROUP BY ps.owner_id, up.name;

-- Create revenue analytics view
CREATE OR REPLACE VIEW revenue_analytics AS
SELECT
  DATE_TRUNC('month', t.created_at) as month,
  COUNT(t.id) as transaction_count,
  SUM(t.amount) as total_amount,
  SUM(t.platform_fee) as platform_revenue,
  SUM(t.owner_earnings) as owner_earnings,
  AVG(t.amount) as average_transaction_amount
FROM transactions t
WHERE t.status = 'succeeded'
GROUP BY DATE_TRUNC('month', t.created_at)
ORDER BY month DESC;

-- Function to get dashboard stats for a specific user role
CREATE OR REPLACE FUNCTION get_dashboard_stats(user_role text DEFAULT 'admin')
RETURNS jsonb AS $$
DECLARE
  result jsonb;
  user_uuid uuid;
BEGIN
  user_uuid := auth.uid();
  
  CASE user_role
    WHEN 'admin' THEN
      SELECT jsonb_build_object(
        'totalUsers', (SELECT COUNT(*) FROM user_profiles),
        'totalSpaces', (SELECT COUNT(*) FROM parking_spaces),
        'totalBookings', (SELECT COUNT(*) FROM bookings),
        'totalRevenue', (SELECT COALESCE(SUM(total_amount), 0) FROM bookings WHERE status = 'completed'),
        'weeklyBookings', (
          SELECT jsonb_agg(
            jsonb_build_object(
              'day', TO_CHAR(date_series, 'Dy'),
              'bookings', COALESCE(booking_count, 0)
            )
          )
          FROM (
            SELECT 
              date_series,
              COUNT(b.id) as booking_count
            FROM generate_series(
              CURRENT_DATE - INTERVAL '6 days',
              CURRENT_DATE,
              INTERVAL '1 day'
            ) as date_series
            LEFT JOIN bookings b ON DATE(b.created_at) = date_series
            GROUP BY date_series
            ORDER BY date_series
          ) weekly_data
        ),
        'monthlyRevenue', (
          SELECT jsonb_agg(
            jsonb_build_object(
              'month', TO_CHAR(month_series, 'Mon'),
              'revenue', COALESCE(revenue, 0)
            )
          )
          FROM (
            SELECT 
              month_series,
              SUM(b.total_amount) as revenue
            FROM generate_series(
              DATE_TRUNC('month', CURRENT_DATE - INTERVAL '5 months'),
              DATE_TRUNC('month', CURRENT_DATE),
              INTERVAL '1 month'
            ) as month_series
            LEFT JOIN bookings b ON DATE_TRUNC('month', b.created_at) = month_series
              AND b.status = 'completed'
            GROUP BY month_series
            ORDER BY month_series
          ) monthly_data
        )
      ) INTO result;
      
    WHEN 'owner' THEN
      SELECT jsonb_build_object(
        'totalSpaces', (SELECT COUNT(*) FROM parking_spaces WHERE owner_id = user_uuid),
        'activeSpaces', (SELECT COUNT(*) FROM parking_spaces WHERE owner_id = user_uuid AND is_active = true),
        'totalBookings', (
          SELECT COUNT(*) FROM bookings b
          JOIN parking_spaces ps ON b.space_id = ps.id
          WHERE ps.owner_id = user_uuid
        ),
        'totalEarnings', (
          SELECT COALESCE(SUM(owner_earnings), 0) FROM transactions t
          WHERE t.space_owner_id = user_uuid AND t.status = 'succeeded'
        ),
        'averageRating', (
          SELECT COALESCE(AVG(rating), 0) FROM parking_spaces 
          WHERE owner_id = user_uuid AND review_count > 0
        )
      ) INTO result;
      
    WHEN 'user' THEN
      SELECT jsonb_build_object(
        'totalBookings', (SELECT COUNT(*) FROM bookings WHERE user_id = user_uuid),
        'activeBookings', (
          SELECT COUNT(*) FROM bookings 
          WHERE user_id = user_uuid AND status = 'confirmed' 
          AND start_date >= CURRENT_DATE
        ),
        'totalSpent', (
          SELECT COALESCE(SUM(total_amount), 0) FROM bookings 
          WHERE user_id = user_uuid AND status = 'completed'
        ),
        'favoriteSpaces', (
          SELECT COUNT(DISTINCT space_id) FROM bookings 
          WHERE user_id = user_uuid AND status = 'completed'
        )
      ) INTO result;
      
    ELSE
      result := '{}'::jsonb;
  END CASE;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get booking analytics for a date range
CREATE OR REPLACE FUNCTION get_booking_analytics(
  start_date date DEFAULT CURRENT_DATE - INTERVAL '30 days',
  end_date date DEFAULT CURRENT_DATE
)
RETURNS jsonb AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'totalBookings', COUNT(*),
    'confirmedBookings', COUNT(CASE WHEN status = 'confirmed' THEN 1 END),
    'completedBookings', COUNT(CASE WHEN status = 'completed' THEN 1 END),
    'cancelledBookings', COUNT(CASE WHEN status = 'cancelled' THEN 1 END),
    'totalRevenue', COALESCE(SUM(CASE WHEN status = 'completed' THEN total_amount ELSE 0 END), 0),
    'averageBookingValue', COALESCE(AVG(CASE WHEN status = 'completed' THEN total_amount END), 0),
    'bookingsByType', (
      SELECT jsonb_object_agg(ps.type, type_count)
      FROM (
        SELECT ps.type, COUNT(b.id) as type_count
        FROM bookings b
        JOIN parking_spaces ps ON b.space_id = ps.id
        WHERE b.created_at::date BETWEEN start_date AND end_date
        GROUP BY ps.type
      ) ps
    )
  )
  FROM bookings
  WHERE created_at::date BETWEEN start_date AND end_date
  INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant access to views and functions
GRANT SELECT ON analytics_overview TO authenticated;
GRANT SELECT ON owner_analytics TO authenticated;
GRANT SELECT ON revenue_analytics TO authenticated;
GRANT EXECUTE ON FUNCTION get_dashboard_stats(text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_booking_analytics(date, date) TO authenticated;