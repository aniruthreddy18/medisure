(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/backend/src/time.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "dayOfWeek",
    ()=>dayOfWeek,
    "formatDateLabel",
    ()=>formatDateLabel,
    "formatTimeLabel",
    ()=>formatTimeLabel,
    "fromDateKey",
    ()=>fromDateKey,
    "nowInClinicTz",
    ()=>nowInClinicTz,
    "partOfDay",
    ()=>partOfDay,
    "toDateKey",
    ()=>toDateKey,
    "toHHMM",
    ()=>toHHMM,
    "toMinutes",
    ()=>toMinutes,
    "upcomingDateKeys",
    ()=>upcomingDateKeys
]);
/**
 * Wall-clock time helpers.
 *
 * The booking engine works entirely in the hospital's local timezone using
 * "HH:mm" strings and calendar dates. We never convert slot times to UTC
 * instants: a clinic that runs 09:00–13:00 runs at those times regardless of
 * where the server is, and converting invites off-by-one-day bugs that the
 * front desk would have to untangle by hand.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$date$2d$fns$2f$tz$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@date-fns/tz/index.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$date$2d$fns$2f$tz$2f$date$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@date-fns/tz/date/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$backend$2f$src$2f$site$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/backend/src/site.ts [app-client] (ecmascript)");
;
;
const TZ = __TURBOPACK__imported__module__$5b$project$5d2f$backend$2f$src$2f$site$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["site"].booking.timezone;
function toMinutes(hhmm) {
    const [h, m] = hhmm.split(":").map(Number);
    return h * 60 + m;
}
function toHHMM(minutes) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
function toDateKey(date) {
    const y = date.getUTCFullYear();
    const m = String(date.getUTCMonth() + 1).padStart(2, "0");
    const d = String(date.getUTCDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}
function fromDateKey(key) {
    const [y, m, d] = key.split("-").map(Number);
    return new Date(Date.UTC(y, m - 1, d));
}
function nowInClinicTz() {
    const now = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$date$2d$fns$2f$tz$2f$date$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TZDate"](new Date(), TZ);
    const dateKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    return {
        dateKey,
        minutes: now.getHours() * 60 + now.getMinutes()
    };
}
function dayOfWeek(dateKey) {
    return fromDateKey(dateKey).getUTCDay();
}
function formatDateLabel(dateKey) {
    const d = fromDateKey(dateKey);
    return d.toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
        timeZone: "UTC"
    });
}
function formatTimeLabel(hhmm) {
    const [h, m] = hhmm.split(":").map(Number);
    const period = h < 12 ? "AM" : "PM";
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `${h12}:${String(m).padStart(2, "0")} ${period}`;
}
function partOfDay(hhmm) {
    const mins = toMinutes(hhmm);
    if (mins < 12 * 60) return "Morning";
    if (mins < 16 * 60) return "Afternoon";
    return "Evening";
}
function upcomingDateKeys(count) {
    const { dateKey } = nowInClinicTz();
    const start = fromDateKey(dateKey);
    return Array.from({
        length: count
    }, (_, i)=>{
        const d = new Date(start);
        d.setUTCDate(d.getUTCDate() + i);
        return toDateKey(d);
    });
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/frontend/src/components/booking/OpBookingFlow.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "OpBookingFlow",
    ()=>OpBookingFlow
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/check.mjs [app-client] (ecmascript) <export default as Check>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/loader-circle.mjs [app-client] (ecmascript) <export default as Loader2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowLeft$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/arrow-left.mjs [app-client] (ecmascript) <export default as ArrowLeft>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-alert.mjs [app-client] (ecmascript) <export default as AlertCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/src/lib/utils.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$components$2f$booking$2f$SlotPicker$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/src/components/booking/SlotPicker.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$components$2f$booking$2f$OtpStep$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/src/components/booking/OtpStep.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$backend$2f$src$2f$time$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/backend/src/time.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
;
const STEPS = [
    "Speciality",
    "Doctor",
    "Date & time",
    "Your details"
];
function OpBookingFlow({ departments, doctors, initialDepartment, initialDoctor }) {
    _s();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const preDoctor = doctors.find((d)=>d.slug === initialDoctor) ?? null;
    const preDept = departments.find((d)=>d.slug === initialDepartment) ?? (preDoctor ? preDoctor.departments[0]?.department ?? null : null);
    const [step, setStep] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(preDoctor ? 2 : preDept ? 1 : 0);
    const [dept, setDept] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(preDept);
    const [doctor, setDoctor] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(preDoctor);
    const [slot, setSlot] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [form, setForm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        patientName: "",
        phone: "",
        email: "",
        age: "",
        gender: "",
        notes: "",
        consent: false
    });
    // Set once the mobile number is verified; the API refuses bookings without it.
    const [verification, setVerification] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [submitting, setSubmitting] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [fieldErrors, setFieldErrors] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({});
    const visibleDoctors = dept ? doctors.filter((d)=>d.departments.some((x)=>x.department.id === dept.id)) : doctors;
    async function submit(e) {
        e.preventDefault();
        if (!doctor || !slot) return;
        setSubmitting(true);
        setError(null);
        setFieldErrors({});
        try {
            const res = await fetch("/api/bookings", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    serviceType: "OP",
                    doctorId: doctor.id,
                    departmentId: dept?.id ?? null,
                    date: slot.date,
                    startTime: slot.startTime,
                    patientName: form.patientName,
                    phone: form.phone,
                    email: form.email || null,
                    age: form.age ? Number(form.age) : null,
                    gender: form.gender || null,
                    notes: form.notes || null,
                    consent: form.consent,
                    verificationToken: verification
                })
            });
            const json = await res.json();
            if (!res.ok) {
                setError(json.error ?? "Something went wrong.");
                if (json.fields) setFieldErrors(json.fields);
                // A 409 means someone else took the slot while this form was open —
                // send the patient back to pick another time rather than leaving them
                // staring at an error on a dead slot.
                if (res.status === 409) {
                    setSlot(null);
                    setStep(2);
                }
                return;
            }
            router.push(`/book/success/${json.ref}`);
        } catch  {
            setError("We could not reach the server. Please check your connection and try again.");
        } finally{
            setSubmitting(false);
        }
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "grid gap-10 lg:grid-cols-[1fr_20rem]",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ol", {
                        className: "mb-8 flex flex-wrap gap-x-2 gap-y-2 text-sm",
                        "aria-label": "Booking steps",
                        children: STEPS.map((label, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                className: "flex items-center gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("grid size-7 place-items-center rounded-full text-xs font-semibold", i < step ? "bg-brand-700 text-white" : i === step ? "bg-accent-500 text-white" : "bg-ink-100 text-ink-500"),
                                        "aria-current": i === step ? "step" : undefined,
                                        children: i < step ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__["Check"], {
                                            className: "size-3.5",
                                            "aria-hidden": "true"
                                        }, void 0, false, {
                                            fileName: "[project]/frontend/src/components/booking/OpBookingFlow.tsx",
                                            lineNumber: 139,
                                            columnNumber: 29
                                        }, this) : i + 1
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/src/components/booking/OpBookingFlow.tsx",
                                        lineNumber: 128,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])(i === step ? "font-semibold text-brand-900" : "text-ink-500"),
                                        children: label
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/src/components/booking/OpBookingFlow.tsx",
                                        lineNumber: 141,
                                        columnNumber: 15
                                    }, this),
                                    i < STEPS.length - 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "mx-1 text-ink-300",
                                        "aria-hidden": "true",
                                        children: "›"
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/src/components/booking/OpBookingFlow.tsx",
                                        lineNumber: 144,
                                        columnNumber: 40
                                    }, this)
                                ]
                            }, label, true, {
                                fileName: "[project]/frontend/src/components/booking/OpBookingFlow.tsx",
                                lineNumber: 127,
                                columnNumber: 13
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/frontend/src/components/booking/OpBookingFlow.tsx",
                        lineNumber: 125,
                        columnNumber: 9
                    }, this),
                    step > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: ()=>setStep((s)=>s - 1),
                        className: "mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 hover:underline",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowLeft$3e$__["ArrowLeft"], {
                                className: "size-4",
                                "aria-hidden": "true"
                            }, void 0, false, {
                                fileName: "[project]/frontend/src/components/booking/OpBookingFlow.tsx",
                                lineNumber: 155,
                                columnNumber: 13
                            }, this),
                            "Back"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/frontend/src/components/booking/OpBookingFlow.tsx",
                        lineNumber: 150,
                        columnNumber: 11
                    }, this),
                    error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        role: "alert",
                        className: "mb-5 flex items-start gap-2 rounded-xl border border-emergency/30 bg-emergency/5 p-4 text-sm text-emergency",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__["AlertCircle"], {
                                className: "mt-0.5 size-4 shrink-0",
                                "aria-hidden": "true"
                            }, void 0, false, {
                                fileName: "[project]/frontend/src/components/booking/OpBookingFlow.tsx",
                                lineNumber: 165,
                                columnNumber: 13
                            }, this),
                            error
                        ]
                    }, void 0, true, {
                        fileName: "[project]/frontend/src/components/booking/OpBookingFlow.tsx",
                        lineNumber: 161,
                        columnNumber: 11
                    }, this),
                    step === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("fieldset", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("legend", {
                                className: "font-display text-xl font-bold text-brand-950",
                                children: "Which speciality do you need?"
                            }, void 0, false, {
                                fileName: "[project]/frontend/src/components/booking/OpBookingFlow.tsx",
                                lineNumber: 173,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mt-5 grid gap-3 sm:grid-cols-2",
                                children: departments.map((d)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        onClick: ()=>{
                                            setDept(d);
                                            setDoctor(null);
                                            setStep(1);
                                        },
                                        className: "rounded-xl border border-border bg-white p-5 text-left transition-colors hover:border-brand-400 hover:bg-brand-50",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "font-display font-semibold text-brand-900",
                                            children: d.name
                                        }, void 0, false, {
                                            fileName: "[project]/frontend/src/components/booking/OpBookingFlow.tsx",
                                            lineNumber: 188,
                                            columnNumber: 19
                                        }, this)
                                    }, d.id, false, {
                                        fileName: "[project]/frontend/src/components/booking/OpBookingFlow.tsx",
                                        lineNumber: 178,
                                        columnNumber: 17
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/frontend/src/components/booking/OpBookingFlow.tsx",
                                lineNumber: 176,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/frontend/src/components/booking/OpBookingFlow.tsx",
                        lineNumber: 172,
                        columnNumber: 11
                    }, this),
                    step === 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("fieldset", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("legend", {
                                className: "font-display text-xl font-bold text-brand-950",
                                children: "Choose your doctor"
                            }, void 0, false, {
                                fileName: "[project]/frontend/src/components/booking/OpBookingFlow.tsx",
                                lineNumber: 198,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mt-5 grid gap-3",
                                children: [
                                    visibleDoctors.map((d)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "button",
                                            onClick: ()=>{
                                                setDoctor(d);
                                                setSlot(null);
                                                setStep(2);
                                            },
                                            className: "flex items-center justify-between gap-4 rounded-xl border border-border bg-white p-5 text-left transition-colors hover:border-brand-400 hover:bg-brand-50",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "block font-display font-semibold text-brand-900",
                                                            children: d.name
                                                        }, void 0, false, {
                                                            fileName: "[project]/frontend/src/components/booking/OpBookingFlow.tsx",
                                                            lineNumber: 214,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "mt-0.5 block text-sm text-ink-600",
                                                            children: d.designation
                                                        }, void 0, false, {
                                                            fileName: "[project]/frontend/src/components/booking/OpBookingFlow.tsx",
                                                            lineNumber: 215,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "mt-1 block text-sm text-ink-500",
                                                            children: [
                                                                d.experienceYears,
                                                                "+ years experience"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/frontend/src/components/booking/OpBookingFlow.tsx",
                                                            lineNumber: 216,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/frontend/src/components/booking/OpBookingFlow.tsx",
                                                    lineNumber: 213,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "shrink-0 text-right",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "block font-semibold text-brand-900",
                                                            children: [
                                                                "₹",
                                                                (d.opFeePaise / 100).toLocaleString("en-IN")
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/frontend/src/components/booking/OpBookingFlow.tsx",
                                                            lineNumber: 221,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-xs text-ink-500",
                                                            children: "consultation"
                                                        }, void 0, false, {
                                                            fileName: "[project]/frontend/src/components/booking/OpBookingFlow.tsx",
                                                            lineNumber: 224,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/frontend/src/components/booking/OpBookingFlow.tsx",
                                                    lineNumber: 220,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, d.id, true, {
                                            fileName: "[project]/frontend/src/components/booking/OpBookingFlow.tsx",
                                            lineNumber: 203,
                                            columnNumber: 17
                                        }, this)),
                                    visibleDoctors.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "rounded-xl border border-dashed border-border p-6 text-center text-ink-600",
                                        children: "No doctors listed for this speciality yet."
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/src/components/booking/OpBookingFlow.tsx",
                                        lineNumber: 229,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/frontend/src/components/booking/OpBookingFlow.tsx",
                                lineNumber: 201,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/frontend/src/components/booking/OpBookingFlow.tsx",
                        lineNumber: 197,
                        columnNumber: 11
                    }, this),
                    step === 2 && doctor && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                className: "font-display text-xl font-bold text-brand-950",
                                children: "Pick a date and time"
                            }, void 0, false, {
                                fileName: "[project]/frontend/src/components/booking/OpBookingFlow.tsx",
                                lineNumber: 240,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "mt-1.5 text-ink-600",
                                children: [
                                    "Showing live availability for ",
                                    doctor.name,
                                    "."
                                ]
                            }, void 0, true, {
                                fileName: "[project]/frontend/src/components/booking/OpBookingFlow.tsx",
                                lineNumber: 243,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mt-6",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$components$2f$booking$2f$SlotPicker$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SlotPicker"], {
                                    doctorId: doctor.id,
                                    serviceType: "OP",
                                    value: slot,
                                    onChange: (v)=>{
                                        setSlot(v);
                                        setStep(3);
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/frontend/src/components/booking/OpBookingFlow.tsx",
                                    lineNumber: 247,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/frontend/src/components/booking/OpBookingFlow.tsx",
                                lineNumber: 246,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/frontend/src/components/booking/OpBookingFlow.tsx",
                        lineNumber: 239,
                        columnNumber: 11
                    }, this),
                    step === 3 && doctor && slot && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                        onSubmit: submit,
                        noValidate: true,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                className: "font-display text-xl font-bold text-brand-950",
                                children: "Patient details"
                            }, void 0, false, {
                                fileName: "[project]/frontend/src/components/booking/OpBookingFlow.tsx",
                                lineNumber: 263,
                                columnNumber: 13
                            }, this),
                            !verification ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mt-5",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$components$2f$booking$2f$OtpStep$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["OtpStep"], {
                                    phone: form.phone,
                                    onPhoneChange: (v)=>setForm({
                                            ...form,
                                            phone: v
                                        }),
                                    onVerified: (token, phone)=>{
                                        setVerification(token);
                                        setForm((f)=>({
                                                ...f,
                                                phone
                                            }));
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/frontend/src/components/booking/OpBookingFlow.tsx",
                                    lineNumber: 267,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/frontend/src/components/booking/OpBookingFlow.tsx",
                                lineNumber: 266,
                                columnNumber: 15
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "mt-4 inline-flex items-center gap-2 rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-800",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__["Check"], {
                                                className: "size-4",
                                                "aria-hidden": "true"
                                            }, void 0, false, {
                                                fileName: "[project]/frontend/src/components/booking/OpBookingFlow.tsx",
                                                lineNumber: 279,
                                                columnNumber: 15
                                            }, this),
                                            form.phone,
                                            " verified"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/frontend/src/components/booking/OpBookingFlow.tsx",
                                        lineNumber: 278,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "mt-5 grid gap-4 sm:grid-cols-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Field, {
                                                label: "Patient's full name",
                                                required: true,
                                                error: fieldErrors.patientName?.[0],
                                                className: "sm:col-span-2",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: "text",
                                                    required: true,
                                                    value: form.patientName,
                                                    onChange: (e)=>setForm({
                                                            ...form,
                                                            patientName: e.target.value
                                                        }),
                                                    className: "input",
                                                    autoComplete: "name"
                                                }, void 0, false, {
                                                    fileName: "[project]/frontend/src/components/booking/OpBookingFlow.tsx",
                                                    lineNumber: 290,
                                                    columnNumber: 17
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/frontend/src/components/booking/OpBookingFlow.tsx",
                                                lineNumber: 284,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Field, {
                                                label: "Email (optional)",
                                                error: fieldErrors.email?.[0],
                                                className: "sm:col-span-2",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: "email",
                                                    value: form.email,
                                                    onChange: (e)=>setForm({
                                                            ...form,
                                                            email: e.target.value
                                                        }),
                                                    className: "input",
                                                    autoComplete: "email"
                                                }, void 0, false, {
                                                    fileName: "[project]/frontend/src/components/booking/OpBookingFlow.tsx",
                                                    lineNumber: 301,
                                                    columnNumber: 17
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/frontend/src/components/booking/OpBookingFlow.tsx",
                                                lineNumber: 300,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Field, {
                                                label: "Age",
                                                error: fieldErrors.age?.[0],
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: "number",
                                                    min: 0,
                                                    max: 120,
                                                    value: form.age,
                                                    onChange: (e)=>setForm({
                                                            ...form,
                                                            age: e.target.value
                                                        }),
                                                    className: "input"
                                                }, void 0, false, {
                                                    fileName: "[project]/frontend/src/components/booking/OpBookingFlow.tsx",
                                                    lineNumber: 311,
                                                    columnNumber: 17
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/frontend/src/components/booking/OpBookingFlow.tsx",
                                                lineNumber: 310,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Field, {
                                                label: "Gender",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                    value: form.gender,
                                                    onChange: (e)=>setForm({
                                                            ...form,
                                                            gender: e.target.value
                                                        }),
                                                    className: "input",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            value: "",
                                                            children: "Prefer not to say"
                                                        }, void 0, false, {
                                                            fileName: "[project]/frontend/src/components/booking/OpBookingFlow.tsx",
                                                            lineNumber: 327,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            value: "FEMALE",
                                                            children: "Female"
                                                        }, void 0, false, {
                                                            fileName: "[project]/frontend/src/components/booking/OpBookingFlow.tsx",
                                                            lineNumber: 328,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            value: "MALE",
                                                            children: "Male"
                                                        }, void 0, false, {
                                                            fileName: "[project]/frontend/src/components/booking/OpBookingFlow.tsx",
                                                            lineNumber: 329,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            value: "OTHER",
                                                            children: "Other"
                                                        }, void 0, false, {
                                                            fileName: "[project]/frontend/src/components/booking/OpBookingFlow.tsx",
                                                            lineNumber: 330,
                                                            columnNumber: 19
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/frontend/src/components/booking/OpBookingFlow.tsx",
                                                    lineNumber: 322,
                                                    columnNumber: 17
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/frontend/src/components/booking/OpBookingFlow.tsx",
                                                lineNumber: 321,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Field, {
                                                label: "Reason for visit (optional)",
                                                className: "sm:col-span-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                                        rows: 3,
                                                        value: form.notes,
                                                        onChange: (e)=>setForm({
                                                                ...form,
                                                                notes: e.target.value
                                                            }),
                                                        className: "input",
                                                        placeholder: "Briefly describe your symptoms or the reason for this appointment."
                                                    }, void 0, false, {
                                                        fileName: "[project]/frontend/src/components/booking/OpBookingFlow.tsx",
                                                        lineNumber: 335,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "mt-1.5 text-xs text-ink-500",
                                                        children: "Please do not enter full medical reports here. Bring them to your appointment."
                                                    }, void 0, false, {
                                                        fileName: "[project]/frontend/src/components/booking/OpBookingFlow.tsx",
                                                        lineNumber: 342,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/frontend/src/components/booking/OpBookingFlow.tsx",
                                                lineNumber: 334,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/frontend/src/components/booking/OpBookingFlow.tsx",
                                        lineNumber: 283,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "mt-6 flex items-start gap-3 rounded-xl border border-border bg-ink-50 p-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "checkbox",
                                                required: true,
                                                checked: form.consent,
                                                onChange: (e)=>setForm({
                                                        ...form,
                                                        consent: e.target.checked
                                                    }),
                                                className: "mt-1 size-4 shrink-0 accent-brand-700"
                                            }, void 0, false, {
                                                fileName: "[project]/frontend/src/components/booking/OpBookingFlow.tsx",
                                                lineNumber: 350,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-sm leading-relaxed text-ink-700",
                                                children: [
                                                    "I agree to be contacted about this appointment by SMS, call, email or WhatsApp, and I accept the privacy policy.",
                                                    fieldErrors.consent?.[0] && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "mt-1 block text-emergency",
                                                        children: fieldErrors.consent[0]
                                                    }, void 0, false, {
                                                        fileName: "[project]/frontend/src/components/booking/OpBookingFlow.tsx",
                                                        lineNumber: 361,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/frontend/src/components/booking/OpBookingFlow.tsx",
                                                lineNumber: 357,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/frontend/src/components/booking/OpBookingFlow.tsx",
                                        lineNumber: 349,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "submit",
                                        disabled: submitting,
                                        className: "mt-6 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-accent-500 px-7 font-semibold text-white transition-colors hover:bg-accent-600 disabled:opacity-60 sm:w-auto",
                                        children: [
                                            submitting && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                                                className: "size-4 animate-spin",
                                                "aria-hidden": "true"
                                            }, void 0, false, {
                                                fileName: "[project]/frontend/src/components/booking/OpBookingFlow.tsx",
                                                lineNumber: 371,
                                                columnNumber: 30
                                            }, this),
                                            submitting ? "Reserving your slot…" : "Confirm & continue to payment"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/frontend/src/components/booking/OpBookingFlow.tsx",
                                        lineNumber: 366,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/frontend/src/components/booking/OpBookingFlow.tsx",
                                lineNumber: 277,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/frontend/src/components/booking/OpBookingFlow.tsx",
                        lineNumber: 262,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/frontend/src/components/booking/OpBookingFlow.tsx",
                lineNumber: 123,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("aside", {
                className: "lg:sticky lg:top-32 lg:self-start",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "rounded-2xl border border-border bg-white p-6",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            className: "font-display text-sm font-semibold uppercase tracking-wider text-brand-700",
                            children: "Your appointment"
                        }, void 0, false, {
                            fileName: "[project]/frontend/src/components/booking/OpBookingFlow.tsx",
                            lineNumber: 383,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("dl", {
                            className: "mt-4 space-y-3 text-sm",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SummaryRow, {
                                    label: "Speciality",
                                    value: dept?.name
                                }, void 0, false, {
                                    fileName: "[project]/frontend/src/components/booking/OpBookingFlow.tsx",
                                    lineNumber: 387,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SummaryRow, {
                                    label: "Doctor",
                                    value: doctor?.name
                                }, void 0, false, {
                                    fileName: "[project]/frontend/src/components/booking/OpBookingFlow.tsx",
                                    lineNumber: 388,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SummaryRow, {
                                    label: "When",
                                    value: slot ? `${(0, __TURBOPACK__imported__module__$5b$project$5d2f$backend$2f$src$2f$time$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatDateLabel"])(slot.date)}, ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$backend$2f$src$2f$time$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatTimeLabel"])(slot.startTime)}` : undefined
                                }, void 0, false, {
                                    fileName: "[project]/frontend/src/components/booking/OpBookingFlow.tsx",
                                    lineNumber: 389,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/frontend/src/components/booking/OpBookingFlow.tsx",
                            lineNumber: 386,
                            columnNumber: 11
                        }, this),
                        doctor && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "mt-5 border-t border-border pt-4",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-baseline justify-between",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-sm text-ink-600",
                                        children: "Consultation fee"
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/src/components/booking/OpBookingFlow.tsx",
                                        lineNumber: 402,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "font-display text-xl font-bold text-brand-900",
                                        children: [
                                            "₹",
                                            (doctor.opFeePaise / 100).toLocaleString("en-IN")
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/frontend/src/components/booking/OpBookingFlow.tsx",
                                        lineNumber: 403,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/frontend/src/components/booking/OpBookingFlow.tsx",
                                lineNumber: 401,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/frontend/src/components/booking/OpBookingFlow.tsx",
                            lineNumber: 400,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "mt-5 text-xs leading-relaxed text-ink-500",
                            children: "Your slot is held for a few minutes while you complete payment. If payment is not completed, the slot is released automatically."
                        }, void 0, false, {
                            fileName: "[project]/frontend/src/components/booking/OpBookingFlow.tsx",
                            lineNumber: 410,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/frontend/src/components/booking/OpBookingFlow.tsx",
                    lineNumber: 382,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/frontend/src/components/booking/OpBookingFlow.tsx",
                lineNumber: 381,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/frontend/src/components/booking/OpBookingFlow.tsx",
        lineNumber: 122,
        columnNumber: 5
    }, this);
}
_s(OpBookingFlow, "H+B3HjAFJimHN7zkYcnoAfUGM3M=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c = OpBookingFlow;
function SummaryRow({ label, value }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex justify-between gap-4",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("dt", {
                className: "text-ink-500",
                children: label
            }, void 0, false, {
                fileName: "[project]/frontend/src/components/booking/OpBookingFlow.tsx",
                lineNumber: 423,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("dd", {
                className: value ? "text-right font-medium text-ink-900" : "text-right text-ink-400",
                children: value ?? "—"
            }, void 0, false, {
                fileName: "[project]/frontend/src/components/booking/OpBookingFlow.tsx",
                lineNumber: 424,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/frontend/src/components/booking/OpBookingFlow.tsx",
        lineNumber: 422,
        columnNumber: 5
    }, this);
}
_c1 = SummaryRow;
function Field({ label, required, error, className, children }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("block", className),
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "mb-1.5 block text-sm font-medium text-ink-700",
                children: [
                    label,
                    required && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-emergency",
                        children: " *"
                    }, void 0, false, {
                        fileName: "[project]/frontend/src/components/booking/OpBookingFlow.tsx",
                        lineNumber: 448,
                        columnNumber: 22
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/frontend/src/components/booking/OpBookingFlow.tsx",
                lineNumber: 446,
                columnNumber: 7
            }, this),
            children,
            error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "mt-1 block text-sm text-emergency",
                children: error
            }, void 0, false, {
                fileName: "[project]/frontend/src/components/booking/OpBookingFlow.tsx",
                lineNumber: 451,
                columnNumber: 17
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/frontend/src/components/booking/OpBookingFlow.tsx",
        lineNumber: 445,
        columnNumber: 5
    }, this);
}
_c2 = Field;
var _c, _c1, _c2;
__turbopack_context__.k.register(_c, "OpBookingFlow");
__turbopack_context__.k.register(_c1, "SummaryRow");
__turbopack_context__.k.register(_c2, "Field");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/frontend/src/components/booking/OtpStep.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "OtpStep",
    ()=>OtpStep
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/loader-circle.mjs [app-client] (ecmascript) <export default as Loader2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2d$check$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ShieldCheck$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/shield-check.mjs [app-client] (ecmascript) <export default as ShieldCheck>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rotate$2d$ccw$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RotateCcw$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/rotate-ccw.mjs [app-client] (ecmascript) <export default as RotateCcw>");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
function OtpStep({ phone, onPhoneChange, onVerified }) {
    _s();
    const [stage, setStage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("phone");
    const [code, setCode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [busy, setBusy] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [devCode, setDevCode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    async function send() {
        setBusy(true);
        setError(null);
        try {
            const res = await fetch("/api/otp/send", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    phone
                })
            });
            const json = await res.json();
            if (!res.ok) {
                setError(json.error ?? "Could not send the code.");
                return;
            }
            setDevCode(json.devCode ?? null);
            setStage("code");
        } catch  {
            setError("Could not reach the server. Please try again.");
        } finally{
            setBusy(false);
        }
    }
    async function verify() {
        setBusy(true);
        setError(null);
        try {
            const res = await fetch("/api/otp/verify", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    phone,
                    code
                })
            });
            const json = await res.json();
            if (!res.ok) {
                setError(json.error ?? "Could not verify the code.");
                return;
            }
            onVerified(json.token, phone);
        } catch  {
            setError("Could not reach the server. Please try again.");
        } finally{
            setBusy(false);
        }
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "rounded-2xl border border-border bg-white p-6",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                className: "flex items-center gap-2 font-display text-lg font-bold text-brand-950",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2d$check$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ShieldCheck$3e$__["ShieldCheck"], {
                        className: "size-5 text-brand-600",
                        "aria-hidden": "true"
                    }, void 0, false, {
                        fileName: "[project]/frontend/src/components/booking/OtpStep.tsx",
                        lineNumber: 76,
                        columnNumber: 9
                    }, this),
                    "Verify your mobile number"
                ]
            }, void 0, true, {
                fileName: "[project]/frontend/src/components/booking/OtpStep.tsx",
                lineNumber: 75,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "mt-1.5 text-sm text-ink-600",
                children: "We send appointment reminders and any changes to this number."
            }, void 0, false, {
                fileName: "[project]/frontend/src/components/booking/OtpStep.tsx",
                lineNumber: 79,
                columnNumber: 7
            }, this),
            error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                role: "alert",
                className: "mt-4 rounded-xl border border-emergency/30 bg-emergency/5 p-3 text-sm text-emergency",
                children: error
            }, void 0, false, {
                fileName: "[project]/frontend/src/components/booking/OtpStep.tsx",
                lineNumber: 84,
                columnNumber: 9
            }, this),
            stage === "phone" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-5",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        className: "block",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "mb-1.5 block text-sm font-medium text-ink-700",
                                children: [
                                    "Mobile number ",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-emergency",
                                        children: "*"
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/src/components/booking/OtpStep.tsx",
                                        lineNumber: 93,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/frontend/src/components/booking/OtpStep.tsx",
                                lineNumber: 92,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "tel",
                                inputMode: "numeric",
                                maxLength: 10,
                                value: phone,
                                onChange: (e)=>onPhoneChange(e.target.value.replace(/\D/g, "")),
                                className: "input",
                                placeholder: "10-digit mobile",
                                autoComplete: "tel"
                            }, void 0, false, {
                                fileName: "[project]/frontend/src/components/booking/OtpStep.tsx",
                                lineNumber: 95,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/frontend/src/components/booking/OtpStep.tsx",
                        lineNumber: 91,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: send,
                        disabled: busy || phone.replace(/\D/g, "").length !== 10,
                        className: "mt-4 inline-flex min-h-12 items-center gap-2 rounded-xl bg-brand-700 px-6 font-semibold text-white hover:bg-brand-800 disabled:opacity-50",
                        children: [
                            busy && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                                className: "size-4 animate-spin",
                                "aria-hidden": "true"
                            }, void 0, false, {
                                fileName: "[project]/frontend/src/components/booking/OtpStep.tsx",
                                lineNumber: 113,
                                columnNumber: 22
                            }, this),
                            "Send code"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/frontend/src/components/booking/OtpStep.tsx",
                        lineNumber: 107,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mt-3 text-xs leading-relaxed text-ink-500",
                        children: "By requesting a code you agree to receive messages from us about this booking by SMS, call or WhatsApp."
                    }, void 0, false, {
                        fileName: "[project]/frontend/src/components/booking/OtpStep.tsx",
                        lineNumber: 117,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/frontend/src/components/booking/OtpStep.tsx",
                lineNumber: 90,
                columnNumber: 9
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-5",
                children: [
                    devCode && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mb-4 rounded-xl border border-dashed border-brand-300 bg-brand-50 p-3 text-sm text-brand-800",
                        children: [
                            "Development mode — no SMS was sent. Your code is",
                            " ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                className: "font-mono tracking-widest",
                                children: devCode
                            }, void 0, false, {
                                fileName: "[project]/frontend/src/components/booking/OtpStep.tsx",
                                lineNumber: 127,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/frontend/src/components/booking/OtpStep.tsx",
                        lineNumber: 125,
                        columnNumber: 13
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        className: "block",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "mb-1.5 block text-sm font-medium text-ink-700",
                                children: [
                                    "Enter the 6-digit code sent to ",
                                    phone
                                ]
                            }, void 0, true, {
                                fileName: "[project]/frontend/src/components/booking/OtpStep.tsx",
                                lineNumber: 132,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "text",
                                inputMode: "numeric",
                                maxLength: 6,
                                value: code,
                                onChange: (e)=>setCode(e.target.value.replace(/\D/g, "")),
                                className: "input font-mono text-lg tracking-[0.4em]",
                                autoComplete: "one-time-code",
                                autoFocus: true
                            }, void 0, false, {
                                fileName: "[project]/frontend/src/components/booking/OtpStep.tsx",
                                lineNumber: 135,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/frontend/src/components/booking/OtpStep.tsx",
                        lineNumber: 131,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-4 flex flex-wrap gap-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: verify,
                                disabled: busy || code.length !== 6,
                                className: "inline-flex min-h-12 items-center gap-2 rounded-xl bg-accent-500 px-6 font-semibold text-white hover:bg-accent-600 disabled:opacity-50",
                                children: [
                                    busy && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                                        className: "size-4 animate-spin",
                                        "aria-hidden": "true"
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/src/components/booking/OtpStep.tsx",
                                        lineNumber: 154,
                                        columnNumber: 24
                                    }, this),
                                    "Verify"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/frontend/src/components/booking/OtpStep.tsx",
                                lineNumber: 148,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: ()=>{
                                    setStage("phone");
                                    setCode("");
                                    setDevCode(null);
                                },
                                className: "inline-flex min-h-12 items-center gap-2 rounded-xl border border-border px-5 font-medium text-ink-700 hover:bg-ink-50",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rotate$2d$ccw$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RotateCcw$3e$__["RotateCcw"], {
                                        className: "size-4",
                                        "aria-hidden": "true"
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/src/components/booking/OtpStep.tsx",
                                        lineNumber: 166,
                                        columnNumber: 15
                                    }, this),
                                    "Change number"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/frontend/src/components/booking/OtpStep.tsx",
                                lineNumber: 157,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/frontend/src/components/booking/OtpStep.tsx",
                        lineNumber: 147,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/frontend/src/components/booking/OtpStep.tsx",
                lineNumber: 123,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/frontend/src/components/booking/OtpStep.tsx",
        lineNumber: 74,
        columnNumber: 5
    }, this);
}
_s(OtpStep, "DV7Zv1jXI+4JcgruQ7o1qx9MPak=");
_c = OtpStep;
var _c;
__turbopack_context__.k.register(_c, "OtpStep");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/frontend/src/components/booking/SlotPicker.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SlotPicker",
    ()=>SlotPicker
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/loader-circle.mjs [app-client] (ecmascript) <export default as Loader2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2d$x$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CalendarX$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/calendar-x.mjs [app-client] (ecmascript) <export default as CalendarX>");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/src/lib/utils.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$backend$2f$src$2f$time$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/backend/src/time.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
function SlotPicker({ doctorId, serviceType, value, onChange, days = 14 }) {
    _s();
    const dates = (0, __TURBOPACK__imported__module__$5b$project$5d2f$backend$2f$src$2f$time$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["upcomingDateKeys"])(days);
    const [activeDate, setActiveDate] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(value?.date ?? dates[0]);
    // One piece of state tagged with the request it belongs to. "Loading" is
    // then derived — the result simply has not caught up with the key yet —
    // rather than being a separate flag flipped synchronously inside the effect,
    // which causes cascading renders and can show stale slots for a moment.
    const requestKey = `${doctorId}|${activeDate}|${serviceType}`;
    const [result, setResult] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const loading = result?.key !== requestKey;
    const slots = result?.key === requestKey ? result.slots : [];
    const error = result?.key === requestKey ? result.error : null;
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "SlotPicker.useEffect": ()=>{
            let cancelled = false;
            fetch(`/api/slots?doctorId=${encodeURIComponent(doctorId)}&date=${activeDate}&serviceType=${serviceType}`).then({
                "SlotPicker.useEffect": async (res)=>{
                    const json = await res.json();
                    if (!res.ok) throw new Error(json.error ?? "Could not load times");
                    return json;
                }
            }["SlotPicker.useEffect"]).then({
                "SlotPicker.useEffect": (json)=>{
                    if (!cancelled) setResult({
                        key: requestKey,
                        slots: json.slots ?? [],
                        error: null
                    });
                }
            }["SlotPicker.useEffect"]).catch({
                "SlotPicker.useEffect": (e)=>{
                    if (!cancelled) setResult({
                        key: requestKey,
                        slots: [],
                        error: e.message
                    });
                }
            }["SlotPicker.useEffect"]);
            return ({
                "SlotPicker.useEffect": ()=>{
                    cancelled = true;
                }
            })["SlotPicker.useEffect"];
        }
    }["SlotPicker.useEffect"], [
        doctorId,
        activeDate,
        serviceType,
        requestKey
    ]);
    const groups = [
        "Morning",
        "Afternoon",
        "Evening"
    ];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                role: "radiogroup",
                "aria-label": "Choose a date",
                className: "-mx-1 flex gap-2 overflow-x-auto px-1 pb-2",
                children: dates.map((date)=>{
                    const selected = date === activeDate;
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        role: "radio",
                        "aria-checked": selected,
                        onClick: ()=>setActiveDate(date),
                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("min-h-16 shrink-0 rounded-xl border px-4 py-2 text-center transition-colors", selected ? "border-brand-700 bg-brand-700 text-white" : "border-border bg-white text-ink-700 hover:border-brand-400 hover:bg-brand-50"),
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "block text-xs uppercase tracking-wide opacity-80",
                                children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$backend$2f$src$2f$time$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatDateLabel"])(date).split(",")[0]
                            }, void 0, false, {
                                fileName: "[project]/frontend/src/components/booking/SlotPicker.tsx",
                                lineNumber: 98,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "mt-0.5 block text-sm font-semibold",
                                children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$backend$2f$src$2f$time$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatDateLabel"])(date).split(", ")[1]
                            }, void 0, false, {
                                fileName: "[project]/frontend/src/components/booking/SlotPicker.tsx",
                                lineNumber: 101,
                                columnNumber: 15
                            }, this)
                        ]
                    }, date, true, {
                        fileName: "[project]/frontend/src/components/booking/SlotPicker.tsx",
                        lineNumber: 85,
                        columnNumber: 13
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/frontend/src/components/booking/SlotPicker.tsx",
                lineNumber: 77,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-6",
                "aria-live": "polite",
                children: loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "flex items-center gap-2 py-8 text-ink-500",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                            className: "size-4 animate-spin",
                            "aria-hidden": "true"
                        }, void 0, false, {
                            fileName: "[project]/frontend/src/components/booking/SlotPicker.tsx",
                            lineNumber: 113,
                            columnNumber: 13
                        }, this),
                        "Checking availability…"
                    ]
                }, void 0, true, {
                    fileName: "[project]/frontend/src/components/booking/SlotPicker.tsx",
                    lineNumber: 112,
                    columnNumber: 11
                }, this) : error ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "rounded-xl border border-emergency/30 bg-emergency/5 p-4 text-sm text-emergency",
                    children: error
                }, void 0, false, {
                    fileName: "[project]/frontend/src/components/booking/SlotPicker.tsx",
                    lineNumber: 117,
                    columnNumber: 11
                }, this) : slots.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "rounded-xl border border-dashed border-border p-8 text-center",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2d$x$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CalendarX$3e$__["CalendarX"], {
                            className: "mx-auto size-6 text-ink-400",
                            "aria-hidden": "true"
                        }, void 0, false, {
                            fileName: "[project]/frontend/src/components/booking/SlotPicker.tsx",
                            lineNumber: 122,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "mt-3 font-medium text-ink-700",
                            children: "No times available on this date"
                        }, void 0, false, {
                            fileName: "[project]/frontend/src/components/booking/SlotPicker.tsx",
                            lineNumber: 123,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "mt-1 text-sm text-ink-500",
                            children: "Try another date, or call our booking desk for help."
                        }, void 0, false, {
                            fileName: "[project]/frontend/src/components/booking/SlotPicker.tsx",
                            lineNumber: 124,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/frontend/src/components/booking/SlotPicker.tsx",
                    lineNumber: 121,
                    columnNumber: 11
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "space-y-6",
                    children: groups.map((group)=>{
                        const inGroup = slots.filter((s)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$backend$2f$src$2f$time$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["partOfDay"])(s.startTime) === group);
                        if (inGroup.length === 0) return null;
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("fieldset", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("legend", {
                                    className: "mb-3 text-sm font-semibold text-ink-700",
                                    children: [
                                        group,
                                        " ",
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "font-normal text-ink-400",
                                            children: [
                                                "(",
                                                inGroup.length,
                                                " ",
                                                inGroup.length === 1 ? "slot" : "slots",
                                                ")"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/frontend/src/components/booking/SlotPicker.tsx",
                                            lineNumber: 138,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/frontend/src/components/booking/SlotPicker.tsx",
                                    lineNumber: 136,
                                    columnNumber: 19
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex flex-wrap gap-2",
                                    children: inGroup.map((slot)=>{
                                        const selected = value?.date === activeDate && value?.startTime === slot.startTime;
                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "button",
                                            "aria-pressed": selected,
                                            onClick: ()=>onChange({
                                                    date: activeDate,
                                                    startTime: slot.startTime,
                                                    endTime: slot.endTime
                                                }),
                                            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("min-h-11 rounded-xl border px-4 text-sm font-medium transition-colors", selected ? "border-accent-500 bg-accent-500 text-white" : "border-border bg-white text-ink-700 hover:border-brand-400 hover:bg-brand-50"),
                                            children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$backend$2f$src$2f$time$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatTimeLabel"])(slot.startTime)
                                        }, slot.startTime, false, {
                                            fileName: "[project]/frontend/src/components/booking/SlotPicker.tsx",
                                            lineNumber: 147,
                                            columnNumber: 25
                                        }, this);
                                    })
                                }, void 0, false, {
                                    fileName: "[project]/frontend/src/components/booking/SlotPicker.tsx",
                                    lineNumber: 142,
                                    columnNumber: 19
                                }, this)
                            ]
                        }, group, true, {
                            fileName: "[project]/frontend/src/components/booking/SlotPicker.tsx",
                            lineNumber: 135,
                            columnNumber: 17
                        }, this);
                    })
                }, void 0, false, {
                    fileName: "[project]/frontend/src/components/booking/SlotPicker.tsx",
                    lineNumber: 129,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/frontend/src/components/booking/SlotPicker.tsx",
                lineNumber: 110,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/frontend/src/components/booking/SlotPicker.tsx",
        lineNumber: 75,
        columnNumber: 5
    }, this);
}
_s(SlotPicker, "9yhWeDcvgIDuknAIn2sbuBydmuE=");
_c = SlotPicker;
var _c;
__turbopack_context__.k.register(_c, "SlotPicker");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=_0pw4he2._.js.map