-- Ensure idempotency keys cannot be duplicated (NULLs allowed)
CREATE UNIQUE INDEX IF NOT EXISTS credits_ledger_idempotency_key_uniq
  ON public.credits_ledger (idempotency_key)
  WHERE idempotency_key IS NOT NULL;

-- Atomic credit reservation to prevent race conditions
CREATE OR REPLACE FUNCTION public.reserve_credits_atomic(
  user_id_param uuid,
  amount_param integer,
  job_id_param uuid,
  idempotency_key_param text,
  description_param text DEFAULT NULL
)
RETURNS TABLE(success boolean, new_balance integer, error_msg text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_bal integer;
  new_bal integer;
  existing_bal integer;
BEGIN
  IF amount_param IS NULL OR amount_param <= 0 THEN
    RETURN QUERY SELECT FALSE, 0, 'Invalid amount';
    RETURN;
  END IF;

  IF idempotency_key_param IS NULL OR length(idempotency_key_param) = 0 THEN
    RETURN QUERY SELECT FALSE, 0, 'Missing idempotency key';
    RETURN;
  END IF;

  -- Serialize per idempotency key to prevent duplicate spends under retries
  PERFORM pg_advisory_xact_lock(hashtext(idempotency_key_param));

  SELECT balance_after INTO existing_bal
  FROM public.credits_ledger
  WHERE idempotency_key = idempotency_key_param
  LIMIT 1;

  IF existing_bal IS NOT NULL THEN
    RETURN QUERY SELECT TRUE, existing_bal, NULL::text;
    RETURN;
  END IF;

  -- Ensure a balance row exists
  INSERT INTO public.credit_balances (user_id, balance, updated_at)
  VALUES (user_id_param, 0, now())
  ON CONFLICT (user_id) DO NOTHING;

  -- Lock the user's balance row
  SELECT balance INTO current_bal
  FROM public.credit_balances
  WHERE user_id = user_id_param
  FOR UPDATE;

  IF current_bal IS NULL THEN
    RETURN QUERY SELECT FALSE, 0, 'User balance not found';
    RETURN;
  END IF;

  IF current_bal < amount_param THEN
    RETURN QUERY SELECT FALSE, current_bal, 'Insufficient credits';
    RETURN;
  END IF;

  new_bal := current_bal - amount_param;

  UPDATE public.credit_balances
  SET balance = new_bal,
      updated_at = now()
  WHERE user_id = user_id_param;

  BEGIN
    INSERT INTO public.credits_ledger (
      user_id,
      tx_type,
      amount,
      balance_after,
      job_id,
      idempotency_key,
      description
    ) VALUES (
      user_id_param,
      'spend',
      -amount_param,
      new_bal,
      job_id_param,
      idempotency_key_param,
      COALESCE(description_param, 'Generation job reservation')
    );
  EXCEPTION
    WHEN unique_violation THEN
      -- Another request won the race for this idempotency key; return canonical ledger result
      SELECT balance_after INTO existing_bal
      FROM public.credits_ledger
      WHERE idempotency_key = idempotency_key_param
      LIMIT 1;

      IF existing_bal IS NULL THEN
        RETURN QUERY SELECT FALSE, current_bal, 'Reservation conflict';
        RETURN;
      END IF;

      UPDATE public.credit_balances
      SET balance = existing_bal,
          updated_at = now()
      WHERE user_id = user_id_param;

      RETURN QUERY SELECT TRUE, existing_bal, NULL::text;
      RETURN;
  END;

  RETURN QUERY SELECT TRUE, new_bal, NULL::text;
END;
$$;

-- Atomic credit release (refund) for failed reservations
CREATE OR REPLACE FUNCTION public.release_credits_atomic(
  user_id_param uuid,
  amount_param integer,
  job_id_param uuid,
  idempotency_key_param text,
  description_param text DEFAULT NULL
)
RETURNS TABLE(success boolean, new_balance integer, error_msg text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_bal integer;
  new_bal integer;
  existing_bal integer;
BEGIN
  IF amount_param IS NULL OR amount_param <= 0 THEN
    RETURN QUERY SELECT FALSE, 0, 'Invalid amount';
    RETURN;
  END IF;

  IF idempotency_key_param IS NULL OR length(idempotency_key_param) = 0 THEN
    RETURN QUERY SELECT FALSE, 0, 'Missing idempotency key';
    RETURN;
  END IF;

  PERFORM pg_advisory_xact_lock(hashtext(idempotency_key_param));

  SELECT balance_after INTO existing_bal
  FROM public.credits_ledger
  WHERE idempotency_key = idempotency_key_param
  LIMIT 1;

  IF existing_bal IS NOT NULL THEN
    RETURN QUERY SELECT TRUE, existing_bal, NULL::text;
    RETURN;
  END IF;

  INSERT INTO public.credit_balances (user_id, balance, updated_at)
  VALUES (user_id_param, 0, now())
  ON CONFLICT (user_id) DO NOTHING;

  SELECT balance INTO current_bal
  FROM public.credit_balances
  WHERE user_id = user_id_param
  FOR UPDATE;

  IF current_bal IS NULL THEN
    RETURN QUERY SELECT FALSE, 0, 'User balance not found';
    RETURN;
  END IF;

  new_bal := current_bal + amount_param;

  UPDATE public.credit_balances
  SET balance = new_bal,
      updated_at = now()
  WHERE user_id = user_id_param;

  BEGIN
    INSERT INTO public.credits_ledger (
      user_id,
      tx_type,
      amount,
      balance_after,
      job_id,
      idempotency_key,
      description
    ) VALUES (
      user_id_param,
      'refund',
      amount_param,
      new_bal,
      job_id_param,
      idempotency_key_param,
      COALESCE(description_param, 'Credit release')
    );
  EXCEPTION
    WHEN unique_violation THEN
      SELECT balance_after INTO existing_bal
      FROM public.credits_ledger
      WHERE idempotency_key = idempotency_key_param
      LIMIT 1;

      IF existing_bal IS NULL THEN
        RETURN QUERY SELECT FALSE, current_bal, 'Release conflict';
        RETURN;
      END IF;

      UPDATE public.credit_balances
      SET balance = existing_bal,
          updated_at = now()
      WHERE user_id = user_id_param;

      RETURN QUERY SELECT TRUE, existing_bal, NULL::text;
      RETURN;
  END;

  RETURN QUERY SELECT TRUE, new_bal, NULL::text;
END;
$$;

-- Restrict these functions so they cannot be called from client roles
REVOKE ALL ON FUNCTION public.reserve_credits_atomic(uuid, integer, uuid, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.reserve_credits_atomic(uuid, integer, uuid, text, text) TO service_role;

REVOKE ALL ON FUNCTION public.release_credits_atomic(uuid, integer, uuid, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.release_credits_atomic(uuid, integer, uuid, text, text) TO service_role;