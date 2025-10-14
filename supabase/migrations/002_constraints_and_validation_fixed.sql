-- Add constraints and validation rules

-- Add check constraints for overtime_requests
ALTER TABLE overtime_requests 
ADD CONSTRAINT check_duration_positive 
CHECK (duration > 0);

ALTER TABLE overtime_requests 
ADD CONSTRAINT check_end_time_after_start_time 
CHECK (end_time > start_time OR (end_time < start_time AND date < date + INTERVAL '1 day'));

-- Add constraint to prevent duplicate overtime requests for same user and date
ALTER TABLE overtime_requests 
ADD CONSTRAINT unique_user_date_category 
UNIQUE (user_id, date, category_key);

-- Add constraint to ensure approver hierarchy
ALTER TABLE user_roles 
ADD CONSTRAINT check_approver_hierarchy 
CHECK (
    (role = 'employee' AND approver1_nik IS NOT NULL) OR
    (role = 'approver1' AND approver2_nik IS NOT NULL) OR
    (role = 'approver2' AND approver1_nik IS NULL AND approver2_nik IS NULL) OR
    (role = 'admin' AND approver1_nik IS NULL AND approver2_nik IS NULL)
);

-- Create function to validate overtime request
CREATE OR REPLACE FUNCTION validate_overtime_request(
    _user_id UUID,
    _date DATE,
    _category_key VARCHAR,
    _start_time TIME,
    _end_time TIME
)
RETURNS BOOLEAN AS $$
DECLARE
    existing_count INTEGER;
    user_role app_role;
BEGIN
    -- Check if user exists and get role
    SELECT get_user_role(_user_id) INTO user_role;
    
    IF user_role IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Check for duplicate request on same date and category
    SELECT COUNT(*) INTO existing_count
    FROM overtime_requests
    WHERE user_id = _user_id 
    AND date = _date 
    AND category_key = _category_key
    AND status IN ('pending', 'approved');
    
    IF existing_count > 0 THEN
        RETURN FALSE;
    END IF;
    
    -- Validate time range
    IF _end_time <= _start_time THEN
        RETURN FALSE;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Create function to get pending requests for approver
