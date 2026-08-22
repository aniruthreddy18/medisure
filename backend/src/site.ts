/**
 * Central hospital config.
 *
 * PLACEHOLDER VALUES — every field marked TODO must be replaced with the
 * client's real details before launch. Phone numbers and addresses appear
 * in JSON-LD and on the contact page, so wrong values here hurt local SEO.
 *
 * Anything the front desk may want to change after launch (hours, phones)
 * moves to the SiteSetting table in Phase 5; this file is the build-time
 * fallback and the source for structured data.
 */
export const site = {
  name: "MediSure Hospital", // TODO: client
  legalName: "MediSure Hospital Pvt Ltd", // TODO: client
  tagline: "Your health is our priority",
  description:
    "A premier multi-speciality hospital in the heart of Kukatpally, providing transparent, ethical and patient-oriented care across all age groups — with seamless insurance support under one roof.",

  // TODO: client — used in JSON-LD MedicalClinic and the contact page
  address: {
    street: "123 Hospital Road",
    locality: "Kukatpally",
    city: "Hyderabad",
    state: "Telangana",
    postalCode: "500001",
    country: "IN",
  },
  geo: { lat: 17.385044, lng: 78.486671 }, // TODO: client — exact map pin

  phone: {
    main: "+914012345678", // TODO: client
    booking: "+919000000000", // TODO: client
    emergency: "+914099999999", // TODO: client — shown in header at all times
    // Front desk — the header's "Call" button, and also the number staff use
    // to ring patients back for a second opinion request.
    reception: "+917989554697",
  },
  email: {
    general: "info@medisure.example", // TODO: client
    bookings: "appointments@medisure.example", // TODO: client
  },

  /** Displayed on the contact page and in structured data. */
  hours: {
    opd: "Mon–Sat, 9:00 AM – 8:00 PM",
    homePhysio: "Mon–Sun, 7:00 AM – 7:00 PM",
    emergency: "24 × 7",
  },

  social: {
    facebook: "", // TODO: client
    instagram: "",
    youtube: "",
  },

  /** Booking engine defaults — overridable from admin Settings in Phase 5. */
  booking: {
    minLeadTimeMinutes: 120,
    bookingWindowDays: 30,
    holdMinutes: 10,
    timezone: "Asia/Kolkata",
    /** Home-physio pincode gate. Client has not supplied the list yet, so
     *  this stays false and all pincodes are accepted (see plan §2C). */
    homePhysioPincodeCheck: false,
  },
} as const;

export type Site = typeof site;
