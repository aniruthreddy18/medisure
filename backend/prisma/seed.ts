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
  // The six the hospital wants highlighted on the homepage grid are flagged
  // isCore, in the exact order requested. `order` is what queries actually
  // sort by; the array is kept in the same order for readability.
  const departments = [
    {
      slug: "general-medicine",
      name: "General Medicine",
      icon: "HeartPulse",
      isCore: true,
      order: 1,
      shortDesc: "Everyday illness, diabetes, blood pressure and preventive health.",
    },
    {
      slug: "general-surgery",
      name: "General & Laparoscopic Surgery",
      icon: "Stethoscope",
      isCore: true,
      order: 2,
      shortDesc: "Laparoscopic and open surgery with structured pre- and post-operative care.",
      longDesc:
        "Our surgeons perform laparoscopic and open procedures including hernia repair, gallbladder surgery, appendicectomy and proctology, with a defined assessment and follow-up pathway.",
    },
    {
      slug: "orthopaedics",
      name: "Orthopaedics",
      icon: "Bone",
      isCore: true,
      order: 3,
      shortDesc: "Joint replacement, spine care, fracture and sports injury treatment.",
      longDesc:
        "The orthopaedic department manages the full range of bone and joint conditions — fractures, sports injuries, spine disorders, and knee and hip replacement — supported by on-site imaging and physiotherapy.",
    },
    {
      slug: "physiotherapy",
      name: "Physiotherapy & Rehabilitation",
      icon: "Activity",
      isCore: true,
      order: 4,
      shortDesc: "Restore movement after injury, surgery or stroke — at the hospital or in your home.",
      longDesc:
        "Our physiotherapy team treats pain and restricted movement with hands-on therapy, graded exercise and rehabilitation planning, including a dedicated home physiotherapy service for patients who cannot travel.",
    },
    {
      slug: "gynaecology-obstetrics",
      name: "Gynaecology & Obstetrics",
      // Was "HeartPulse" — duplicated General Medicine's icon on the homepage
      // grid once both were core at the same time.
      icon: "Venus",
      isCore: true,
      order: 5,
      shortDesc: "Women's health, pregnancy care and laparoscopic gynaecological surgery.",
    },
    {
      slug: "paediatrics",
      name: "Paediatrics",
      icon: "Baby",
      isCore: true,
      order: 6,
      shortDesc: "Newborn, child and adolescent health, vaccination and growth care.",
    },
    { slug: "gastroenterology", name: "Gastroenterology", icon: "Stethoscope", isCore: false, order: 7, shortDesc: "Digestive, liver and endoscopic care." },
    { slug: "ent", name: "ENT", icon: "Ear", isCore: false, order: 8, shortDesc: "Ear, nose and throat treatment and surgery." },
    { slug: "pulmonology", name: "Pulmonology", icon: "Wind", isCore: false, order: 9, shortDesc: "Asthma, COPD, sleep and respiratory care." },
    { slug: "cardiology", name: "Cardiology", icon: "HeartPulse", isCore: false, order: 10, shortDesc: "Heart health, diagnostics and interventional care." },
    { slug: "urology", name: "Urology", icon: "Stethoscope", isCore: false, order: 11, shortDesc: "Kidney stones, prostate and urinary tract treatment." },
    { slug: "oncology", name: "Surgical Oncology", icon: "Stethoscope", isCore: false, order: 12, shortDesc: "Cancer surgery and multidisciplinary treatment planning." },
    { slug: "neurology", name: "Neurology & Neurosurgery", icon: "Brain", isCore: false, order: 13, shortDesc: "Brain, spine and nerve conditions." },
    { slug: "plastic-surgery", name: "Plastic & Reconstructive Surgery", icon: "Stethoscope", isCore: false, order: 14, shortDesc: "Reconstructive and cosmetic procedures." },
    { slug: "dental", name: "Dental & Maxillofacial Surgery", icon: "Stethoscope", isCore: false, order: 15, shortDesc: "Oral surgery, extractions and maxillofacial care." },
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
  /**
   * The hospital's real consulting panel, taken from the client's
   * "DOCTOR LIST" spreadsheet. Fees are the consultation charges from that
   * sheet, in rupees.
   *
   * Two fields are deliberately left blank rather than invented:
   *   - `gender` — not in the source, and guessing it from a name risks
   *     misgendering a real person
   *   - `experienceYears` — not in the source; publishing an invented figure
   *     for a named physician would be fabricating a credential
   * Both should be filled in once the hospital confirms them.
   */
  const doctors: {
    name: string;
    dept: string[];
    designation: string;
    qualifications: string;
    fee: number;
    home?: boolean;
    featured?: boolean;
  }[] = [
    { name: "Dr. M. Dhanunjaya", dept: ["physiotherapy"], designation: "Senior Physiotherapist", qualifications: "BPT, M.P.T (Ortho), M.I.A.P", fee: 600, home: true, featured: true },
    { name: "Dr. P. V. Satyanarayana Murthy", dept: ["orthopaedics"], designation: "Orthopaedic & Spine Surgeon", qualifications: "MBBS, DNB (Ortho), Fellowship in Spine", fee: 650, featured: true },
    { name: "Dr. A. S. N. Murthy", dept: ["paediatrics"], designation: "Paediatrician", qualifications: "MBBS, DCH (Paediatrics)", fee: 600 },
    { name: "Dr. S. Vishnu Prasad Reddy", dept: ["general-surgery"], designation: "General & Laparoscopic Surgeon", qualifications: "MBBS, DNB (GS), FIAGES, FMAS", fee: 800, featured: true },
    { name: "Dr. M. Mounika", dept: ["gynaecology-obstetrics"], designation: "Gynaecologist & Obstetrician", qualifications: "MBBS, MS (Gyn & Obs), FMAS, DMAS", fee: 600 },
    { name: "Dr. Vamsidhar Reddy V", dept: ["gastroenterology"], designation: "Gastroenterologist", qualifications: "MBBS, MD (GM), GM (Gastro)", fee: 800 },
    { name: "Dr. Badam Vamshi Kiran", dept: ["orthopaedics"], designation: "Sports Surgeon", qualifications: "MBBS, MS (Orthopaedics)", fee: 800 },
    { name: "Dr. M. Manisha", dept: ["ent"], designation: "ENT Surgeon", qualifications: "MBBS, MS (ENT)", fee: 800 },
    { name: "Dr. S. Swaroop Chandra", dept: ["orthopaedics"], designation: "Orthopaedic Surgeon", qualifications: "MBBS, MS (Ortho), DNB (Ortho), MNAMS (Ortho)", fee: 800 },
    { name: "Dr. N. Shashikanth Reddy", dept: ["pulmonology"], designation: "Pulmonologist", qualifications: "MBBS, MS (Pulmonology)", fee: 800 },
    { name: "Dr. G. Ravikanth", dept: ["general-medicine"], designation: "General Physician", qualifications: "MBBS, MD (General Medicine)", fee: 600 },
    { name: "Dr. P. Suma Reddy", dept: ["general-medicine"], designation: "Duty Medical Officer", qualifications: "MBBS, DMO", fee: 500 },
    { name: "Dr. CH. Tejeswi Das", dept: ["plastic-surgery"], designation: "Associate Consultant — Plastic Surgeon", qualifications: "MBBS, DNB, MCh", fee: 800 },
    { name: "Dr. S. V. L. Narsimha Reddy", dept: ["orthopaedics"], designation: "Orthopaedic Trauma & Joint Replacement Surgeon", qualifications: "MBBS, DNB (Ortho), FIJR", fee: 800 },
    { name: "Dr. B. Susruth Kumar", dept: ["cardiology"], designation: "Cardiologist", qualifications: "MBBS, MD (General Medicine), DM (Cardiology)", fee: 800 },
    { name: "Dr. K. Harsha Teja", dept: ["gastroenterology"], designation: "Medical Gastroenterologist", qualifications: "MBBS, MD (General Medicine), DNB (Medical Gastroenterology)", fee: 800 },
    { name: "Dr. T. Yeseswi", dept: ["orthopaedics"], designation: "Orthopaedic Surgeon", qualifications: "MBBS, MS (Orthopaedics)", fee: 800 },
    { name: "Dr. Divya", dept: ["ent"], designation: "ENT Surgeon", qualifications: "MBBS, MS (ENT)", fee: 800 },
    { name: "Dr. D. Nagendra", dept: ["pulmonology"], designation: "Pulmonologist", qualifications: "MBBS, DNB, DTCD", fee: 800 },
    { name: "Dr. K. Mounika", dept: ["general-surgery"], designation: "General & Laparoscopic Surgeon", qualifications: "MBBS, DNB (GS), FMAS", fee: 800 },
    { name: "Dr. S. Srinivas", dept: ["paediatrics"], designation: "Paediatrician", qualifications: "MBBS, MD (Paediatrics)", fee: 600 },
    { name: "Dr. D. Sandeep", dept: ["urology"], designation: "Urologist", qualifications: "MBBS, MS (AIIMS), MCh (Urology)", fee: 800 },
    { name: "Dr. Sandeep Vajja", dept: ["oncology"], designation: "Surgical Oncologist", qualifications: "MBBS, MS, DrNB (Surgical Onco), FMAS, FALS Oncology", fee: 1000 },
    { name: "Dr. P. Amarnadh Reddy", dept: ["dental"], designation: "Dental Surgeon", qualifications: "MDS (Oral & Maxillofacial Surgery)", fee: 600 },
    { name: "Dr. Chandrakanth", dept: ["neurology"], designation: "Neurosurgeon", qualifications: "MBBS, MS, MCh (Neurology)", fee: 800 },
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
      experienceYears: null,
      gender: null,
      languages: ["English", "Telugu", "Hindi"], // TODO(client): confirm per doctor
      regNumber: null, // TODO(client): medical council registration numbers
      opFeePaise: rupees(doc.fee),
      homeVisitFeePaise: doc.home ? rupees(899) : null,
      offersHomePhysio: doc.home ?? false,
      featured: doc.featured ?? false,
      order: i,
      bio: null,
    };

    const d = await db.doctor.upsert({ where: { slug }, update: data, create: data });

    await db.doctorDepartment.deleteMany({ where: { doctorId: d.id } });
    await db.doctorDepartment.createMany({
      data: doc.dept.map((sl) => ({ doctorId: d.id, departmentId: deptIds[sl] })),
    });

    created.push({ id: d.id, home: doc.home ?? false, dept: doc.dept });
  }

  // Remove any placeholder doctors from the earlier demo seed.
  const realSlugs = doctors.map((d) => slugify(d.name));
  await db.doctor.deleteMany({
    where: { slug: { notIn: realSlugs }, appointments: { none: {} }, packages: { none: {} } },
  });

  return created;
}

