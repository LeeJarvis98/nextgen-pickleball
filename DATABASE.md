# Tournament Database Schema

This document describes the Supabase (PostgreSQL) tables that power tournament data for the NextGen Pickleball web app. All tables live in the `public` schema with Row Level Security enabled and a public `SELECT` policy — any client with the anon key can read them. Writes require the service-role key or an explicit write policy.

---

## Entity Relationship Overview

```
tournaments (PK: id)
  ├── tournament_schedule          [1:1]
  ├── tournament_venues            [1:1]
  ├── tournament_prizes            [1:1]
  ├── tournament_prize_entries     [1:many]
  ├── tournament_registration_info [1:1]
  └── registrations                [1:many]  ← player sign-ups
```

---

## Tables

### `admin_users`

Stores admin credentials. Only accessible via the service-role key (no public RLS policy).

| Column          | Type                     | Nullable | Default             | Notes                                |
|-----------------|--------------------------|----------|---------------------|--------------------------------------|
| `id`            | uuid                     | NO       | `gen_random_uuid()` | PK                                   |
| `username`      | text                     | NO       | —                   | Unique login identifier              |
| `password_hash` | text                     | NO       | —                   | bcrypt hash of the password          |
| `created_at`    | timestamptz              | NO       | `now()`             | Auto-set on insert                   |

To create an admin user, run this SQL in Supabase (replace values):
```sql
INSERT INTO admin_users (username, password_hash)
VALUES ('admin', crypt('your_password_here', gen_salt('bf', 12)));
```

---

### `tournaments`

Root record for each tournament. Every other table references this via `tournament_id`.

| Column       | Type    | Nullable | Default      | Notes                                      |
|--------------|---------|----------|--------------|--------------------------------------------|
| `id`         | text    | NO       | —            | Primary key. Human-readable slug, e.g. `tournament-01` |
| `name`       | text    | NO       | —            | Display name, e.g. `NextGen Pickleball Open #1` |
| `status`     | text    | NO       | `UPCOMING`   | Enum: `UPCOMING` \| `ONGOING` \| `COMPLETED` |
| `sort_order` | integer | NO       | `0`          | Ascending sort for carousel display order  |

---

### `tournament_schedule`

One row per tournament. Holds all date/time information.

| Column          | Type | Nullable | Default | Notes                              |
|-----------------|------|----------|---------|------------------------------------|
| `tournament_id` | text | NO       | —       | PK + FK → `tournaments.id`         |
| `start_date`    | date | NO       | —       | ISO 8601, e.g. `2026-03-15`        |
| `end_date`      | date | NO       | —       | ISO 8601                           |
| `display_date`  | text | NO       | —       | Human-readable, e.g. `15 - 16 / 03 / 2026` |
| `check_in_time` | text | NO       | —       | e.g. `07:00 AM`                    |
| `opening_time`  | text | NO       | —       | e.g. `08:00 AM`                    |
| `closing_time`  | text | NO       | —       | e.g. `06:00 PM`                    |

---

### `tournament_venues`

One row per tournament. Holds venue/location details.

| Column          | Type    | Nullable | Default | Notes                              |
|-----------------|---------|----------|---------|------------------------------------|
| `tournament_id` | text    | NO       | —       | PK + FK → `tournaments.id`         |
| `name`          | text    | NO       | —       | Venue name                         |
| `image_url`     | text    | NO       | —       | Full URL to venue photo            |
| `courts`        | integer | NO       | —       | Number of courts available         |
| `court_type`    | text    | NO       | —       | e.g. `Indoor Hard Court`           |
| `city`          | text    | NO       | —       | e.g. `TP. Hồ Chí Minh`            |
| `country`       | text    | NO       | —       | e.g. `Việt Nam`                    |

---

### `tournament_prizes`

One row per tournament. Stores the total prize pool header.

| Column          | Type | Nullable | Default | Notes                              |
|-----------------|------|----------|---------|------------------------------------|
| `tournament_id` | text | NO       | —       | PK + FK → `tournaments.id`         |
| `total_prize`   | text | NO       | —       | Display string, e.g. `10.000.000 VNĐ` |

---

### `tournament_prize_entries`

One row per prize rank per tournament.

