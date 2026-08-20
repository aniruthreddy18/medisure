/**
 * Seed data for development and for the client's first content review.
 *
 * ⚠️  EVERY VALUE HERE IS PLACEHOLDER CONTENT.
 * Doctor names, fees, package prices, achievements and testimonials are
 * invented so the site can be demonstrated end to end. All of it must be
 * replaced with the hospital's real data before launch — in particular:
 *   - package prices (client has not confirmed these yet)
 *   - doctor registration numbers and fees
 *   - testimonials, which may not be published without written consent
 *
 * The seed is idempotent: it upserts on stable slugs, so re-running it will
 * not duplicate rows.
 */
import "dotenv/config";
import bcrypt from "bcryptjs";
import { db } from "../src/db";
import { Gender, ServiceType, PackageBadge, CtaMode, AdminRole } from "../src/generated/prisma/enums";

const rupees = (r: number) => r * 100; // → paise

async function seedDepartments() {
  const departments = [
    {
      slug: "physiotherapy",
      name: "Physiotherapy & Rehabilitation",
      icon: "Activity",
      isCore: true,
      order: 1,
      shortDesc: "Restore movement after injury, surgery or stroke — at the hospital or in your home.",
      longDesc:
        "Our physiotherapy team treats pain and restricted movement with hands-on therapy, graded exercise and rehabilitation planning. We run a dedicated home physiotherapy service for patients who cannot travel, including post-surgical and neurological rehabilitation.",
    },
    {
      slug: "orthopaedics",
      name: "Orthopaedics",
      icon: "Bone",
      isCore: true,
      order: 2,
      shortDesc: "Joint replacement, fracture care, spine and sports injury treatment.",
      longDesc:
        "The orthopaedic department manages the full range of bone and joint conditions — from fractures and sports injuries to knee and hip replacement and degenerative spine disease, supported by on-site imaging and a physiotherapy team for recovery.",
    },
    {
      slug: "general-surgery",
      name: "General Surgery",
      icon: "Stethoscope",
      isCore: true,
      order: 3,
      shortDesc: "Laparoscopic and open surgery with structured pre- and post-operative care.",
      longDesc:
        "Our surgeons perform laparoscopic and open procedures including hernia repair, gallbladder surgery, appendicectomy and proctology, with a defined pre-operative assessment and post-operative follow-up pathway.",
    },
    {
      slug: "general-medicine",
      name: "General Medicine",
      icon: "HeartPulse",
      isCore: false,
      order: 4,
      shortDesc: "Everyday illness, diabetes, blood pressure and preventive health.",
    },
    {
      slug: "diagnostics",
      name: "Diagnostics & Imaging",
      icon: "ScanLine",
      isCore: false,
      order: 5,
      shortDesc: "X-ray, ultrasound and laboratory services on site.",
    },
  ];

  for (const d of departments) {
    await db.department.upsert({
      where: { slug: d.slug },
      update: d,
      create: d,
    });
  }
  return db.department.findMany();
}