async function seedSchedules(doctors: { id: string; home: boolean }[]) {
  /**
   * Sample working hours, to be replaced with each doctor's real timings.
   *
   * OPD is a token queue: every hour of a doctor's working day is one bookable
   * window holding 10 patients, who are seen in turn. Morning 09:00–13:00 and
   * evening 17:00–20:00, Monday to Saturday, gives 7 windows a day and 70
   * bookable places per doctor.
   */
  const OPD_HOURS = [
    { startTime: "09:00", endTime: "13:00" }, // 4 windows
    { startTime: "17:00", endTime: "20:00" }, // 3 windows
  ];
  const OPD_CAPACITY = 10;

  for (const doc of doctors) {
    await db.doctorSchedule.deleteMany({ where: { doctorId: doc.id } });

    // Mon–Sat. Sunday closed for OPD.
    for (let day = 1; day <= 6; day++) {
      for (const block of OPD_HOURS) {
        await db.doctorSchedule.create({
          data: {
            doctorId: doc.id,
            serviceType: ServiceType.OP,
            dayOfWeek: day,
            startTime: block.startTime,
            endTime: block.endTime,
            slotMinutes: 60,
            capacityPerHour: OPD_CAPACITY,
            location: "Main OPD Block",
          },
        });
      }
    }

    // Home physiotherapy: 7 days, hour-long visits with 30 minutes of travel
    // between them, and only one patient per visit.
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
            capacityPerHour: 1,
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
  // The `email` column holds a plain username — it predates the switch to
  // usernames and renaming it would mean a migration for no functional gain.
  //
  // This password is a STARTING point only: staff change it from
  // /admin/password on first sign-in. `update: {}` means re-seeding never
  // resets a password that has already been changed.
  const email = "medisure";
  const passwordHash = await bcrypt.hash("ChangeMe!2026", 12);
  await db.adminUser.upsert({
    where: { email },
    update: {},
    create: { email, passwordHash, name: "MediSure Admin", role: AdminRole.ADMIN },
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