CREATE OR REPLACE FUNCTION get_pending_requests_for_approver(_approver_nik VARCHAR)
RETURNS TABLE(
    id INTEGER,
    user_id UUID,
    nik VARCHAR,
    name VARCHAR,
    category VARCHAR,
    category_key VARCHAR,
    date DATE,
    start_time TIME,
    end_time TIME,
    duration DECIMAL,
    reason TEXT,
    status overtime_status,
    approver1_status overtime_status,
    approver2_status overtime_status,
    approver1_name VARCHAR,
    approver2_name VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
    approver_role app_role;
BEGIN
    -- Get approver role
    SELECT ur.role INTO approver_role
    FROM user_roles ur
    JOIN profiles p ON ur.user_id = p.id
    WHERE p.nik = _approver_nik;
    
    -- Return requests based on role
    IF approver_role = 'approver1' THEN
        RETURN QUERY
        SELECT 
            ot.id, ot.user_id, ot.nik, ot.name, ot.category, ot.category_key,
            ot.date, ot.start_time, ot.end_time, ot.duration, ot.reason,
            ot.status, ot.approver1_status, ot.approver2_status,
            ot.approver1_name, ot.approver2_name, ot.created_at
        FROM overtime_requests ot
        WHERE ot.approver1_status = 'pending'
        ORDER BY ot.created_at DESC;
        
    ELSIF approver_role = 'approver2' THEN
        RETURN QUERY
        SELECT 
            ot.id, ot.user_id, ot.nik, ot.name, ot.category, ot.category_key,
            ot.date, ot.start_time, ot.end_time, ot.duration, ot.reason,
            ot.status, ot.approver1_status, ot.approver2_status,
            ot.approver1_name, ot.approver2_name, ot.created_at
        FROM overtime_requests ot
        WHERE ot.approver1_status = 'approved' 
        AND ot.approver2_status = 'pending'
        ORDER BY ot.created_at DESC;
        
    ELSIF approver_role = 'admin' THEN
        RETURN QUERY
        SELECT 
            ot.id, ot.user_id, ot.nik, ot.name, ot.category, ot.category_key,
            ot.date, ot.start_time, ot.end_time, ot.duration, ot.reason,
            ot.status, ot.approver1_status, ot.approver2_status,
            ot.approver1_name, ot.approver2_name, ot.created_at
        FROM overtime_requests ot
        WHERE ot.status = 'pending'
        ORDER BY ot.created_at DESC;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Create function to get overtime statistics
CREATE OR REPLACE FUNCTION get_overtime_statistics(_start_date DATE, _end_date DATE)
RETURNS TABLE(
    total_requests BIGINT,
    pending_requests BIGINT,
    approved_requests BIGINT,
    rejected_requests BIGINT,
    total_hours DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_requests,
        COUNT(*) FILTER (WHERE status = 'pending') as pending_requests,
        COUNT(*) FILTER (WHERE status = 'approved') as approved_requests,
        COUNT(*) FILTER (WHERE status = 'rejected') as rejected_requests,
        COALESCE(SUM(duration) FILTER (WHERE status = 'approved'), 0) as total_hours
    FROM overtime_requests
    WHERE date BETWEEN _start_date AND _end_date;
END;
$$ LANGUAGE plpgsql;

-- Create function to get user overtime report
CREATE OR REPLACE FUNCTION get_user_overtime_report(
    _user_nik VARCHAR,
    _start_date DATE,
    _end_date DATE
)
RETURNS TABLE(
    nik VARCHAR,
    name VARCHAR,
    total_hours DECIMAL,
    total_requests BIGINT,
    approved_requests BIGINT,
    rejected_requests BIGINT,
    pending_requests BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ot.nik,
        ot.name,
        COALESCE(SUM(ot.duration) FILTER (WHERE ot.status = 'approved'), 0) as total_hours,
        COUNT(*) as total_requests,
        COUNT(*) FILTER (WHERE ot.status = 'approved') as approved_requests,
        COUNT(*) FILTER (WHERE ot.status = 'rejected') as rejected_requests,
        COUNT(*) FILTER (WHERE ot.status = 'pending') as pending_requests
    FROM overtime_requests ot
    WHERE ot.nik = _user_nik 
    AND ot.date BETWEEN _start_date AND _end_date
    GROUP BY ot.nik, ot.name;
END;
$$ LANGUAGE plpgsql;

-- Create view for overtime requests with user details
CREATE VIEW overtime_requests_with_details AS
SELECT 
    ot.id,
    ot.user_id,
    ot.nik,
    ot.name,
    ot.category,
    ot.category_key,
    ot.date,
    ot.start_time,
    ot.end_time,
    ot.duration,
    ot.reason,
    ot.status,
    ot.approver1_status,
    ot.approver2_status,
    ot.approver1_name,
    ot.approver2_name,
    ot.approver1_approved_at,
    ot.approver2_approved_at,
    ot.created_at,
    ot.updated_at,
    p.pickup_point,
    ur.role as user_role,
    ur.approver1_nik,
    ur.approver2_nik
FROM overtime_requests ot
JOIN profiles p ON ot.user_id = p.id
LEFT JOIN user_roles ur ON ot.user_id = ur.user_id;

-- Grant permissions
GRANT SELECT ON overtime_requests_with_details TO authenticated;
GRANT EXECUTE ON FUNCTION get_pending_requests_for_approver TO authenticated;
GRANT EXECUTE ON FUNCTION get_overtime_statistics TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_overtime_report TO authenticated;
GRANT EXECUTE ON FUNCTION validate_overtime_request TO authenticated;
GRANT EXECUTE ON FUNCTION update_overtime_status TO authenticated;