async function seedConditions(deptIds: Record<string, string>) {
  const conditions = [
    { dept: "physiotherapy", name: "Post-Surgical Rehabilitation", slug: "post-surgical-rehabilitation", summary: "Structured recovery after joint replacement, ligament repair or spinal surgery." },
    { dept: "physiotherapy", name: "Stroke & Neurological Rehab", slug: "stroke-neurological-rehab", summary: "Regaining strength, balance and daily function after a stroke or nerve injury." },
    { dept: "physiotherapy", name: "Back & Neck Pain", slug: "back-and-neck-pain", summary: "Assessment and treatment for disc problems, sciatica and postural pain." },
    { dept: "physiotherapy", name: "Sports Injury Rehabilitation", slug: "sports-injury-rehabilitation", summary: "Return-to-play programmes for ligament, muscle and tendon injuries." },
    { dept: "physiotherapy", name: "Geriatric Mobility & Falls", slug: "geriatric-mobility", summary: "Balance, strength and confidence training for older adults." },
    { dept: "orthopaedics", name: "Knee Replacement", slug: "knee-replacement", summary: "Total and partial knee replacement for advanced arthritis." },
    { dept: "orthopaedics", name: "Hip Replacement", slug: "hip-replacement", summary: "Hip joint replacement for arthritis, fracture and avascular necrosis." },
    { dept: "orthopaedics", name: "Fracture & Trauma Care", slug: "fracture-and-trauma-care", summary: "Emergency and planned fixation of broken bones." },
    { dept: "orthopaedics", name: "Arthroscopy & Sports Injury", slug: "arthroscopy-sports-injury", summary: "Keyhole surgery for ACL, meniscus and shoulder injuries." },
    { dept: "orthopaedics", name: "Spine Care", slug: "spine-care", summary: "Treatment for disc prolapse, sciatica and spinal stenosis." },
    { dept: "general-surgery", name: "Laparoscopic Hernia Repair", slug: "laparoscopic-hernia-repair", summary: "Keyhole repair of inguinal, umbilical and incisional hernias." },
    { dept: "general-surgery", name: "Gallbladder Surgery", slug: "gallbladder-surgery", summary: "Laparoscopic removal of the gallbladder for stones and inflammation." },
    { dept: "general-surgery", name: "Appendix Surgery", slug: "appendix-surgery", summary: "Emergency and planned laparoscopic appendicectomy." },
    { dept: "general-surgery", name: "Proctology (Piles, Fissure, Fistula)", slug: "proctology", summary: "Day-care treatment for piles, anal fissure and fistula." },
  ];

  for (const [i, c] of conditions.entries()) {
    const { dept, ...rest } = c;
    await db.condition.upsert({
      where: { slug: c.slug },
      update: { ...rest, order: i, departmentId: deptIds[dept] },
      create: { ...rest, order: i, departmentId: deptIds[dept] },
    });
  }
}

