# GetParking – תוכנית פרויקט

## Stack
- **Mobile:** Expo (React Native) + expo-router + TypeScript, `react-native-maps`, `expo-location`, `expo-notifications`, Zustand, i18next (עברית / RTL)
- **Backend:** Supabase – Postgres + PostGIS, Realtime, RPC functions (`security definer`), `pg_cron`
- **Auth:** Google / Apple (native, `signInWithIdToken`) + email OTP — ללא עלות SMS

## החלטות מוצר
| נושא | החלטה |
|---|---|
| ביטול אחרי match | הצד המבטל נסגר; הצד השני **חוזר אוטומטית לחיפוש/המתנה** ומנסה התאמה חדשה |
| קרדיטים למשתמש חדש | **3** |
| רדיוס התאמה | 1,500 מ' (בין מיקום המחפש לנקודת ה־handoff) |
| TTL חיפוש / פינוי | 15 / 20 דקות |
| TTL ל־match | 10 דקות |
| רדיוס אישור "חניתי" | 30 מ' בין שני הצדדים, מיקום של שניהם עדכני מ־20 שניות ובדיוק ≤ 50 מ' |
| Background location | יופעל — בשלב 7 |
| מפנה שמתרחק מהנקודה | נדחה לשלב 7 |

כל הערכים מוגדרים בפונקציה `public.cfg()` במיגרציה – שינוי במקום אחד.

## מודל נתונים
```
profiles        id, nickname, credits_balance, active_vehicle_id
vehicles        id, user_id, make_model, color, plate_last_digits, archived_at
sessions        id, user_id, vehicle_id, kind(search|leave), status,
                location, location_accuracy, location_at, handoff_point, expires_at
matches         id, search_session_id, leave_session_id, searcher_id, leaver_id,
                handoff_point, status, expires_at, cancelled_by
credit_ledger   id, user_id, match_id, delta, reason
```
טבלת `sessions` אחת עם `kind` במקום שתי טבלאות – ביטול, עדכון מיקום ותפוגה זהים לשני הסוגים.

סטטוסים:
- session: `active → matched → completed | cancelled | expired` (וגם `matched → active` כשהצד השני ביטל)
- match: `active → completed | cancelled | expired`

## API (RPC)
| פונקציה | תיאור |
|---|---|
| `set_active_vehicle(vehicle_id)` | בחירת רכב פעיל |
| `start_search(lat, lng, accuracy)` | בדיקת רכב פעיל + קרדיט ≥ 1, פתיחת session, ניסיון התאמה |
| `start_leave(lat, lng, accuracy)` | בדיקת רכב פעיל, שמירת handoff point, פתיחת session, ניסיון התאמה |
| `update_location(lat, lng, accuracy)` | מיקום אחרון; מחפש ללא match מנסה התאמה מחדש |
| `cancel_active()` | ביטול לפני/אחרי match |
| `confirm_parked(match_id)` | אימות קרבה בשרת, השלמה, -1 למחפש, +1 למפנה |
| `get_active_state()` | session + match + פרטים מינימליים של הצד השני (ל־resume ולמסכים) |
| `expire_and_sweep()` | pg_cron כל 15 שניות: תפוגות + ניסיון התאמה חוזר |

## Realtime
- **סטטוס:** `postgres_changes` על `sessions` (user_id = me) ועל `matches` (searcher_id / leaver_id = me) → קריאה ל־`get_active_state()`.
- **מיקום חי:** ערוץ Broadcast פרטי `match:{id}`, עדכון כל ~3 שניות. הרשאה רק לשני המשתתפים (RLS על `realtime.messages`).
- במקביל `update_location` לשרת כל ~5 שניות – זה המיקום שעליו השרת מאמת.

## שלבים
| # | שלב | סטטוס |
|---|---|---|
| 0 | Setup: Expo, Supabase, PostGIS, RTL, סכמה + RPCs | ✅ |
| 1 | Auth (Google / Apple / email OTP), פרופיל, רכבים, רכב פעיל | ✅ |
| 2 | Home: מפה, מיקום, bar עליון, כפתורים | ✅ |
| 3 | Sessions: התחלה / ביטול / תפוגה | ✅ |
| 4 | Matching + Realtime | ✅ |
| 5 | Live tracking: מרחק, בדרך / קרוב / הגיע | 🔄 בבדיקה |
| 6 | חניתי + קרדיטים + מסך הצלחה | |
| 7 | Background location, push, מפנה שמתרחק, resume | |
| 8 | בדיקות שטח, כיול רדיוסים וזמנים | |
