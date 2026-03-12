# Talk with the CEO
### Product Spec & Creative Direction

---

## 1. What is this?

A miniapp accessible directly from the El Dorado app — a dedicated space where users can send a message, question, or suggestion directly to the CEO. The goal is not just to collect feedback, but to create a genuine moment of connection between the user and the person leading the company.

---

## 2. The Feeling We're After

This should not feel like a feedback form. It should feel like walking into the CEO's office and leaving a note on his desk — personal, direct, and meaningful.

The user should feel:
- **Heard** — like their message actually matters
- **Welcomed** — like the CEO genuinely wants to hear from them
- **Comfortable** — free to say whatever they want, without filters

---

## 3. Page Structure

### 3.1 Hero — The CEO's Presence
The first thing the user sees should be the CEO — not a logo, not a banner.

Options (to be defined with Guille):
- A **short personal video** (15–30s) where the CEO speaks directly to the user — casual, no production needed, phone recording works
- A **full-width photo** of the CEO with a personal, handwritten-style signature below
- A **quote from the CEO** in large typography — something authentic that reflects his vision

> The goal: make the user feel like a real person is waiting for their message.

---

### 3.2 The Message Space
Right below the hero, a clean and simple input area. No long forms. No overwhelming fields.

Suggested structure:
- **One main text area** — open, no character limit shown upfront
- **Optional: category selector** — presented not as a dropdown, but as soft pill buttons the user taps before writing:
  - 💡 I have a suggestion
  - ❤️ I want to share something positive
  - 😤 Something frustrated me
  - 💬 I just want to talk

- **Optional: first name field** — to make the CEO's potential reply feel personal

---

### 3.3 Creative Interaction Ideas

This is where we can make the experience stand out. Some directions to explore:

**Option A — The "Letter" Format**
Style the input as a physical letter — with a subtle paper texture, a "Dear Guille," pre-filled at the top, and a send button that looks like sealing an envelope. Makes the act of writing feel intentional and special.

**Option B — The Voice Note**
Allow users to record a short audio message instead of typing. Lowers the barrier for users who are more comfortable speaking than writing. Feels more human and raw.

**Option C — The Mood Selector**
Before typing, the user picks a "mood" through an expressive visual (emoji, illustration, or color palette). Sets the emotional tone of the message and gives the CEO context before reading.

**Option D — The Anonymous Mode**
Give users the option to send anonymously with a toggle. "Send with my name" vs "Send anonymously." Increases honesty and reduces hesitation — especially for criticism or sensitive feedback.

---

### 3.4 Post-Send Experience
The moment after sending is as important as the message itself.

Ideas:
- A **personal confirmation message** — not "Your message has been submitted." But something like: *"Guille will read this. Thank you for taking the time."*
- A subtle animation — something warm, not corporate
- An **optional email field** to receive a reply — framed as: *"Leave your email if you'd like Guille to write back."*

---

## 4. Tone & Copy Direction

| ❌ Avoid | ✅ Aim for |
|---|---|
| "Submit your feedback" | "Send your message" |
| "Thank you for your submission" | "Guille will read this." |
| "Select a category" | "What's on your mind?" |
| Corporate, cold language | Warm, direct, human |
| Long instructions | Let the UI speak |

---

## 5. Technical Considerations

- Built as an **external website** (miniapp) hosted on Railway
- Receives the **hashed user ID** from the El Dorado app for identity mapping
- Stores messages securely — no sensitive financial data involved
- Mobile-first design — most users will access from the app
- Stack TBD (pending alignment with tech team)
- Will go through **compliance review** and **code review by Juan** before launch

---

## 7. Next Steps

1. Share the alignment questionnaire with Guille and collect his answers
2. Define the creative direction (video vs photo, interaction format)
3. Align with tech team on stack, auth flow, and compliance requirements
4. Design mockup / prototype
5. Build & deploy on Railway
6. Submit for compliance and code review
7. Launch 🚀
