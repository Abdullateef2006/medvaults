# MedVault+ — Future Updates Roadmap

> **Core thesis**: *"The more personalized a health AI gets, the more dangerous a breach becomes — so we built the consent/visibility layer as the core feature, not an afterthought."*

---

## Status Key

| Emoji | Meaning |
|-------|---------|
| 🟢 | **High priority — do this** |
| 🟡 | **Medium priority — strong value but can wait** |
| 🔴 | **Nice to have — lower ROI for effort** |

---

## 1. Deepen Personalization (Currently the Weaker Half)

### 1A. 🟢 Adaptive Health Tips (Personalization Loop)

**Problem**: Health tips are currently one-shot — the same profile always produces similar tips. There's no memory, no learning, no evolution.

**Solution**: Store every generated tip + user engagement signals, then feed recent tip history back into the next GPT prompt so tips evolve over time.

**Worth it?** **Absolutely yes.** This is the single highest-impact change for the "personalization" half. It turns a static GPT call into a learning loop, which is exactly what judges mean by "AI personalization." It's also relatively cheap to implement.

**Implementation sketch**:

```
New model: HealthTip
─────────────────────
- user (FK → CustomUser)
- tip_text (TextField)
- category (CharField) — e.g. "nutrition", "exercise", "medication", "mental_health"
- was_viewed (BooleanField, default=False)
- was_helpful (BooleanField, nullable)  — user marks thumbs up/down
- was_dismissed (BooleanField, default=False)
- generated_at (DateTimeField)
- engagement_score (FloatField) — computed: viewed=0.3, helpful=1.0, dismissed=-0.5
```

**Modified GPT prompt**:
```
You are a medical assistant. Generate 3 NEW health tips for this patient.

Patient profile:
{profile_data}

RECENT TIP HISTORY (last 2 weeks):
- "Reduce sodium intake" → user found this HELPFUL
- "Try 30 min daily walks" → user DISMISSED this
- "Monitor blood pressure weekly" → user VIEWED but gave no feedback

RULES:
- Do NOT repeat tips similar to ones already given
- Generate MORE tips in categories the user found helpful
- AVOID topics the user dismissed
- Evolve previous helpful tips into deeper/more specific follow-ups
```

**Effort**: ~4-6 hours (new model, migration, modified view, 2 new endpoints for feedback)

---

### 1B. 🟢 Personalized Risk Scoring (Not Just Allergen Matching)

**Problem**: Current allergen risk is a fixed confidence threshold (`<0.45` = low, `0.45-0.7` = medium, `>0.7` = high). Same thresholds for everyone regardless of allergy severity.

**Solution**: Factor in the user's documented allergy severity to shift the risk curve per-user.

**Worth it?** **Yes — high demo value, low effort.** Same AI call, but output is now individualized. This is a one-paragraph code change that makes the feature genuinely personalized instead of generic.

**Implementation sketch**:

```
Modified EmergencyProfile:
─────────────────────────
- allergy_details (JSONField) — replaces plain-text allergies field
  Example: [
    {"allergen": "peanut", "severity": "severe", "reaction": "anaphylaxis"},
    {"allergen": "dairy", "severity": "mild", "reaction": "bloating"},
    {"allergen": "gluten", "severity": "moderate", "reaction": "rash"}
  ]
```

**Modified risk calculation**:
```python
# Severity multipliers shift the risk curve
SEVERITY_MULTIPLIERS = {
    "severe": 1.8,    # peanut allergy + 0.3 confidence → still HIGH risk
    "moderate": 1.2,
    "mild": 0.7,       # mild dairy + 0.5 confidence → stays LOW risk
}

adjusted_confidence = confidence * SEVERITY_MULTIPLIERS.get(severity, 1.0)

if adjusted_confidence > 0.7:
    risk = "high"
elif adjusted_confidence > 0.4:
    risk = "medium"
else:
    risk = "low"
```

**Effort**: ~2-3 hours (model migration, view logic change, frontend form update)

---

### 1C. 🟢 Personalized Emergency Response (Condition-Aware Hospital Matching)