async function seedDoctors(deptIds: Record<string, string>) {
  // 20 doctors — the hospital's stated headcount.
  const doctors = [
    // Physiotherapy (7) — 5 of whom take home visits
    { name: "Dr. Ananya Rao", gender: Gender.FEMALE, dept: ["physiotherapy"], designation: "Chief Physiotherapist", qualifications: "BPT, MPT (Neurology)", exp: 16, home: true, opFee: 500, homeFee: 899, langs: ["English", "Hindi", "Telugu"], featured: true },
    { name: "Dr. Vikram Shetty", gender: Gender.MALE, dept: ["physiotherapy"], designation: "Senior Physiotherapist — Sports", qualifications: "BPT, MPT (Sports Medicine)", exp: 12, home: true, opFee: 500, homeFee: 899, langs: ["English", "Hindi", "Kannada"], featured: true },
    { name: "Dr. Meera Krishnan", gender: Gender.FEMALE, dept: ["physiotherapy"], designation: "Consultant Physiotherapist", qualifications: "BPT, MPT (Orthopaedics)", exp: 9, home: true, opFee: 450, homeFee: 849, langs: ["English", "Tamil", "Telugu"] },
    { name: "Dr. Rahul Deshmukh", gender: Gender.MALE, dept: ["physiotherapy"], designation: "Consultant Physiotherapist — Neuro Rehab", qualifications: "BPT, MPT (Neurology)", exp: 11, home: true, opFee: 500, homeFee: 899, langs: ["English", "Hindi", "Marathi"] },
    { name: "Dr. Sneha Patil", gender: Gender.FEMALE, dept: ["physiotherapy"], designation: "Physiotherapist — Geriatric Care", qualifications: "BPT, MPT (Geriatrics)", exp: 7, home: true, opFee: 450, homeFee: 849, langs: ["English", "Hindi", "Marathi"] },
    { name: "Dr. Imran Qureshi", gender: Gender.MALE, dept: ["physiotherapy"], designation: "Physiotherapist — Cardio-Pulmonary", qualifications: "BPT, MPT (Cardiopulmonary)", exp: 8, home: false, opFee: 450, langs: ["English", "Hindi", "Urdu"] },
    { name: "Dr. Lakshmi Narayanan", gender: Gender.FEMALE, dept: ["physiotherapy"], designation: "Physiotherapist — Women's Health", qualifications: "BPT, MPT", exp: 6, home: false, opFee: 450, langs: ["English", "Tamil", "Telugu"] },

    // Orthopaedics (6)
    { name: "Dr. Suresh Reddy", gender: Gender.MALE, dept: ["orthopaedics"], designation: "Senior Consultant — Joint Replacement", qualifications: "MBBS, MS (Ortho), FRCS", exp: 24, home: false, opFee: 900, langs: ["English", "Hindi", "Telugu"], featured: true },
    { name: "Dr. Kavita Menon", gender: Gender.FEMALE, dept: ["orthopaedics"], designation: "Consultant Orthopaedic Surgeon — Spine", qualifications: "MBBS, MS (Ortho), Fellowship in Spine Surgery", exp: 15, home: false, opFee: 800, langs: ["English", "Hindi", "Malayalam"], featured: true },
    { name: "Dr. Arjun Malhotra", gender: Gender.MALE, dept: ["orthopaedics"], designation: "Consultant — Sports Injury & Arthroscopy", qualifications: "MBBS, MS (Ortho), DNB", exp: 13, home: false, opFee: 800, langs: ["English", "Hindi", "Punjabi"] },
    { name: "Dr. Pradeep Kumar", gender: Gender.MALE, dept: ["orthopaedics"], designation: "Consultant — Trauma & Fracture Care", qualifications: "MBBS, MS (Ortho)", exp: 18, home: false, opFee: 700, langs: ["English", "Hindi", "Telugu"] },
    { name: "Dr. Farida Hussain", gender: Gender.FEMALE, dept: ["orthopaedics"], designation: "Consultant Orthopaedic Surgeon", qualifications: "MBBS, DNB (Ortho)", exp: 10, home: false, opFee: 700, langs: ["English", "Hindi", "Urdu"] },
    { name: "Dr. Ganesh Iyer", gender: Gender.MALE, dept: ["orthopaedics", "physiotherapy"], designation: "Consultant — Paediatric Orthopaedics", qualifications: "MBBS, MS (Ortho), Fellowship in Paediatric Ortho", exp: 14, home: false, opFee: 800, langs: ["English", "Tamil", "Hindi"] },

    // General Surgery (4)
    { name: "Dr. Rajesh Varma", gender: Gender.MALE, dept: ["general-surgery"], designation: "Senior Consultant — Laparoscopic Surgery", qualifications: "MBBS, MS (General Surgery), FMAS", exp: 22, home: false, opFee: 900, langs: ["English", "Hindi", "Telugu"], featured: true },
    { name: "Dr. Nithya Balan", gender: Gender.FEMALE, dept: ["general-surgery"], designation: "Consultant General & Laparoscopic Surgeon", qualifications: "MBBS, MS (General Surgery)", exp: 12, home: false, opFee: 800, langs: ["English", "Tamil", "Telugu"] },
    { name: "Dr. Sameer Joshi", gender: Gender.MALE, dept: ["general-surgery"], designation: "Consultant — Proctology & Day-Care Surgery", qualifications: "MBBS, MS, DNB", exp: 11, home: false, opFee: 750, langs: ["English", "Hindi", "Marathi"] },
    { name: "Dr. Anil Chatterjee", gender: Gender.MALE, dept: ["general-surgery"], designation: "Consultant General Surgeon", qualifications: "MBBS, MS (General Surgery)", exp: 16, home: false, opFee: 750, langs: ["English", "Hindi", "Bengali"] },

    // General Medicine (3)
    { name: "Dr. Priya Sundaram", gender: Gender.FEMALE, dept: ["general-medicine"], designation: "Consultant Physician", qualifications: "MBBS, MD (General Medicine)", exp: 14, home: false, opFee: 600, langs: ["English", "Tamil", "Telugu"] },
    { name: "Dr. Mohan Bhat", gender: Gender.MALE, dept: ["general-medicine"], designation: "Consultant Physician — Diabetes Care", qualifications: "MBBS, MD, Fellowship in Diabetology", exp: 19, home: false, opFee: 600, langs: ["English", "Hindi", "Kannada"] },
    { name: "Dr. Zoya Ahmed", gender: Gender.FEMALE, dept: ["general-medicine"], designation: "Consultant Physician", qualifications: "MBBS, MD (General Medicine)", exp: 8, home: false, opFee: 550, langs: ["English", "Hindi", "Urdu"] },
  ];

  const slugify = (n: string) =>
    n.toLowerCase().replace(/^dr\.?\s+/, "dr-").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const created: { id: string; home: boolean; dept: string[] }[] = [];

  for (const [i, doc] of doctors.entries()) {
    const slug = slugify(doc.name);
    const data = {
      name: doc.name,
      slug,
      designation: doc.designation,
      qualifications: doc.qualifications,
      experienceYears: doc.exp,
      gender: doc.gender,
      languages: doc.langs,
      // TODO(client): real medical council registration numbers
      regNumber: `TSMC/${20000 + i}`,
      opFeePaise: rupees(doc.opFee),
      homeVisitFeePaise: doc.homeFee ? rupees(doc.homeFee) : null,
      offersHomePhysio: doc.home,
      featured: doc.featured ?? false,
      order: i,
      bio: `${doc.name} is a ${doc.designation.toLowerCase()} with ${doc.exp} years of experience. Placeholder biography — to be replaced with the doctor's own text.`,
    };

    const d = await db.doctor.upsert({ where: { slug }, update: data, create: data });

    await db.doctorDepartment.deleteMany({ where: { doctorId: d.id } });
    await db.doctorDepartment.createMany({
      data: doc.dept.map((s) => ({ doctorId: d.id, departmentId: deptIds[s] })),
    });

    created.push({ id: d.id, home: doc.home, dept: doc.dept });
  }

  return created;
}