| Column          | Type    | Nullable | Default              | Notes                                     |
|-----------------|---------|----------|----------------------|-------------------------------------------|
| `id`            | uuid    | NO       | `gen_random_uuid()`  | Surrogate PK                              |
| `tournament_id` | text    | NO       | —                    | FK → `tournaments.id`                     |
| `rank`          | integer | NO       | —                    | `1` = champion, `2` = runner-up, `3` = 3rd place. Unique per tournament. |
| `title`         | text    | NO       | —                    | Display label, e.g. `Vô Địch`             |
| `amount`        | text    | NO       | —                    | Display string, e.g. `5.000.000 VNĐ`      |
| `bonus`         | text    | YES      | `NULL`               | Optional extra reward, e.g. `CUP & HUY CHƯƠNG VÀNG` |

**Unique constraint:** `(tournament_id, rank)`

---

### `tournament_registration_info`

One row per tournament. Drives the registration section UI.

| Column                 | Type    | Nullable | Default | Notes                                        |
|------------------------|---------|----------|---------|----------------------------------------------|
| `tournament_id`        | text    | NO       | —       | PK + FK → `tournaments.id`                   |
| `deadline`             | text    | NO       | —       | Short display string, e.g. `10/03/2026`      |
| `deadline_date_time`   | text    | NO       | —       | Full display string, e.g. `23:59 · 10.03.2026` |
| `total_slots`          | integer | NO       | —       | Maximum number of participants               |
| `registration_link`    | text    | NO       | —       | Short link or URL, e.g. `bit.ly/nextgen-s1`  |
| `cta_title`            | text    | NO       | —       | Headline for registration CTA card           |
| `cta_description`      | text    | NO       | —       | Body text for registration CTA card          |
| `features`             | text[]  | NO       | `{}`    | Bullet-point feature list shown below CTA button |
| `available_categories`  | text[]  | NO       | `{}`      | Subset of category values the tournament supports. Controls which options appear in the registration form. See **Category values** below. |
| `doubles_partner_mode`  | text    | NO       | `'fixed'`       | Enum: `fixed` \| `random`. If `fixed`, players registering for any doubles category must provide a partner name. If `random`, the organiser will match partners — no partner name field is shown. |
| `entry_fee_mode`        | text    | NO       | `'per_category'`| Enum: `per_category` \| `flat`. Controls how the entry fee is presented in the registration modal. |
| `entry_fee`             | text    | YES      | `NULL`          | Used when `entry_fee_mode = 'flat'`. A single display string shown below the category table, e.g. `"200.000 VNĐ"`. Ignored when mode is `per_category`. |
| `category_fees`         | jsonb   | YES      | `NULL`          | Used when `entry_fee_mode = 'per_category'`. Per-category fee display strings. Keys are category values (e.g. `singles_male`). Values are display strings, e.g. `"200.000 VNĐ"`. If `NULL` or a key is absent, no fee is shown for that category. |

---

### `registrations`

Player sign-ups. Extended with `tournament_id`, `gender`, and expanded `category` values.

| Column          | Type                     | Nullable | Default              | Notes                                               |
|-----------------|--------------------------|----------|----------------------|-----------------------------------------------------|
| `id`            | uuid                     | NO       | `gen_random_uuid()`  | PK                                                  |
| `created_at`    | timestamp with time zone | NO       | `now()`              | Auto-set on insert                                  |
| `full_name`     | text                     | NO       | —                    |                                                     |
| `phone`         | text                     | NO       | —                    |                                                     |
| `email`         | text                     | NO       | —                    |                                                     |
| `gender`        | text                     | NO       | `male`               | Enum: `male` \| `female`                            |
| `category`      | text[]                   | NO       | —                    | Array of selected category values. See **Category values** below. Min 1 element. |
| `partner_name`  | text                     | YES      | `NULL`               | Required only when the player selected at least one doubles category **and** the tournament's `doubles_partner_mode` is `fixed`. |
| `notes`         | text                     | YES      | `NULL`               |                                                     |
| `status`        | text                     | NO       | `pending`            | Enum: `pending` \| `confirmed` \| `cancelled`       |
| `tournament_id` | text                     | YES      | `NULL`               | FK → `tournaments.id` (SET NULL on tournament delete) |