**Problem**: Haversine hospital search is the same algorithm for everyone — pure distance ranking. A cardiac patient and a burn victim get the same hospital list.

**Solution**: Factor in user's documented conditions to prioritize hospitals with matching specializations from their `specification` JSON field.

**Worth it?** **This is the money feature.** "AI-powered personalization that could save your life" is the most demoable, most emotionally compelling improvement. It's also a clean algorithm change — no new APIs needed.

**Implementation sketch**:

```python
# Current: sorted purely by distance
nearest_hospitals = sorted(hospital_distances, key=lambda x: x['distance_km'])[:5]

# New: weighted score combining distance + specialization match
def calculate_hospital_score(hospital, user_conditions, distance_km):
    # Base distance score (closer = higher, max 10 points)
    distance_score = max(0, 10 - distance_km)

    # Specialization match score
    specs = [s.lower().strip() for s in hospital.specification]
    condition_keywords = extract_keywords(user_conditions)  # "heart disease" → ["cardiology", "cardiac"]

    match_count = sum(1 for kw in condition_keywords if any(kw in spec for spec in specs))
    spec_score = match_count * 5  # each match = 5 points

    # Emergency services bonus
    emergency_bonus = 3 if hospital.emergency_services else 0

    return distance_score + spec_score + emergency_bonus

# Sort by composite score instead of raw distance
hospital_scores = [
    {
        'hospital': h['hospital'],
        'distance_km': h['distance_km'],
        'score': calculate_hospital_score(h['hospital'], user_conditions, h['distance_km']),
        'match_reason': get_match_reason(h['hospital'], user_conditions)
    }
    for h in hospital_distances
]
nearest_hospitals = sorted(hospital_scores, key=lambda x: -x['score'])[:5]
```

**Condition → Keyword mapping**:
```python
CONDITION_SPECIALTY_MAP = {
    "heart disease": ["cardiology", "cardiac"],
    "diabetes": ["endocrinology", "diabetic"],
    "asthma": ["pulmonology", "respiratory"],
    "pregnancy": ["obstetrics", "maternity", "gynecology"],
    "fracture": ["orthopedics", "trauma"],
    "burn": ["burn center", "plastic surgery"],
    "stroke": ["neurology", "stroke center"],
    "kidney": ["nephrology", "dialysis"],
    "cancer": ["oncology"],
    "mental health": ["psychiatry", "psychology"],
}
```

**SMS output would change from**:
```
1. Lagos General (2.3 km)
2. City Hospital (3.1 km)
```

**To**:
```
1. ★ Heart Care Specialist (3.1 km) — matches your condition: cardiology
2. Lagos General (2.3 km) — general hospital
```

**Effort**: ~3-4 hours (algorithm change in views.py, condition keyword mapping, modified SMS template)

---

## 2. Close Security Gaps (Non-Negotiable)

### 2A. 🟢 Secrets to Environment Variables

**Problem**: API keys, secrets, and credentials are hardcoded in source files:
- Cloudinary API key/secret in `settings.py`
- Paystack keys in `settings.py`
- Twilio SID/token in `views.py`
- Nyckel credentials in `views.py`
- OpenAI API key in `views.py`
- Gmail app password in `settings.py`
- Django SECRET_KEY in `settings.py`

**Worth it?** **Non-negotiable. Do this first.** This is table stakes for any security-themed project. If judges see hardcoded API keys in a security-focused submission, it's an instant credibility hit.

**Implementation**: Move everything to `.env` file, load via `python-dotenv` (already partially set up for Twilio).

**Effort**: ~1-2 hours

---

### 2B. 🟢 Field-Level Encryption on Sensitive Emergency Profile Data

**Problem**: Blood type, conditions, medications are stored as plaintext in SQLite. If the database file is compromised, all medical data is exposed.

**Solution**: Encrypt sensitive fields at rest using `django-encrypted-model-fields` or `django-fernet-fields`.

**Worth it?** **Yes — directly hits the "security" theme.** Medical data encryption at rest is a real-world compliance requirement (HIPAA, NDPR). It's also very demoable: "even if someone steals our database file, they can't read your medical records."

