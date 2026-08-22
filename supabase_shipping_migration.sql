-- ROYRA JEWELS SHIPPING / COURIER MIGRATION
-- Safe to run against the existing shipments table.
ALTER TABLE public.shipments ADD COLUMN IF NOT EXISTS provider TEXT DEFAULT 'Manual';
ALTER TABLE public.shipments ADD COLUMN IF NOT EXISTS courier_id INTEGER;
ALTER TABLE public.shipments ADD COLUMN IF NOT EXISTS shipment_id_external TEXT;
ALTER TABLE public.shipments ADD COLUMN IF NOT EXISTS tracking_url TEXT;
ALTER TABLE public.shipments ADD COLUMN IF NOT EXISTS shipping_cost NUMERIC(12,2) DEFAULT 0;
ALTER TABLE public.shipments ADD COLUMN IF NOT EXISTS weight_kg NUMERIC(10,3) DEFAULT 0.500;
ALTER TABLE public.shipments ADD COLUMN IF NOT EXISTS length_cm NUMERIC(10,2) DEFAULT 0;
ALTER TABLE public.shipments ADD COLUMN IF NOT EXISTS width_cm NUMERIC(10,2) DEFAULT 0;
ALTER TABLE public.shipments ADD COLUMN IF NOT EXISTS height_cm NUMERIC(10,2) DEFAULT 0;
ALTER TABLE public.shipments ADD COLUMN IF NOT EXISTS cod_amount NUMERIC(12,2) DEFAULT 0;
ALTER TABLE public.shipments ADD COLUMN IF NOT EXISTS pickup_scheduled_at TIMESTAMPTZ;
ALTER TABLE public.shipments ADD COLUMN IF NOT EXISTS pickup_confirmed_at TIMESTAMPTZ;
ALTER TABLE public.shipments ADD COLUMN IF NOT EXISTS label_url TEXT;
ALTER TABLE public.shipments ADD COLUMN IF NOT EXISTS manifest_url TEXT;
ALTER TABLE public.shipments ADD COLUMN IF NOT EXISTS ndr_reason TEXT;
ALTER TABLE public.shipments ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.shipments ADD COLUMN IF NOT EXISTS last_tracking_at TIMESTAMPTZ;

ALTER TABLE public.shipments DROP CONSTRAINT IF EXISTS shipments_status_check;
ALTER TABLE public.shipments ADD CONSTRAINT shipments_status_check CHECK (status IN (
  'Pending','Ready to Ship','Pickup Scheduled','Picked Up','In Transit','Out for Delivery','Delivered','NDR','RTO','Cancelled','Lost','Damaged'
));

CREATE INDEX IF NOT EXISTS idx_shipments_awb ON public.shipments(tracking_number);
CREATE INDEX IF NOT EXISTS idx_shipments_provider ON public.shipments(provider);
CREATE INDEX IF NOT EXISTS idx_shipments_status ON public.shipments(status);

-- NOTE: Real Shiprocket/Delhivery/Blue Dart API credentials must stay server-side.
-- Store provider secrets only in a Supabase Edge Function secret store, never in GitHub Pages.