async function seedSchedules(doctors: { id: string; home: boolean }[]) {
  for (const doc of doctors) {
    await db.doctorSchedule.deleteMany({ where: { doctorId: doc.id } });

    // OP clinics: Mon–Sat morning + evening. Sunday closed.
    for (let day = 1; day <= 6; day++) {
      await db.doctorSchedule.create({
        data: {
          doctorId: doc.id,
          serviceType: ServiceType.OP,
          dayOfWeek: day,
          startTime: "09:00",
          endTime: "13:00",
          slotMinutes: 15,
          location: "Main OPD Block",
        },
      });
      await db.doctorSchedule.create({
        data: {
          doctorId: doc.id,
          serviceType: ServiceType.OP,
          dayOfWeek: day,
          startTime: "17:00",
          endTime: "20:00",
          slotMinutes: 15,
          location: "Main OPD Block",
        },
      });
    }

    // Home physio: 7 days, hour-long visits with 30 minutes of travel between.
    if (doc.home) {
      for (let day = 0; day <= 6; day++) {
        await db.doctorSchedule.create({
          data: {
            doctorId: doc.id,
            serviceType: ServiceType.HOME_PHYSIO,
            dayOfWeek: day,
            startTime: "07:00",
            endTime: "19:00",
            slotMinutes: 60,
            travelBufferMinutes: 30,
          },
        });
      }
    }
  }
}

