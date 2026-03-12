-- Create a function to link the current auth user to their public user record
CREATE OR REPLACE FUNCTION link_user_identity()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_updated boolean;
    v_email text;
    v_uid uuid;
BEGIN
    -- Get current user's email and id
    v_uid := auth.uid();
    SELECT email INTO v_email FROM auth.users WHERE id = v_uid;

    -- Update the public users table
    UPDATE public.users
    SET auth_id = v_uid
    WHERE email = v_email
    AND auth_id IS NULL;
    
    GET DIAGNOSTICS v_updated = ROW_COUNT;
    RETURN v_updated > 0;
END;
$$;

GRANT EXECUTE ON FUNCTION link_user_identity() TO authenticated;
