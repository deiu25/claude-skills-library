CREATE TABLE "seller_account" (
	"user_id" text PRIMARY KEY NOT NULL,
	"stripe_account_id" text NOT NULL,
	"ready" boolean DEFAULT false NOT NULL,
	"country" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "seller_account_stripe_account_id_unique" UNIQUE("stripe_account_id"),
	CONSTRAINT "seller_account_country_check" CHECK ("seller_account"."country" ~ '^[A-Z]{2}$')
);
--> statement-breakpoint
ALTER TABLE "skill" ADD COLUMN "price_cents" integer;--> statement-breakpoint
ALTER TABLE "skill" ADD COLUMN "currency" text;--> statement-breakpoint
ALTER TABLE "seller_account" ADD CONSTRAINT "seller_account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skill" ADD CONSTRAINT "skill_price_cents_check" CHECK ("skill"."price_cents" > 0);--> statement-breakpoint
ALTER TABLE "skill" ADD CONSTRAINT "skill_currency_check" CHECK ("skill"."currency" in ('eur'));--> statement-breakpoint
ALTER TABLE "skill" ADD CONSTRAINT "skill_price_currency_check" CHECK (("skill"."price_cents" is null) = ("skill"."currency" is null));