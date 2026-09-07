ALTER TABLE "helpdesk_tickets"
ADD COLUMN "timeline" JSONB NOT NULL DEFAULT '[]';