async function seedPackages() {
  // ⚠️ PLACEHOLDER PRICING — the client has not confirmed home-physio rates.
  // Structure follows the market pattern (session packs + condition programmes).
  const packages = [
    { slug: "home-physio-single-visit", name: "Single Home Visit", sessionCount: 1, price: 899, validityDays: 15, badge: null, conditionTag: null, description: "One 60-minute physiotherapy session at home, including assessment and a home exercise plan. Best if you want to try the service before committing to a package.", includes: ["60-minute session at home", "Initial assessment", "Home exercise plan"], order: 1 },
    { slug: "home-physio-7-session-pack", name: "Home Physiotherapy — 7 Session Pack", sessionCount: 7, price: 4900, validityDays: 30, badge: PackageBadge.BEST_SELLER, conditionTag: null, description: "Seven home sessions with the same physiotherapist, scheduled at your convenience. Suited to recovery from a recent injury or minor surgery.", includes: ["7 × 60-minute sessions", "Same physiotherapist throughout", "Progress review after session 4", "Valid 30 days"], order: 2 },
    { slug: "home-physio-14-session-pack", name: "Home Physiotherapy — 14 Session Pack", sessionCount: 14, price: 9100, validityDays: 45, badge: PackageBadge.MOST_TRUSTED, conditionTag: null, description: "Fourteen sessions for conditions needing sustained rehabilitation, such as post-operative knee or hip recovery.", includes: ["14 × 60-minute sessions", "Same physiotherapist throughout", "Fortnightly progress review", "Valid 45 days"], order: 3 },
    { slug: "home-physio-30-session-pack", name: "Home Physiotherapy — 30 Session Pack", sessionCount: 30, price: 18000, validityDays: 90, badge: null, conditionTag: null, description: "Long-course rehabilitation for neurological recovery and complex mobility goals.", includes: ["30 × 60-minute sessions", "Dedicated physiotherapist", "Monthly progress report", "Valid 90 days"], order: 4 },
    { slug: "post-surgery-rehab-programme", name: "Post-Surgery Rehab Programme", sessionCount: 10, price: 7500, validityDays: 45, badge: PackageBadge.BEST_SELLER, conditionTag: "post-surgery", description: "A structured ten-session programme following joint replacement, ligament repair or spinal surgery, coordinated with your surgeon's protocol.", includes: ["10 × 60-minute sessions", "Surgeon-aligned protocol", "Gait and mobility training", "Home safety review"], order: 5 },
    { slug: "stroke-neuro-rehab-programme", name: "Stroke & Neuro Rehab Programme", sessionCount: 12, price: 9600, validityDays: 60, badge: null, conditionTag: "stroke", description: "Neurological rehabilitation at home for stroke, Parkinson's and nerve injury — focused on balance, strength and daily independence.", includes: ["12 × 60-minute sessions", "Neuro-physiotherapist", "Caregiver training", "Functional independence review"], ctaMode: CtaMode.ENQUIRE, order: 6 },
    { slug: "sports-injury-programme", name: "Sports Injury Programme", sessionCount: 8, price: 6800, validityDays: 30, badge: null, conditionTag: "sports", description: "Return-to-play rehabilitation for ligament, muscle and tendon injuries, with sport-specific conditioning.", includes: ["8 × 60-minute sessions", "Sports physiotherapist", "Return-to-play testing", "Injury prevention plan"], order: 7 },
    { slug: "back-and-disc-care-programme", name: "Back & Disc Care Programme", sessionCount: 10, price: 7000, validityDays: 45, badge: null, conditionTag: "disc", description: "Targeted treatment for disc prolapse, sciatica and chronic back pain, combining manual therapy with a graded exercise plan.", includes: ["10 × 60-minute sessions", "Manual therapy", "Posture and ergonomics review", "Long-term exercise plan"], order: 8 },
    { slug: "geriatric-mobility-programme", name: "Geriatric Mobility Programme", sessionCount: 12, price: 8400, validityDays: 60, badge: null, conditionTag: "geriatric", description: "Balance, strength and falls-prevention work for older adults, delivered at home where the risks actually are.", includes: ["12 × 60-minute sessions", "Falls-risk assessment", "Home hazard review", "Caregiver guidance"], ctaMode: CtaMode.ENQUIRE, order: 9 },
  ];

  for (const p of packages) {
    const data = {
      name: p.name,
      slug: p.slug,
      serviceType: ServiceType.HOME_PHYSIO,
      sessionCount: p.sessionCount,
      pricePaise: rupees(p.price),
      validityDays: p.validityDays,
      badge: p.badge ?? null,
      ctaMode: p.ctaMode ?? CtaMode.BUY,
      conditionTag: p.conditionTag ?? null,
      description: p.description,
      includes: p.includes,
      order: p.order,
    };
    await db.servicePackage.upsert({ where: { slug: p.slug }, update: data, create: data });
  }
}