**Implementation sketch**:
```python
from encrypted_model_fields.fields import EncryptedCharField, EncryptedTextField

class EmergencyProfile(models.Model):
    blood_type = EncryptedCharField(max_length=5)
    conditions = EncryptedTextField()
    medications = EncryptedTextField()
    allergies = EncryptedTextField()
    # ... other fields remain plaintext (non-sensitive)
```

**Effort**: ~2-3 hours (install package, migrate fields, test read/write)

---

### 2C. 🟡 Rate-Limiting on `/emergency/<uuid>/`

**Problem**: This public endpoint has no rate limit. An attacker could brute-force UUID guesses or scrape profiles.

**Worth it?** **Yes, but lower priority than 2A/2B.** UUIDs are practically unguessable, but rate-limiting is defense-in-depth and shows security awareness.

**Implementation**: Use `django-ratelimit` or DRF throttling.

```python
from rest_framework.throttling import AnonRateThrottle

class QRCodeRateThrottle(AnonRateThrottle):
    rate = '10/minute'  # Max 10 scans per minute per IP

class QRCodeStatusPublicView(APIView):
    throttle_classes = [QRCodeRateThrottle]
    # ...
```

**Effort**: ~1 hour

---

### 2D. 🟢 PIN Lockout on Wallet After N Failed Attempts

**Problem**: Currently unlimited PIN attempts. Brute-forcing a 4-digit PIN (10,000 combinations) is trivial.

**Worth it?** **Yes — this is a basic financial security control.** Easy to implement, very demoable.

**Implementation sketch**:
```python
# Add to Wallet model:
failed_pin_attempts = models.IntegerField(default=0)
locked_until = models.DateTimeField(null=True, blank=True)

MAX_PIN_ATTEMPTS = 5
LOCKOUT_DURATION = timedelta(minutes=30)

# In withdrawal/deposit views:
if wallet.locked_until and timezone.now() < wallet.locked_until:
    remaining = (wallet.locked_until - timezone.now()).seconds // 60
    return Response(
        {"detail": f"Wallet locked. Try again in {remaining} minutes."},
        status=403
    )

if pin != wallet.pin:
    wallet.failed_pin_attempts += 1
    if wallet.failed_pin_attempts >= MAX_PIN_ATTEMPTS:
        wallet.locked_until = timezone.now() + LOCKOUT_DURATION
        wallet.failed_pin_attempts = 0
        # Send email alert to user
    wallet.save()
    return Response({"detail": "Invalid PIN."}, status=400)

# On success, reset counter
wallet.failed_pin_attempts = 0
wallet.save()
```

**Effort**: ~2 hours (model change, migration, view logic, frontend error handling)

---

### 2E. 🟡 Anomaly Flagging on Withdrawals

**Problem**: No fraud detection on wallet transactions. A compromised account could drain the wallet.

**Worth it?** **Good demo value for "AI/rule-based threat detection."** Simple rules are enough — no ML model needed.

**Implementation sketch**:
```python
def check_withdrawal_anomalies(wallet, amount, request):
    flags = []

    # Rule 1: Withdrawal > 3x user's average
    avg = Transaction.objects.filter(
        wallet=wallet, transaction_type='debit'
    ).aggregate(Avg('amount'))['amount__avg'] or 0
    if avg > 0 and amount > avg * 3:
        flags.append("Amount is 3x above your average withdrawal")

    # Rule 2: Multiple withdrawals in short period
    recent = Transaction.objects.filter(
        wallet=wallet, transaction_type='debit',
        created_at__gte=timezone.now() - timedelta(hours=1)
    ).count()
    if recent >= 3:
        flags.append("Multiple withdrawals in the last hour")

    # Rule 3: Withdrawal > 80% of balance
    if amount > wallet.user_balance * 0.8:
        flags.append("Withdrawing more than 80% of balance")

    return flags
```

If flags exist → require additional confirmation or email verification before processing.

**Effort**: ~3-4 hours