#### Category values

Used in both `registrations.category` and `tournament_registration_info.available_categories`:

| Value            | Display label     | Shown to gender |
|------------------|-------------------|------------------|
| `singles_male`   | Đấu Đơn — Nam     | Male only        |
| `singles_female` | Đấu Đơn — Nữ      | Female only      |
| `doubles_male`   | Đấu Đôi — Nam / Nam | Both           |
| `doubles_female` | Đấu Đôi — Nữ / Nữ  | Both           |
| `doubles_mixed`  | Đấu Đôi — Nam / Nữ  | Both           |

Multiple categories may be selected per registration (stored as a `text[]` array).

The registration form filters category options based on:
1. **`available_categories`** in the tournament — only these options are shown.
2. **`gender`** selected by the participant — `singles_male` is only shown to `male`, `singles_female` only to `female`.
3. **`doubles_partner_mode`** — if `random`, the partner name field is hidden entirely; the organiser will match doubles partners. If `fixed`, the partner name field is required when any doubles category is selected.

---

## Access Control (RLS)

| Table                          | SELECT | INSERT | UPDATE | DELETE |
|--------------------------------|--------|--------|--------|--------|
| `tournaments`                  | ✅ public | ❌ | ❌ | ❌ |
| `tournament_schedule`          | ✅ public | ❌ | ❌ | ❌ |
| `tournament_venues`            | ✅ public | ❌ | ❌ | ❌ |
| `tournament_prizes`            | ✅ public | ❌ | ❌ | ❌ |
| `tournament_prize_entries`     | ✅ public | ❌ | ❌ | ❌ |
| `tournament_registration_info` | ✅ public | ❌ | ❌ | ❌ |
| `registrations`                | ❌ (service role) | ✅ via API | ❌ | ❌ |

To add or edit tournaments you need the **service-role key**. Tournament data is intended to be managed directly via the Supabase dashboard or a secure admin tool — there is no public-facing admin API.

---

## Supabase Query Example

Fetch all tournaments with every related table in one request:

```ts
const { data } = await supabase
  .from('tournaments')
  .select(`
    id, name, status,
    tournament_schedule ( start_date, end_date, display_date, check_in_time, opening_time, closing_time ),
    tournament_venues ( name, image_url, courts, court_type, city, country ),
    tournament_prizes ( total_prize ),
    tournament_prize_entries ( rank, title, amount, bonus ),
    tournament_registration_info ( deadline, deadline_date_time, total_slots, registration_link, cta_title, cta_description, features, available_categories, doubles_partner_mode )
  `)
  .order('sort_order');
```

> PostgREST returns 1:1 relations (`tournament_schedule`, `tournament_venues`, etc.) as plain objects and 1:many relations (`tournament_prize_entries`) as arrays.

---

## Adding a New Tournament

Insert rows in this order (FK dependencies require the parent to exist first):

1. `tournaments`
2. `tournament_schedule`
3. `tournament_venues`
4. `tournament_prizes`
5. `tournament_prize_entries` (one row per rank)
6. `tournament_registration_info`

```sql
INSERT INTO public.tournaments (id, name, status, sort_order)
VALUES ('tournament-03', 'NextGen Pickleball Open #3', 'UPCOMING', 3);

INSERT INTO public.tournament_schedule VALUES
  ('tournament-03', '2026-07-18', '2026-07-19', '18 - 19 / 07 / 2026', '07:00 AM', '08:00 AM', '06:00 PM');

-- ... venue, prizes, prize_entries rows ...

INSERT INTO public.tournament_registration_info VALUES
  ('tournament-03', '30/06/2026', '23:59 · 30.06.2026', 64, 'bit.ly/nextgen-s3',
   'Trở thành nhà vô địch NextGen Season 3',
   'Mô tả giải đấu...',
   ARRAY['Thi đấu 1vs1 & 2vs2', 'Trọng tài chuyên nghiệp', 'Giải thưởng hấp dẫn'],
   -- available_categories: choose any subset of the 5 category values
   ARRAY['singles_male', 'singles_female', 'doubles_male', 'doubles_female', 'doubles_mixed'],
   -- doubles_partner_mode: 'fixed' (player names a partner) or 'random' (organiser matches)
   'fixed');
```