async function seedContent(deptIds: Record<string, string>) {
  // --- Achievements (hero slider + What's New) ---
  const achievements = [
    { title: "5,000th Joint Replacement Completed", caption: "A milestone for our orthopaedic team, achieved with a same-week discharge protocol.", year: 2025, showInHero: true, isNews: true },
    { title: "Home Physiotherapy Crosses 25,000 Visits", caption: "Our physiotherapists have now delivered more than 25,000 sessions in patients' homes.", year: 2025, showInHero: true, isNews: true },
    { title: "NABH Accreditation Renewed", caption: "Recognised again for patient safety and quality of care standards.", year: 2024, showInHero: true, isNews: false },
    { title: "Advanced Arthroscopy Suite Inaugurated", caption: "A dedicated theatre for keyhole joint surgery and sports injury repair.", year: 2024, showInHero: true, isNews: true },
    { title: "Free Rural Orthopaedic Camp — 1,200 Patients Screened", caption: "Our surgeons and physiotherapists screened 1,200 patients across four villages.", year: 2023, showInHero: false, isNews: true },
  ];
  for (const [i, a] of achievements.entries()) {
    const existing = await db.achievement.findFirst({ where: { title: a.title } });
    // TODO(client): replace with real photographs — placeholder path for now.
    // Photos come from the client; until then the slider renders a branded
    // placeholder panel rather than a fake stock image.
    const data = { ...a, image: null, order: i };
    if (existing) await db.achievement.update({ where: { id: existing.id }, data });
    else await db.achievement.create({ data });
  }

  // --- Testimonials ---
  // NOTE: consentOnFile is deliberately TRUE for seed rows only so the section
  // renders in development. Real testimonials must not be approved until the
  // signed consent form is actually on file.
  const testimonials = [
    { patientName: "Ramesh Gupta", dept: "orthopaedics", condition: "Osteoarthritis, both knees", treatment: "Bilateral total knee replacement", outcome: "Walking unaided within six weeks", quote: "I had stopped climbing stairs for two years. Both knees were replaced ten days apart, and the physiotherapy team started me walking the next morning. Six weeks later I climbed to my terrace without help.", rating: 5 },
    { patientName: "Sulochana Devi", dept: "physiotherapy", condition: "Stroke with left-side weakness", treatment: "Home neurological rehabilitation, 30 sessions", outcome: "Regained independent standing and self-feeding", quote: "My mother could not sit up on her own after the stroke. The physiotherapist came home three times a week and worked with us patiently. She now stands with a walker and eats by herself.", rating: 5 },
    { patientName: "Arun Prakash", dept: "general-surgery", condition: "Inguinal hernia", treatment: "Laparoscopic hernia repair", outcome: "Discharged same day, back at work in a week", quote: "I was worried about a long recovery. The surgery was done through three small cuts, I went home the same evening, and I was back at my desk the following week.", rating: 5 },
    { patientName: "Deepa Nair", dept: "physiotherapy", condition: "Lumbar disc prolapse", treatment: "Back & Disc Care Programme, 10 sessions", outcome: "Pain-free desk work after eight weeks", quote: "I had been living on painkillers for months. The physiotherapist explained what was actually happening in my back and gave me exercises I could keep doing. I have not needed a tablet in two months.", rating: 5 },
    { patientName: "Mohammed Faiz", dept: "orthopaedics", condition: "ACL tear playing cricket", treatment: "Arthroscopic ACL reconstruction and sports rehab", outcome: "Returned to competitive cricket in seven months", quote: "The surgeon and the sports physiotherapist worked as one team. They tested me properly before letting me play again, which gave me the confidence to trust the knee.", rating: 5 },
  ];
  for (const [i, t] of testimonials.entries()) {
    const { dept, ...rest } = t;
    const existing = await db.testimonial.findFirst({ where: { patientName: t.patientName, quote: t.quote } });
    const data = { ...rest, departmentId: deptIds[dept], consentOnFile: true, approved: true, order: i };
    if (existing) await db.testimonial.update({ where: { id: existing.id }, data });
    else await db.testimonial.create({ data });
  }

  // --- Videos (YouTube ids are placeholders) ---
  const videos = [
    { title: "A Walk Through Our Hospital", description: "A two-minute tour of the OPD, theatres and physiotherapy gym.", youtubeId: "dQw4w9WgXcQ", category: "hospital", order: 0 },
    { title: "What Happens After Knee Replacement?", description: "Our orthopaedic surgeon explains the first six weeks of recovery.", youtubeId: "dQw4w9WgXcQ", category: "education", order: 1 },
    { title: "Home Physiotherapy: How a Visit Works", description: "What to expect when our physiotherapist visits your home.", youtubeId: "dQw4w9WgXcQ", category: "home-physio", order: 2 },
    { title: "Exercises for Everyday Back Pain", description: "Four simple movements you can do safely at home.", youtubeId: "dQw4w9WgXcQ", category: "education", order: 3 },
  ];
  for (const v of videos) {
    const existing = await db.video.findFirst({ where: { title: v.title } });
    if (existing) await db.video.update({ where: { id: existing.id }, data: v });
    else await db.video.create({ data: v });
  }

  // --- FAQs ---
  const faqs = [
    { question: "How do I book an appointment?", answer: "You can book online from this website — choose a doctor, pick a time slot, verify your mobile number and pay. You can also call our booking line during OPD hours.", category: "booking", order: 0 },
    { question: "What is the difference between an OP appointment and home physiotherapy?", answer: "An OP appointment is a consultation at the hospital. Home physiotherapy is a session delivered by our physiotherapist at your home, booked either as a single visit or as a session package.", category: "booking", order: 1 },
    { question: "Can I reschedule or cancel a booking?", answer: "Yes. Use the link in your confirmation message, or the Manage Booking page with your booking reference. Please see our refund and cancellation policy for applicable timelines.", category: "booking", order: 2 },
    { question: "Do you accept insurance?", answer: "We are empanelled with several insurers and TPAs. Please check our Insurance page and carry your policy details and a photo ID to the hospital.", category: "payment", order: 3 },
    { question: "How long does a home physiotherapy session last?", answer: "A standard session is 60 minutes, including assessment and the exercises you will continue between visits.", category: "home-physio", order: 4 },
    { question: "Which areas do you cover for home visits?", answer: "We cover most of the city. Enter your pincode when booking and we will confirm availability in your area.", category: "home-physio", order: 5 },
  ];
  for (const f of faqs) {
    const existing = await db.faq.findFirst({ where: { question: f.question } });
    if (existing) await db.faq.update({ where: { id: existing.id }, data: f });
    else await db.faq.create({ data: f });
  }

  // --- Insurers (placeholder list) ---
  const insurers = [
    { name: "Star Health Insurance", isTPA: false }, { name: "HDFC ERGO", isTPA: false },
    { name: "ICICI Lombard", isTPA: false }, { name: "New India Assurance", isTPA: false },
    { name: "Bajaj Allianz", isTPA: false }, { name: "Aditya Birla Health", isTPA: false },
    { name: "Medi Assist", isTPA: true }, { name: "Paramount TPA", isTPA: true },
  ];
  for (const [i, ins] of insurers.entries()) {
    const existing = await db.insurer.findFirst({ where: { name: ins.name } });
    const data = { ...ins, order: i };
    if (existing) await db.insurer.update({ where: { id: existing.id }, data });
    else await db.insurer.create({ data });
  }
}