---

### 2F. 🟢 Audit Log (Who Accessed What, When)

**Problem**: No record of who viewed emergency profile data. Can't demonstrate "trust and transparency."

**Worth it?** **Yes — directly hits "Build Trust and Transparency."** Also useful for debugging and compliance.

**Implementation sketch**:
```python
class AuditLog(models.Model):
    ACTION_CHOICES = [
        ('profile_viewed', 'Emergency Profile Viewed'),
        ('profile_updated', 'Emergency Profile Updated'),
        ('qr_scanned', 'QR Code Scanned'),
        ('qr_activated', 'QR Code Activated'),
        ('wallet_accessed', 'Wallet Accessed'),
        ('withdrawal', 'Withdrawal Made'),
        ('deposit', 'Deposit Made'),
        ('food_scanned', 'Food Scanned'),
        ('tips_generated', 'Health Tips Generated'),
        ('emergency_alert', 'Emergency Alert Sent'),
        ('pin_failed', 'Failed PIN Attempt'),
    ]

    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, null=True)
    action = models.CharField(max_length=50, choices=ACTION_CHOICES)
    ip_address = models.GenericIPAddressField(null=True)
    user_agent = models.TextField(blank=True)
    metadata = models.JSONField(default=dict)  # extra context
    timestamp = models.DateTimeField(auto_now_add=True)
```

Add `AuditLog.objects.create(...)` calls in key views. Expose a `GET /audit-log/` endpoint so users can see their own access history.

**Effort**: ~3-4 hours

---

## 3. Unifying Feature: Tiered Visibility / Consent System

### 🟢🟢🟢 This Is the Centerpiece

**Problem**: Personalization and security are currently separate subsystems. The more detailed the emergency profile (→ better AI tips, better hospital matching), the more sensitive data exists (→ bigger breach risk). There's no user control over this tradeoff.

**Solution**: A **tiered visibility/consent system** where the user controls exactly what subset of their profile is visible in different contexts.

**Worth it?** **This is THE feature that ties everything together.** It's simultaneously "personalization" (controls what AI can use) and "data privacy/security" (controls what's exposed via QR). Judges will see it as the unifying idea rather than two checklist items.

**Implementation sketch**:

```python
class ProfileVisibilitySettings(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE)

    # Tier 1: QR Code (public — scanned by first responders)
    qr_show_blood_type = models.BooleanField(default=True)
    qr_show_allergies = models.BooleanField(default=True)
    qr_show_conditions = models.BooleanField(default=False)  # off by default
    qr_show_medications = models.BooleanField(default=False)
    qr_show_emergency_contact = models.BooleanField(default=True)
    qr_show_genotype = models.BooleanField(default=False)

    # Tier 2: AI Engine (internal — used for tips + risk scoring)
    ai_use_full_profile = models.BooleanField(default=True)
    ai_use_lifestyle_data = models.BooleanField(default=True)
    ai_use_scan_history = models.BooleanField(default=False)

    # Tier 3: Hospital sharing (if user is at a hospital)
    hospital_share_full_record = models.BooleanField(default=False)
```

**QR scan view changes**:
```python
def emergency_profile_view(request, token):
    qrcode = get_object_or_404(QRCode, qr_token=token)
    profile = qrcode.profile
    visibility = profile.user.profilevisibilitysettings

    # Only expose fields the user consented to
    context = {
        "blood_type": profile.blood_type if visibility.qr_show_blood_type else "Hidden",
        "allergies": profile.allergies if visibility.qr_show_allergies else "Hidden",
        "conditions": profile.conditions if visibility.qr_show_conditions else "Hidden",
        # ... etc
    }

    # Log the access
    AuditLog.objects.create(
        action='qr_scanned',
        ip_address=get_client_ip(request),
        metadata={'fields_exposed': [k for k, v in context.items() if v != "Hidden"]}
    )

    return render(request, 'emergency_profile.html', context)
```

