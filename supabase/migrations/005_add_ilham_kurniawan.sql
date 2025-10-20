-- Insert user Ilham Kurniawan (NIK: 251001077) with safe checks
DO $$
DECLARE
  v_user_id UUID;
  v_approver1_nik VARCHAR(20);
BEGIN
  -- Ensure profile exists
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE nik = '251001077') THEN
    INSERT INTO profiles (nik, name)
    VALUES ('251001077', 'Ilham Kurniawan');
  END IF;

  -- Fetch the user's id
  SELECT id INTO v_user_id FROM profiles WHERE nik = '251001077';

  -- Pick any existing Approver 1 as supervisor for this employee
  SELECT p.nik INTO v_approver1_nik
  FROM user_roles ur
  JOIN profiles p ON p.id = ur.user_id
  WHERE ur.role = 'approver1'
  ORDER BY p.nik
  LIMIT 1;

  -- Fallback to any existing profile if no approver1 exists yet (to satisfy constraint)
  IF v_approver1_nik IS NULL THEN
    SELECT p.nik INTO v_approver1_nik FROM profiles p WHERE p.nik <> '251001077' ORDER BY p.nik LIMIT 1;
  END IF;

  -- Create or update user_roles entry as employee with approver1 set
  -- Note: Constraint requires approver1_nik NOT NULL for employees
  IF NOT EXISTS (SELECT 1 FROM user_roles WHERE user_id = v_user_id) THEN
    INSERT INTO user_roles (user_id, role, approver1_nik)
    VALUES (v_user_id, 'employee', v_approver1_nik);
  ELSE
    UPDATE user_roles
    SET role = 'employee',
        approver1_nik = COALESCE(v_approver1_nik, approver1_nik)
    WHERE user_id = v_user_id;
  END IF;
END $$;