async function seedAdminAndSettings() {
  // Development credentials only. The real admin account must be created with
  // a strong password before launch, and this seed user removed.
  const email = "admin@medisure.local";
  const passwordHash = await bcrypt.hash("ChangeMe!2026", 12);
  await db.adminUser.upsert({
    where: { email },
    update: {},
    create: { email, passwordHash, name: "Hospital Admin", role: AdminRole.ADMIN },
  });

  const settings: Record<string, unknown> = {
    min_lead_time_minutes: 120,
    booking_window_days: 30,
    hold_minutes: 10,
    // Off until the client supplies the serviceable pincode list.
    home_physio_pincode_check: false,
    stats: { years: 18, patientsTreated: 240000, doctors: 20, surgeries: 15000 },
  };
  for (const [key, value] of Object.entries(settings)) {
    await db.siteSetting.upsert({
      where: { key },
      update: { value: value as object },
      create: { key, value: value as object },
    });
  }
}

async function main() {
  console.log("Seeding…");
  const departments = await seedDepartments();
  const deptIds = Object.fromEntries(departments.map((d) => [d.slug, d.id]));

  await seedConditions(deptIds);
  const doctors = await seedDoctors(deptIds);
  await seedSchedules(doctors);
  await seedPackages();
  await seedContent(deptIds);
  await seedAdminAndSettings();

  const counts = {
    departments: await db.department.count(),
    conditions: await db.condition.count(),
    doctors: await db.doctor.count(),
    schedules: await db.doctorSchedule.count(),
    packages: await db.servicePackage.count(),
    achievements: await db.achievement.count(),
    testimonials: await db.testimonial.count(),
    videos: await db.video.count(),
    faqs: await db.faq.count(),
    insurers: await db.insurer.count(),
  };
  console.table(counts);
  console.log("Seed complete. Admin: admin@medisure.local / ChangeMe!2026");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