**Frontend**: A settings screen with toggles:
```
🔒 Privacy Controls

QR Code Visibility (what first responders see):
  ✅ Blood Type
  ✅ Allergies
  ❌ Medical Conditions  ← toggle
  ❌ Current Medications  ← toggle
  ✅ Emergency Contact

AI Personalization (what the AI uses internally):
  ✅ Full medical profile
  ✅ Lifestyle data
  ❌ Food scan history  ← toggle
```

**Effort**: ~5-6 hours (model, migration, settings screen, modified QR view, modified AI prompt)

---

## 4. Pitch Framing

### The Opening Line

> *"The more personalized a health AI gets, the more dangerous a breach becomes — so we built the consent/visibility layer as the core feature, not an afterthought."*

### Demo Flow

1. **Open with the tiered visibility settings** — "I control exactly what a stranger scanning my QR code can see vs. what the AI uses internally to personalize my experience."
2. **Show the adaptive health tips** — "The AI learns what tips I engage with and evolves its recommendations over time — but only using data I've explicitly consented to share."
3. **Trigger a shake emergency** — "When I'm in danger, the system doesn't just find the nearest hospital — it finds the *right* hospital for my specific condition, and only shares the medical data I pre-approved."
4. **Show the audit log** — "I can see every single time someone scanned my QR code, what fields were exposed, and from what IP address."
5. **Show the wallet anomaly detection** — "If someone compromises my account, rule-based threat detection flags unusual withdrawals before damage is done."

### Key phrase for judges

> *"Personalization and security aren't opposing forces — they're the same system. The visibility layer is both the privacy control and the personalization filter."*

---

## Priority Order (Weekend Sprint)

| # | Task | Effort | Impact | Do It? |
|---|------|--------|--------|--------|
| 1 | Secrets → env vars | 1-2h | 🔒 Table stakes | 🟢 YES — first |
| 2 | Tiered visibility/consent system | 5-6h | 🎯 Centerpiece feature | 🟢 YES — second |
| 3 | Personalized hospital matching (condition-aware) | 3-4h | 🚑 "Save your life" demo moment | 🟢 YES |
| 4 | Adaptive health tips (personalization loop) | 4-6h | 🤖 True AI personalization | 🟢 YES |
| 5 | Personalized allergen risk scoring | 2-3h | 📊 Quick win | 🟢 YES |
| 6 | PIN lockout on wallet | 2h | 🔐 Basic security | 🟢 YES |
| 7 | Audit log | 3-4h | 📋 Trust & transparency | 🟢 YES |
| 8 | Field-level encryption | 2-3h | 🔒 Data at rest | 🟢 YES |
| 9 | Rate-limiting on QR endpoint | 1h | 🛡️ Defense-in-depth | 🟡 If time |
| 10 | Withdrawal anomaly flagging | 3-4h | 🚨 Threat detection demo | 🟡 If time |

**Total estimated effort**: ~27-35 hours for everything, ~18-22 hours for the top 8.

---

## Is It Worth It?

### Short answer: **Yes, overwhelmingly.**

The current project is a solid **functional prototype** with impressive breadth (6 features, 6 third-party integrations, shake-to-alert). But the two halves — personalization and security — exist in parallel rather than reinforcing each other.

The tiered visibility system (item #2) is the **single highest-ROI change** because it:
- Unifies the two themes into one coherent story
- Is visually demoable (toggle switches → immediate effect on QR output)
- Creates a pitch-worthy soundbite
- Is relatively straightforward to implement (~5-6 hours)

The adaptive health tips (item #4) and condition-aware hospital matching (item #3) are the next biggest wins because they transform "we used an API" into "we built a personalization engine."

The security items (env vars, encryption, PIN lockout, audit log) are non-negotiable hygiene — they don't win competitions on their own, but their absence loses them.

> [!TIP]
> **If you only have one day**: Do items 1, 2, 3, and 6. That gives you env vars (credibility), tiered visibility (centerpiece), condition-aware hospitals (wow factor), and PIN lockout (security hygiene) in ~12 hours.

> [!TIP]
> **If you have a full weekend**: Do all 8 green items. That gives you a complete, coherent submission where every feature reinforces the thesis.
