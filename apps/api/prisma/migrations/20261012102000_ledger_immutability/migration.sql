-- safe-migration: Add composite unique index and immutability trigger on PaymentLedgerEntry

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "PaymentLedgerEntry_reference_type_key" ON "PaymentLedgerEntry"("reference", "type");

-- CreateFunction
CREATE OR REPLACE FUNCTION prevent_payment_ledger_mutation()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'payment_ledger_entries is append-only: UPDATE and DELETE are prohibited';
END;
$$ LANGUAGE plpgsql;

-- CreateTrigger
DROP TRIGGER IF EXISTS trg_payment_ledger_immutable ON "PaymentLedgerEntry";
CREATE TRIGGER trg_payment_ledger_immutable
BEFORE UPDATE OR DELETE ON "PaymentLedgerEntry"
FOR EACH ROW EXECUTE FUNCTION prevent_payment_ledger_mutation();
