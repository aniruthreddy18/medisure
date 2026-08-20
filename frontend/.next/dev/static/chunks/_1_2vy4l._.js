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
"[project]/frontend/src/components/booking/ManageBooking.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ManageBooking",
    ()=>ManageBooking
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/loader-circle.mjs [app-client] (ecmascript) <export default as Loader2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2d$check$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ShieldCheck$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/shield-check.mjs [app-client] (ecmascript) <export default as ShieldCheck>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2d$days$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CalendarDays$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/calendar-days.mjs [app-client] (ecmascript) <export default as CalendarDays>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-check.mjs [app-client] (ecmascript) <export default as CheckCircle2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$x$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__XCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-x.mjs [app-client] (ecmascript) <export default as XCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2d$plus$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CalendarPlus$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/calendar-plus.mjs [app-client] (ecmascript) <export default as CalendarPlus>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-alert.mjs [app-client] (ecmascript) <export default as AlertCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$components$2f$booking$2f$SlotPicker$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/src/components/booking/SlotPicker.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$backend$2f$src$2f$time$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/backend/src/time.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$backend$2f$src$2f$site$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/backend/src/site.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
function ManageBooking({ bookingRef }) {
    _s();
    const [stage, setStage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("start");
    const [code, setCode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [token, setToken] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [maskedPhone, setMaskedPhone] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [devCode, setDevCode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [details, setDetails] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [mode, setMode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("idle");
    const [slot, setSlot] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [busy, setBusy] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [notice, setNotice] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    async function post(url, body) {
        const res = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "Something went wrong.");
        return json;
    }
    async function requestCode() {
        setBusy(true);
        setError(null);
        try {
            const json = await post("/api/manage", {
                action: "request-code",
                ref: bookingRef
            });
            setMaskedPhone(json.maskedPhone);
            setDevCode(json.devCode ?? null);
            setStage("code");
        } catch (e) {
            setError(e.message);
        } finally{
            setBusy(false);
        }
    }
    async function verify() {
        setBusy(true);
        setError(null);
        try {
            // Verified by reference, not by phone: the browser only ever holds a
            // masked number, so the server resolves the real one from the booking.
            const v = await post("/api/manage", {
                action: "verify-code",
                ref: bookingRef,
                code
            });
            setToken(v.token);
            const d = await post("/api/manage/details", {
                ref: bookingRef,
                token: v.token
            });
            setDetails(d);
            setStage("ready");
        } catch (e) {
            setError(e.message);
        } finally{
            setBusy(false);
        }
    }
    async function refresh(currentToken) {
        const d = await post("/api/manage/details", {
            ref: bookingRef,
            token: currentToken
        });
        setDetails(d);
    }
    async function act(action) {
        if (!token) return;
        setBusy(true);
        setError(null);
        setNotice(null);
        try {
            const payload = {
                action,
                ref: bookingRef,
                token
            };
            if (action !== "cancel") {
                if (!slot) throw new Error("Choose a time first.");
                payload.date = slot.date;
                payload.startTime = slot.startTime;
            }
            const json = await post("/api/manage", payload);
            setNotice(action === "cancel" ? "Your booking has been cancelled." : action === "reschedule" ? `Rescheduled. Your new reference is ${json.ref}.` : `Session booked for ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$backend$2f$src$2f$time$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatDateLabel"])(json.date)} at ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$backend$2f$src$2f$time$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatTimeLabel"])(json.startTime)}.`);
            setMode("idle");
            setSlot(null);
            await refresh(token);
        } catch (e) {
            setError(e.message);
        } finally{
            setBusy(false);
        }
    }
    // ---------- Gate ----------
    if (stage !== "ready") {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "rounded-2xl border border-border bg-white p-8",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                    className: "flex items-center gap-2 text-2xl font-bold text-brand-950",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2d$check$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ShieldCheck$3e$__["ShieldCheck"], {
                            className: "size-6 text-brand-600",
                            "aria-hidden": "true"
                        }, void 0, false, {
                            fileName: "[project]/frontend/src/components/booking/ManageBooking.tsx",
                            lineNumber: 147,
                            columnNumber: 11
                        }, this),
                        "Verify it's you"
                    ]
                }, void 0, true, {
                    fileName: "[project]/frontend/src/components/booking/ManageBooking.tsx",
                    lineNumber: 146,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "mt-2 text-ink-600",
                    children: [
                        "Booking ",
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "font-mono font-semibold",
                            children: bookingRef
                        }, void 0, false, {
                            fileName: "[project]/frontend/src/components/booking/ManageBooking.tsx",
                            lineNumber: 151,
                            columnNumber: 19
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/frontend/src/components/booking/ManageBooking.tsx",
                    lineNumber: 150,
                    columnNumber: 9
                }, this),
                error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    role: "alert",
                    className: "mt-5 flex items-start gap-2 rounded-xl border border-emergency/30 bg-emergency/5 p-4 text-sm text-emergency",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__["AlertCircle"], {
                            className: "mt-0.5 size-4 shrink-0",
                            "aria-hidden": "true"
                        }, void 0, false, {
                            fileName: "[project]/frontend/src/components/booking/ManageBooking.tsx",
                            lineNumber: 156,
                            columnNumber: 13
                        }, this),
                        error
                    ]
                }, void 0, true, {
                    fileName: "[project]/frontend/src/components/booking/ManageBooking.tsx",
                    lineNumber: 155,
                    columnNumber: 11
                }, this),
                stage === "start" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "mt-5 text-ink-600",
                            children: "We will send a 6-digit code to the mobile number on this booking."
                        }, void 0, false, {
                            fileName: "[project]/frontend/src/components/booking/ManageBooking.tsx",
                            lineNumber: 163,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "button",
                            onClick: requestCode,
                            disabled: busy,
                            className: "mt-5 inline-flex min-h-12 items-center gap-2 rounded-xl bg-brand-700 px-6 font-semibold text-white hover:bg-brand-800 disabled:opacity-50",
                            children: [
                                busy && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                                    className: "size-4 animate-spin",
                                    "aria-hidden": "true"
                                }, void 0, false, {
                                    fileName: "[project]/frontend/src/components/booking/ManageBooking.tsx",
                                    lineNumber: 172,
                                    columnNumber: 24
                                }, this),
                                "Send me a code"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/frontend/src/components/booking/ManageBooking.tsx",
                            lineNumber: 166,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/frontend/src/components/booking/ManageBooking.tsx",
                    lineNumber: 162,
                    columnNumber: 11
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                    children: [
                        devCode && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "mt-5 rounded-xl border border-dashed border-brand-300 bg-brand-50 p-3 text-sm text-brand-800",
                            children: [
                                "Development mode — no SMS was sent. Your code is",
                                " ",
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                    className: "font-mono tracking-widest",
                                    children: devCode
                                }, void 0, false, {
                                    fileName: "[project]/frontend/src/components/booking/ManageBooking.tsx",
                                    lineNumber: 181,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/frontend/src/components/booking/ManageBooking.tsx",
                            lineNumber: 179,
                            columnNumber: 15
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                            className: "mt-5 block",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "mb-1.5 block text-sm font-medium text-ink-700",
                                    children: [
                                        "Code sent to ",
                                        maskedPhone
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/frontend/src/components/booking/ManageBooking.tsx",
                                    lineNumber: 185,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    type: "text",
                                    inputMode: "numeric",
                                    maxLength: 6,
                                    value: code,
                                    onChange: (e)=>setCode(e.target.value.replace(/\D/g, "")),
                                    className: "input font-mono text-lg tracking-[0.4em]",
                                    autoComplete: "one-time-code"
                                }, void 0, false, {
                                    fileName: "[project]/frontend/src/components/booking/ManageBooking.tsx",
                                    lineNumber: 188,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/frontend/src/components/booking/ManageBooking.tsx",
                            lineNumber: 184,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "button",
                            onClick: verify,
                            disabled: busy || code.length !== 6,
                            className: "mt-4 inline-flex min-h-12 items-center gap-2 rounded-xl bg-accent-500 px-6 font-semibold text-white hover:bg-accent-600 disabled:opacity-50",
                            children: [
                                busy && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                                    className: "size-4 animate-spin",
                                    "aria-hidden": "true"
                                }, void 0, false, {
                                    fileName: "[project]/frontend/src/components/booking/ManageBooking.tsx",
                                    lineNumber: 204,
                                    columnNumber: 24
                                }, this),
                                "View my booking"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/frontend/src/components/booking/ManageBooking.tsx",
                            lineNumber: 198,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/frontend/src/components/booking/ManageBooking.tsx",
                    lineNumber: 177,
                    columnNumber: 11
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/frontend/src/components/booking/ManageBooking.tsx",
            lineNumber: 145,
            columnNumber: 7
        }, this);
    }
    // ---------- Booking ----------
    const d = details;
    const pkg = d.package;
    const sessionsLeft = pkg ? pkg.sessionsTotal - pkg.sessionsUsed : 0;
    const cancellable = d.kind === "appointment" && ![
        "CANCELLED",
        "COMPLETED",
        "EXPIRED"
    ].includes(d.status);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-6",
        children: [
            notice && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "flex items-start gap-2 rounded-xl border border-brand-300 bg-brand-50 p-4 text-sm text-brand-800",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle2$3e$__["CheckCircle2"], {
                        className: "mt-0.5 size-4 shrink-0",
                        "aria-hidden": "true"
                    }, void 0, false, {
                        fileName: "[project]/frontend/src/components/booking/ManageBooking.tsx",
                        lineNumber: 223,
                        columnNumber: 11
                    }, this),
                    notice
                ]
            }, void 0, true, {
                fileName: "[project]/frontend/src/components/booking/ManageBooking.tsx",
                lineNumber: 222,
                columnNumber: 9
            }, this),
            error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                role: "alert",
                className: "flex items-start gap-2 rounded-xl border border-emergency/30 bg-emergency/5 p-4 text-sm text-emergency",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__["AlertCircle"], {
                        className: "mt-0.5 size-4 shrink-0",
                        "aria-hidden": "true"
                    }, void 0, false, {
                        fileName: "[project]/frontend/src/components/booking/ManageBooking.tsx",
                        lineNumber: 229,
                        columnNumber: 11
                    }, this),
                    error
                ]
            }, void 0, true, {
                fileName: "[project]/frontend/src/components/booking/ManageBooking.tsx",
                lineNumber: 228,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "rounded-2xl border border-border bg-white p-8",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-wrap items-start justify-between gap-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                        className: "text-2xl font-bold text-brand-950",
                                        children: "Your booking"
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/src/components/booking/ManageBooking.tsx",
                                        lineNumber: 237,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "mt-1 font-mono text-sm text-ink-500",
                                        children: d.ref
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/src/components/booking/ManageBooking.tsx",
                                        lineNumber: 238,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/frontend/src/components/booking/ManageBooking.tsx",
                                lineNumber: 236,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: d.status === "CANCELLED" || d.status === "EXPIRED" ? "rounded-full bg-ink-100 px-3 py-1 text-sm font-medium text-ink-600" : "rounded-full bg-brand-100 px-3 py-1 text-sm font-medium text-brand-800",
                                children: d.status.replace("_", " ").toLowerCase()
                            }, void 0, false, {
                                fileName: "[project]/frontend/src/components/booking/ManageBooking.tsx",
                                lineNumber: 240,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/frontend/src/components/booking/ManageBooking.tsx",
                        lineNumber: 235,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("dl", {
                        className: "mt-6 space-y-3 text-sm",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex justify-between gap-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("dt", {
                                        className: "text-ink-500",
                                        children: "Patient"
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/src/components/booking/ManageBooking.tsx",
                                        lineNumber: 253,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("dd", {
                                        className: "font-medium text-ink-900",
                                        children: d.patientName
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/src/components/booking/ManageBooking.tsx",
                                        lineNumber: 254,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/frontend/src/components/booking/ManageBooking.tsx",
                                lineNumber: 252,
                                columnNumber: 11
                            }, this),
                            d.doctorName && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex justify-between gap-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("dt", {
                                        className: "text-ink-500",
                                        children: d.serviceType === "HOME_PHYSIO" ? "Physiotherapist" : "Doctor"
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/src/components/booking/ManageBooking.tsx",
                                        lineNumber: 258,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("dd", {
                                        className: "font-medium text-ink-900",
                                        children: d.doctorName
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/src/components/booking/ManageBooking.tsx",
                                        lineNumber: 259,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/frontend/src/components/booking/ManageBooking.tsx",
                                lineNumber: 257,
                                columnNumber: 13
                            }, this),
                            d.date && d.startTime && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex justify-between gap-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("dt", {
                                        className: "text-ink-500",
                                        children: "When"
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/src/components/booking/ManageBooking.tsx",
                                        lineNumber: 264,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("dd", {
                                        className: "font-medium text-ink-900",
                                        children: [
                                            (0, __TURBOPACK__imported__module__$5b$project$5d2f$backend$2f$src$2f$time$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatDateLabel"])(d.date),
                                            ", ",
                                            (0, __TURBOPACK__imported__module__$5b$project$5d2f$backend$2f$src$2f$time$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatTimeLabel"])(d.startTime)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/frontend/src/components/booking/ManageBooking.tsx",
                                        lineNumber: 265,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/frontend/src/components/booking/ManageBooking.tsx",
                                lineNumber: 263,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/frontend/src/components/booking/ManageBooking.tsx",
                        lineNumber: 251,
                        columnNumber: 9
                    }, this),
                    cancellable && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-7 flex flex-wrap gap-3 border-t border-border pt-6",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: ()=>{
                                    setMode(mode === "reschedule" ? "idle" : "reschedule");
                                    setSlot(null);
                                },
                                className: "inline-flex min-h-11 items-center gap-2 rounded-xl border border-brand-700 px-5 font-semibold text-brand-800 hover:bg-brand-50",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2d$days$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CalendarDays$3e$__["CalendarDays"], {
                                        className: "size-4",
                                        "aria-hidden": "true"
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/src/components/booking/ManageBooking.tsx",
                                        lineNumber: 282,
                                        columnNumber: 15
                                    }, this),
                                    "Reschedule"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/frontend/src/components/booking/ManageBooking.tsx",
                                lineNumber: 274,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: ()=>act("cancel"),
                                disabled: busy,
                                className: "inline-flex min-h-11 items-center gap-2 rounded-xl border border-emergency/40 px-5 font-semibold text-emergency hover:bg-emergency/5 disabled:opacity-50",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$x$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__XCircle$3e$__["XCircle"], {
                                        className: "size-4",
                                        "aria-hidden": "true"
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/src/components/booking/ManageBooking.tsx",
                                        lineNumber: 291,
                                        columnNumber: 15
                                    }, this),
                                    "Cancel booking"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/frontend/src/components/booking/ManageBooking.tsx",
                                lineNumber: 285,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/frontend/src/components/booking/ManageBooking.tsx",
                        lineNumber: 273,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/frontend/src/components/booking/ManageBooking.tsx",
                lineNumber: 234,
                columnNumber: 7
            }, this),
            pkg && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "rounded-2xl border border-border bg-white p-8",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "font-display text-lg font-bold text-brand-950",
                        children: pkg.name
                    }, void 0, false, {
                        fileName: "[project]/frontend/src/components/booking/ManageBooking.tsx",
                        lineNumber: 301,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mt-2 text-ink-600",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "font-semibold text-brand-800",
                                children: sessionsLeft
                            }, void 0, false, {
                                fileName: "[project]/frontend/src/components/booking/ManageBooking.tsx",
                                lineNumber: 303,
                                columnNumber: 13
                            }, this),
                            " of",
                            " ",
                            pkg.sessionsTotal,
                            " sessions remaining"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/frontend/src/components/booking/ManageBooking.tsx",
                        lineNumber: 302,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mt-1 text-sm text-ink-500",
                        children: [
                            "Valid until ",
                            new Date(pkg.expiresAt).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric"
                            })
                        ]
                    }, void 0, true, {
                        fileName: "[project]/frontend/src/components/booking/ManageBooking.tsx",
                        lineNumber: 306,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-4 h-2 overflow-hidden rounded-full bg-ink-100",
                        role: "progressbar",
                        "aria-valuenow": pkg.sessionsUsed,
                        "aria-valuemin": 0,
                        "aria-valuemax": pkg.sessionsTotal,
                        "aria-label": "Sessions used",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "h-full rounded-full bg-brand-600",
                            style: {
                                width: `${pkg.sessionsUsed / pkg.sessionsTotal * 100}%`
                            }
                        }, void 0, false, {
                            fileName: "[project]/frontend/src/components/booking/ManageBooking.tsx",
                            lineNumber: 318,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/frontend/src/components/booking/ManageBooking.tsx",
                        lineNumber: 310,
                        columnNumber: 11
                    }, this),
                    sessionsLeft > 0 && pkg.status === "ACTIVE" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: ()=>{
                            setMode(mode === "next-session" ? "idle" : "next-session");
                            setSlot(null);
                        },
                        className: "mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-accent-500 px-5 font-semibold text-white hover:bg-accent-600",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2d$plus$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CalendarPlus$3e$__["CalendarPlus"], {
                                className: "size-4",
                                "aria-hidden": "true"
                            }, void 0, false, {
                                fileName: "[project]/frontend/src/components/booking/ManageBooking.tsx",
                                lineNumber: 333,
                                columnNumber: 15
                            }, this),
                            "Book your next session"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/frontend/src/components/booking/ManageBooking.tsx",
                        lineNumber: 325,
                        columnNumber: 13
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/frontend/src/components/booking/ManageBooking.tsx",
                lineNumber: 300,
                columnNumber: 9
            }, this),
            mode !== "idle" && d.doctorId && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "rounded-2xl border border-border bg-white p-8",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "font-display text-lg font-bold text-brand-950",
                        children: mode === "reschedule" ? "Choose a new time" : "Choose a time for your next session"
                    }, void 0, false, {
                        fileName: "[project]/frontend/src/components/booking/ManageBooking.tsx",
                        lineNumber: 343,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-5",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$components$2f$booking$2f$SlotPicker$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SlotPicker"], {
                            doctorId: d.doctorId,
                            serviceType: mode === "next-session" ? "HOME_PHYSIO" : d.serviceType ?? "OP",
                            value: slot,
                            onChange: setSlot
                        }, void 0, false, {
                            fileName: "[project]/frontend/src/components/booking/ManageBooking.tsx",
                            lineNumber: 347,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/frontend/src/components/booking/ManageBooking.tsx",
                        lineNumber: 346,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: ()=>act(mode === "reschedule" ? "reschedule" : "schedule-session"),
                        disabled: busy || !slot,
                        className: "mt-6 inline-flex min-h-12 items-center gap-2 rounded-xl bg-accent-500 px-6 font-semibold text-white hover:bg-accent-600 disabled:opacity-50",
                        children: [
                            busy && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                                className: "size-4 animate-spin",
                                "aria-hidden": "true"
                            }, void 0, false, {
                                fileName: "[project]/frontend/src/components/booking/ManageBooking.tsx",
                                lineNumber: 360,
                                columnNumber: 22
                            }, this),
                            "Confirm",
                            slot ? ` ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$backend$2f$src$2f$time$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatDateLabel"])(slot.date)}, ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$backend$2f$src$2f$time$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatTimeLabel"])(slot.startTime)}` : ""
                        ]
                    }, void 0, true, {
                        fileName: "[project]/frontend/src/components/booking/ManageBooking.tsx",
                        lineNumber: 354,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/frontend/src/components/booking/ManageBooking.tsx",
                lineNumber: 342,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-sm text-ink-500",
                children: [
                    "Need help? Call our booking desk on",
                    " ",
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                        href: `tel:${__TURBOPACK__imported__module__$5b$project$5d2f$backend$2f$src$2f$site$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["site"].phone.booking}`,
                        className: "font-medium text-brand-700 hover:underline",
                        children: __TURBOPACK__imported__module__$5b$project$5d2f$backend$2f$src$2f$site$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["site"].phone.booking
                    }, void 0, false, {
                        fileName: "[project]/frontend/src/components/booking/ManageBooking.tsx",
                        lineNumber: 368,
                        columnNumber: 9
                    }, this),
                    " ",
                    "or ",
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        href: "/contact",
                        className: "font-medium text-brand-700 hover:underline",
                        children: "contact us"
                    }, void 0, false, {
                        fileName: "[project]/frontend/src/components/booking/ManageBooking.tsx",
                        lineNumber: 371,
                        columnNumber: 12
                    }, this),
                    "."
                ]
            }, void 0, true, {
                fileName: "[project]/frontend/src/components/booking/ManageBooking.tsx",
                lineNumber: 366,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/frontend/src/components/booking/ManageBooking.tsx",
        lineNumber: 220,
        columnNumber: 5
    }, this);
}
_s(ManageBooking, "yPLLL4pxhemjhClAG7ObJmCeV9A=");
_c = ManageBooking;
var _c;
__turbopack_context__.k.register(_c, "ManageBooking");
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
"[project]/node_modules/@date-fns/tz/date/index.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "TZDate",
    ()=>TZDate
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$date$2d$fns$2f$tz$2f$tzName$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@date-fns/tz/tzName/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$date$2d$fns$2f$tz$2f$date$2f$mini$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@date-fns/tz/date/mini.js [app-client] (ecmascript)");
;
;
class TZDate extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$date$2d$fns$2f$tz$2f$date$2f$mini$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TZDateMini"] {
    //#region static
    static tz(tz, ...args) {
        return args.length ? new TZDate(...args, tz) : new TZDate(Date.now(), tz);
    }
    //#endregion
    //#region representation
    toISOString() {
        const [sign, hours, minutes] = this.tzComponents();
        const tz = `${sign}${hours}:${minutes}`;
        return this.internal.toISOString().slice(0, -1) + tz;
    }
    toString() {
        // "Tue Aug 13 2024 07:50:19 GMT+0800 (Singapore Standard Time)";
        return `${this.toDateString()} ${this.toTimeString()}`;
    }
    toDateString() {
        // toUTCString returns RFC 7231 ("Mon, 12 Aug 2024 23:36:08 GMT")
        const [day, date, month, year] = this.internal.toUTCString().split(" ");
        // "Tue Aug 13 2024"
        return `${day?.slice(0, -1)} ${month} ${date} ${year}`;
    }
    toTimeString() {
        // toUTCString returns RFC 7231 ("Mon, 12 Aug 2024 23:36:08 GMT")
        const time = this.internal.toUTCString().split(" ")[4];
        const [sign, hours, minutes] = this.tzComponents();
        // "07:42:23 GMT+0800 (Singapore Standard Time)"
        return `${time} GMT${sign}${hours}${minutes} (${(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$date$2d$fns$2f$tz$2f$tzName$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["tzName"])(this.timeZone, this)})`;
    }
    toLocaleString(locales, options) {
        return Date.prototype.toLocaleString.call(this, locales, {
            ...options,
            timeZone: options?.timeZone || this.timeZone
        });
    }
    toLocaleDateString(locales, options) {
        return Date.prototype.toLocaleDateString.call(this, locales, {
            ...options,
            timeZone: options?.timeZone || this.timeZone
        });
    }
    toLocaleTimeString(locales, options) {
        return Date.prototype.toLocaleTimeString.call(this, locales, {
            ...options,
            timeZone: options?.timeZone || this.timeZone
        });
    }
    //#endregion
    //#region private
    tzComponents() {
        const offset = this.getTimezoneOffset();
        const sign = offset > 0 ? "-" : "+";
        const hours = String(Math.floor(Math.abs(offset) / 60)).padStart(2, "0");
        const minutes = String(Math.abs(offset) % 60).padStart(2, "0");
        return [
            sign,
            hours,
            minutes
        ];
    }
    //#endregion
    withTimeZone(timeZone) {
        return new TZDate(+this, timeZone);
    }
    //#region date-fns integration
    [Symbol.for("constructDateFrom")](date) {
        return new TZDate(+new Date(date), this.timeZone);
    }
}
}),
"[project]/node_modules/@date-fns/tz/date/mini.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "TZDateMini",
    ()=>TZDateMini
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$date$2d$fns$2f$tz$2f$tzOffset$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@date-fns/tz/tzOffset/index.js [app-client] (ecmascript)");
;
class TZDateMini extends Date {
    //#region static
    constructor(...args){
        super();
        // Time zone string is always the last string argument unless date string
        // is passed (as a single argument).
        if (args.length > 1 && typeof args[args.length - 1] === "string") {
            this.timeZone = args.pop();
        }
        this.internal = new Date();
        // Validate the time zone by checking its offset.
        if (isNaN((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$date$2d$fns$2f$tz$2f$tzOffset$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["tzOffset"])(this.timeZone, this))) {
            this.setTime(NaN);
        } else {
            if (!args.length) {
                // No arguments passed: use current time
                this.setTime(Date.now());
            } else if (typeof args[0] === "number" && (args.length === 1 || args.length === 2 && typeof args[1] !== "number")) {
                // Timestamp passed: use it as is
                this.setTime(args[0]);
            } else if (typeof args[0] === "string") {
                // `Date` string passed: parse it as external date
                this.setTime(+new Date(args[0]));
            } else if (args[0] instanceof Date) {
                // `Date` passed: use its timestamp
                this.setTime(+args[0]);
            } else {
                // `Date` values passed:
                // Set it as external date.
                this.setTime(+new Date(...args));
                // Adjust internal and external dates considering that we might have
                // landed on the DST hour.
                adjustToSystemTZ(this, args);
            }
        }
    }
    static tz(tz, ...args) {
        return args.length ? new TZDateMini(...args, tz) : new TZDateMini(Date.now(), tz);
    }
    //#endregion
    //#region time zone
    withTimeZone(timeZone) {
        return new TZDateMini(+this, timeZone);
    }
    getTimezoneOffset() {
        const offset = -(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$date$2d$fns$2f$tz$2f$tzOffset$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["tzOffset"])(this.timeZone, this);
        // Remove the seconds offset using `Math.floor` for negative UTC time zones
        // and `Math.ceil` for positive UTC time zones.
        return offset > 0 ? Math.floor(offset) : Math.ceil(offset);
    }
    //#endregion
    //#region time
    setTime(_time) {
        // Use the native `setTime` to the external date time.
        Date.prototype.setTime.apply(this, arguments);
        // Then apply it to the internal date adjusting to the timezone offset.
        syncToInternal(this);
        return +this;
    }
    //#endregion
    //#region date-fns integration
    [Symbol.for("constructDateFrom")](date) {
        return new TZDateMini(+new Date(date), this.timeZone);
    }
}
// Assign getters and setters
const re = /^(get|set)(?!UTC)/;
Object.getOwnPropertyNames(Date.prototype).forEach((method)=>{
    if (!re.test(method)) return;
    const utcMethod = method.replace(re, "$1UTC");
    // Filter out methods without UTC counterparts
    if (!TZDateMini.prototype[utcMethod]) return;
    if (method.startsWith("get")) {
        // Delegate to internal date's UTC method
        TZDateMini.prototype[method] = function() {
            return this.internal[utcMethod]();
        };
    } else {
        // Assign regular setter
        TZDateMini.prototype[method] = function() {
            Date.prototype[utcMethod].apply(this.internal, arguments);
            syncFromInternal(this);
            return +this;
        };
        // Assign UTC setter
        TZDateMini.prototype[utcMethod] = function() {
            Date.prototype[utcMethod].apply(this, arguments);
            syncToInternal(this);
            return +this;
        };
    }
});
/**
 * @internal
 * Function syncs time to internal date, applying the current time zone offset.
 *
 * @param {Date} date - `Date` to sync
 */ function syncToInternal(date) {
    // Start internal from the same real timestamp as external.
    date.internal.setTime(+date);
    // Shift internal by the target offset so its UTC fields become the target-zone
    // wall-clock fields for the external timestamp.
    //
    //   o internal UTC fields: 2024-02-11 00:00
    //   |
    //   | + Asia/Singapore offset (+08:00)
    //   v
    //   x internal UTC fields: 2024-02-11 08:00
    //
    date.internal.setUTCSeconds(date.internal.getUTCSeconds() - // Round after converting minutes to seconds to avoid fractional offset
    // precision errors from historical offsets.
    Math.round(-(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$date$2d$fns$2f$tz$2f$tzOffset$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["tzOffset"])(date.timeZone, date) * 60));
}
/**
 * @internal
 * Function syncs internal wall-clock fields into the external date.
 *
 * @param {Date} date - The date to sync
 */ function syncFromInternal(date) {
    // Copy target-zone wall-clock fields from internal into external using native
    // local setters. At this point external holds the right field values but they
    // are interpreted in the system time zone; `adjustToSystemTZ` fixes that.
    Date.prototype.setFullYear.call(date, date.internal.getUTCFullYear(), date.internal.getUTCMonth(), date.internal.getUTCDate());
    Date.prototype.setHours.call(date, date.internal.getUTCHours(), date.internal.getUTCMinutes(), date.internal.getUTCSeconds(), date.internal.getUTCMilliseconds());
    // Now we have to adjust the date to the system time zone
    adjustToSystemTZ(date);
}
/**
 * @internal
 * Function adjusts the date to the system time zone. It uses the time zone
 * differences to calculate the offset and adjust the date.
 *
 * We use it when constructing `TZDate` and syncing the external date from
 * the internal one.
 *
 * @param {TZDate} date - `TZDate` to adjust.
 */ function adjustToSystemTZ(date, constructorArgs) {
    // Keep the intended target-zone wall-clock value before native Date/system
    // time zone normalization can move it. Later corrections compare against this
    // value to distinguish intended DST normalization from accidental drift.
    const expectedInternalTime = Array.isArray(constructorArgs) ? constructorArgsToInternalTime(constructorArgs) : +date.internal;
    //#region Initial offset calculation
    // Current target time zone offset at the native timestamp. It may include
    // historical offset seconds, which we preserve for the seconds adjustment.
    const offsetWithSeconds = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$date$2d$fns$2f$tz$2f$tzOffset$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["tzOffset"])(date.timeZone, date);
    // Minute-precision target offset used by minute-based timestamp adjustments.
    // Historical offsets can contain seconds, so we strip the fractional minute
    // here and handle remaining seconds in the seconds adjustment below.
    const offset = offsetWithSeconds > 0 ? Math.floor(offsetWithSeconds) : Math.ceil(offsetWithSeconds);
    //#endregion
    //#region System DST adjustment
    // Native `Date` may normalize the requested wall time when the system time
    // zone skips that hour for DST.
    //
    // We compare the system wall-clock hour represented by the external date with
    // the wall-clock hour stored in the internal date. If they differ, the next
    // offset-diff calculation may need the previous system offset, because the
    // current external timestamp is already after the system DST jump.
    // Previous-hour reference used to detect whether the system offset changed
    // immediately before the current native timestamp.
    const prevHour = new Date(+date);
    // Use UTC math so subtracting one hour cannot be normalized back into the
    // same missing local DST hour.
    prevHour.setUTCHours(prevHour.getUTCHours() - 1);
    // Current system offset at the native timestamp.
    const systemOffset = -new Date(+date).getTimezoneOffset();
    // System offset one real hour before the native timestamp.
    const prevHourSystemOffset = -new Date(+prevHour).getTimezoneOffset();
    // Non-zero when the system offset changed between `prevHour` and `date`.
    const systemDSTChange = systemOffset - prevHourSystemOffset;
    // System offset to use in the later system-target offset difference.
    // Defaults to the current system offset and switches to the previous offset
    // only when native `Date` normalized a missing system wall time.
    let systemOffsetForDiff = systemOffset;
    if (systemDSTChange && systemOffset !== offset) {
        // System wall-clock hour represented by the current external timestamp.
        const systemHour = Date.prototype.getHours.apply(date);
        // Target wall-clock hour currently stored in internal fields. Constructors
        // get it from arguments because internal may have already been synced from
        // the normalized external timestamp; setters get it directly from internal.
        const expectedHour = Array.isArray(constructorArgs) ? constructorArgs[3] || 0 : date.internal.getUTCHours();
        if (systemHour !== expectedHour) {
            // Check whether using the current system offset would keep the target
            // offset unchanged. If so, the only DST jump we crossed is the system
            // one, so the diff should use the pre-DST system offset.
            const testDate = new Date(+date);
            // Difference that the later offset-diff step would apply with the
            // current system offset.
            const testOffsetDiff = systemOffset - offset;
            if (testOffsetDiff) testDate.setUTCMinutes(testDate.getUTCMinutes() + testOffsetDiff);
            // Target offset after applying the current system offset difference.
            const testOffsetWithSeconds = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$date$2d$fns$2f$tz$2f$tzOffset$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["tzOffset"])(date.timeZone, testDate);
            // Target offset without historical seconds, matching `offset`.
            const testOffset = testOffsetWithSeconds > 0 ? Math.floor(testOffsetWithSeconds) : Math.ceil(testOffsetWithSeconds);
            if (testOffset === offset) systemOffsetForDiff = prevHourSystemOffset;
        }
    }
    //#endregion
    //#region System diff adjustment
    // Move external from the system-zone interpretation of internal fields toward
    // the timestamp that represents those fields in the target time zone.
    //
    // At this point native `Date` has treated the internal wall-clock fields as if
    // they belonged to the system zone. The system-target offset difference moves
    // external by the distance between that system interpretation and the target
    // interpretation.
    // Difference between the system offset selected above and the minute-precision
    // target offset. Positive values move external forward; negative values move
    // it backward.
    const offsetDiff = systemOffsetForDiff - offset;
    if (offsetDiff) // Apply the system-target minute difference to external. Internal is
    // rebuilt from the final external timestamp after all adjustments are
    // complete.
    //
    //   o  external as target: 2023-01-31 23:00
    //   |
    //   |  add `offsetDiff`
    //   v
    //   x  external as target: 2023-02-01 12:00
    //
    Date.prototype.setUTCMinutes.call(date, Date.prototype.getUTCMinutes.call(date) + offsetDiff);
    //#endregion
    //#region Seconds system diff adjustment
    // Historical time zone offsets can include seconds, but the minute-based
    // offset adjustment above intentionally used minute precision.
    //
    // This adjustment applies the remaining seconds difference to external. For
    // example, historical Singapore used UTC+06:55:25, while ISO formatting shows
    // only `+06:55`; without the seconds correction, setter paths keep the wrong
    // wall-clock seconds.
    // Clone external as a native `Date` so we can inspect how the system time zone
    // represents the same timestamp.
    const systemDate = new Date(+date);
    // Zero UTC seconds before reading system seconds. Any remaining local seconds
    // then come from the system time zone offset rather than from the timestamp's
    // own seconds value.
    systemDate.setUTCSeconds(0);
    // Seconds part contributed by the system time zone offset. Negative offsets
    // need wrapping because `Date#getSeconds()` returns values in the 0..59 range.
    const systemSecondsOffset = systemOffset > 0 ? systemDate.getSeconds() : (systemDate.getSeconds() - 60) % 60;
    // Seconds part contributed by the target time zone offset.
    const secondsOffset = Math.round(-((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$date$2d$fns$2f$tz$2f$tzOffset$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["tzOffset"])(date.timeZone, date) * 60)) % 60;
    if (secondsOffset || systemSecondsOffset) // Apply the remaining second-level system-target difference to external.
    //
    //   o  external as Asia/Singapore: 1900-01-01 00:00:56
    //   |
    //   |  + `secondsOffset`
    //   |  + `systemSecondsOffset`
    //   v
    //   x  external as Asia/Singapore: 1900-01-01 00:00:31
    //
    Date.prototype.setUTCSeconds.call(date, Date.prototype.getUTCSeconds.call(date) + secondsOffset + systemSecondsOffset);
    //#endregion
    //#region Post-adjustment DST fix
    // The first system-target offset move can cross a target-zone DST boundary.
    //
    // When that happens, the target offset at the new external timestamp differs
    // from the target offset used for `offsetDiff`. We compare the original move
    // with the move that would be calculated at the new timestamp, then apply the
    // difference to external.
    // Target offset at the current external timestamp, including historical
    // seconds for the later seconds adjustment.
    const postOffsetWithSeconds = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$date$2d$fns$2f$tz$2f$tzOffset$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["tzOffset"])(date.timeZone, date);
    // Minute-precision target offset at the current external timestamp.
    const postOffset = postOffsetWithSeconds > 0 ? Math.floor(postOffsetWithSeconds) : Math.ceil(postOffsetWithSeconds);
    // System offset at the current external timestamp.
    const postSystemOffset = -new Date(+date).getTimezoneOffset();
    // System-target offset difference at the current external timestamp.
    const postOffsetDiff = postSystemOffset - postOffset;
    // Whether the target offset changed after the first offset move.
    const offsetChanged = postOffset !== offset;
    // Difference between the current offset move and the move already applied.
    const postDiff = postOffsetDiff - offsetDiff;
    // If the first offset move already normalized a target DST gap forward, the
    // generic post-DST correction below would undo that valid normalization. This
    // happens, for example, with America/New_York 02:00 during spring-forward when
    // the system zone also changes offset around the same instant.
    const targetDSTShift = postOffset - offset;
    // Candidate timestamp that would represent the requested wall-clock time with
    // the post-transition target offset. If it still does not round-trip to the
    // requested wall-clock fields, the requested time is inside a target DST gap.
    const postOffsetCandidate = expectedInternalTime - postOffset * 60 * 1000;
    // Only positive target offset shifts are spring-forward gaps. Negative shifts
    // are fall-back overlaps and still need the regular post-adjustment path.
    const normalizedTargetDSTGap = targetDSTShift > 0 && targetInternalTime(date) - expectedInternalTime === targetDSTShift * 60 * 1000 && targetInternalTime(date, postOffsetCandidate) !== expectedInternalTime;
    if (offsetChanged && postDiff && !normalizedTargetDSTGap) {
        // Apply the target-DST correction to external. In the backward-crossing case
        // shown here, this lands on an intermediate value that needs `offsetChange`
        // below.
        //
        //   o  external as America/New_York: 2023-03-12 03:00 EDT
        //   |
        //   |  + `postDiff`
        //   v
        //   x  external as America/New_York: 2023-03-12 01:00 EST
        //
        Date.prototype.setUTCMinutes.call(date, Date.prototype.getUTCMinutes.call(date) + postDiff);
        // Target offset after applying `postDiff`. It may change again if the
        // correction itself crosses a target-zone DST boundary.
        const newOffsetWithSeconds = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$date$2d$fns$2f$tz$2f$tzOffset$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["tzOffset"])(date.timeZone, date);
        // Minute-precision target offset after applying `postDiff`.
        const newOffset = newOffsetWithSeconds > 0 ? Math.floor(newOffsetWithSeconds) : Math.ceil(newOffsetWithSeconds);
        // Offset change caused by the `postDiff` move itself.
        const offsetChange = postOffset - newOffset;
        // If the correction moved external backward across the target DST boundary,
        // apply the boundary change so external lands on the valid target-zone
        // timestamp. Forward crossings are already normalized by native Date, and
        // applying this correction there would undo the valid post-DST result.
        if (offsetChange && postDiff < 0) {
            // Apply the second target-DST correction to external.
            //
            //   o  external as America/New_York: 2023-03-12 01:00 EST
            //   |
            //   |  + `offsetChange`
            //   v
            //   x  external as America/New_York: 2023-03-12 03:00 EDT
            //
            Date.prototype.setUTCMinutes.call(date, Date.prototype.getUTCMinutes.call(date) + offsetChange);
        }
    }
    //#endregion
    // Rebuild internal wall-clock fields from the final external timestamp.
    syncToInternal(date);
    // Native Date can normalize historical system offsets with minute and second
    // precision before we adjust to the target time zone. Correct only small
    // historical drift so DST gap normalization (usually one hour) remains intact.
    const expectedTime = constructorArgs ? expectedInternalTime : expectedInternalTime + secondsOffset * 1000;
    const drift = expectedTime - +date.internal;
    if (drift && Math.abs(drift) < 30 * 60 * 1000) {
        Date.prototype.setTime.call(date, +date + drift);
        syncToInternal(date);
    }
}
function constructorArgsToInternalTime(args) {
    // Mirror Date's date-value constructor defaults while preserving explicit
    // `undefined` behavior. Missing month/day default, but passed `undefined`
    // should remain invalid just like `Date.UTC(year, undefined, ...)`.
    return Date.UTC(args[0], args.length > 1 ? args[1] : 0, args.length > 2 ? args[2] : 1, ...args.slice(3));
}
function targetInternalTime(date, time) {
    // Compute the target-zone wall-clock representation for a timestamp without
    // mutating the TZDate. This mirrors syncToInternal for temporary checks.
    const internal = new Date(time ?? +date);
    internal.setUTCSeconds(internal.getUTCSeconds() - Math.round(-(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$date$2d$fns$2f$tz$2f$tzOffset$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["tzOffset"])(date.timeZone, internal) * 60));
    return +internal;
}
}),
"[project]/node_modules/@date-fns/tz/index.js [app-client] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$date$2d$fns$2f$tz$2f$date$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@date-fns/tz/date/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$date$2d$fns$2f$tz$2f$date$2f$mini$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@date-fns/tz/date/mini.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$date$2d$fns$2f$tz$2f$tz$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@date-fns/tz/tz/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$date$2d$fns$2f$tz$2f$tzScan$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@date-fns/tz/tzScan/index.js [app-client] (ecmascript)");
;
;
;
;
;
;
;
}),
"[project]/node_modules/@date-fns/tz/tz/index.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "tz",
    ()=>tz
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$date$2d$fns$2f$tz$2f$date$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@date-fns/tz/date/index.js [app-client] (ecmascript)");
;
const tz = (timeZone)=>(value)=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$date$2d$fns$2f$tz$2f$date$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TZDate"].tz(timeZone, +new Date(value));
}),
"[project]/node_modules/@date-fns/tz/tzName/index.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Time zone name format.
 */ /**
 * The function returns the time zone name for the given date in the specified
 * time zone.
 *
 * It uses the `Intl.DateTimeFormat` API and by default outputs the time zone
 * name in a long format, e.g. "Pacific Standard Time" or
 * "Singapore Standard Time".
 *
 * It is possible to specify the format as the third argument using one of the following options
 *
 * - "short": e.g. "EDT" or "GMT+8".
 * - "long": e.g. "Eastern Daylight Time".
 * - "shortGeneric": e.g. "ET" or "Singapore Time".
 * - "longGeneric": e.g. "Eastern Time" or "Singapore Standard Time".
 *
 * These options correspond to TR35 tokens `z..zzz`, `zzzz`, `v`, and `vvvv` respectively: https://www.unicode.org/reports/tr35/tr35-dates.html#dfst-zone
 *
 * @param timeZone - Time zone name (IANA or UTC offset)
 * @param date - Date object to get the time zone name for
 * @param format - Optional format of the time zone name. Defaults to "long". Can be "short", "long", "shortGeneric", or "longGeneric".
 *
 * @returns Time zone name (e.g. "Singapore Standard Time")
 */ __turbopack_context__.s([
    "tzName",
    ()=>tzName
]);
function tzName(timeZone, date, format = "long") {
    return new Intl.DateTimeFormat("en-US", {
        // Enforces engine to render the time. Without the option JavaScriptCore omits it.
        hour: "numeric",
        timeZone: timeZone,
        timeZoneName: format
    }).format(date).split(/\s/g) // Format.JS uses non-breaking spaces
    .slice(2) // Skip the hour and AM/PM parts
    .join(" ");
}
}),
"[project]/node_modules/@date-fns/tz/tzOffset/index.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "tzOffset",
    ()=>tzOffset
]);
const offsetFormatCache = {};
const offsetCache = {};
function tzOffset(timeZone, date) {
    try {
        // Create `Intl.DateTimeFormat` with `"longOffset"` that gives us consistent
        // date strings like `"5/19/2026, GMT-08:00"`.
        const format = offsetFormatCache[timeZone] ||= new Intl.DateTimeFormat("en-US", {
            timeZone,
            timeZoneName: "longOffset"
        }).format;
        // Get `"-08:00"`.
        const offsetStr = format(date).split("GMT")[1];
        // Avoid parsing the same offset string.
        if (offsetStr in offsetCache) return offsetCache[offsetStr];
        // Calculate offset from `["-08", "00"]` and cache it.
        return calcOffset(offsetStr, offsetStr.split(":"));
    } catch  {
        // Fallback to manual parsing if the runtime doesn't support
        // `±HH:MM/±HHMM/±HH`. See: https://github.com/nodejs/node/issues/53419.
        if (timeZone in offsetCache) return offsetCache[timeZone];
        const captures = timeZone?.match(offsetRe);
        if (captures) return calcOffset(timeZone, captures.slice(1));
        return NaN;
    }
}
const offsetRe = /([+-]\d\d):?(\d\d)?/;
function calcOffset(cacheStr, values) {
    const hours = +(values[0] || 0);
    const minutes = +(values[1] || 0);
    // Convert seconds to minutes by dividing by 60 to keep the function return in minutes.
    const seconds = +(values[2] || 0) / 60;
    return offsetCache[cacheStr] = hours * 60 + minutes > 0 ? hours * 60 + minutes + seconds : hours * 60 - minutes - seconds;
}
}),
"[project]/node_modules/@date-fns/tz/tzScan/index.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "tzScan",
    ()=>tzScan
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$date$2d$fns$2f$tz$2f$tzOffset$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@date-fns/tz/tzOffset/index.js [app-client] (ecmascript)");
;
function tzScan(timeZone, interval) {
    const changes = [];
    const monthDate = new Date(interval.start);
    monthDate.setUTCSeconds(0, 0);
    const endDate = new Date(interval.end);
    endDate.setUTCSeconds(0, 0);
    const endMonthTime = +endDate;
    let lastOffset = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$date$2d$fns$2f$tz$2f$tzOffset$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["tzOffset"])(timeZone, monthDate);
    while(+monthDate < endMonthTime){
        // Month forward
        monthDate.setUTCMonth(monthDate.getUTCMonth() + 1);
        // Find the month where the offset changes
        const offset = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$date$2d$fns$2f$tz$2f$tzOffset$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["tzOffset"])(timeZone, monthDate);
        if (offset != lastOffset) {
            // Rewind a month back to find the day where the offset changes
            const dayDate = new Date(monthDate);
            dayDate.setUTCMonth(dayDate.getUTCMonth() - 1);
            const endDayTime = +monthDate;
            lastOffset = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$date$2d$fns$2f$tz$2f$tzOffset$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["tzOffset"])(timeZone, dayDate);
            while(+dayDate < endDayTime){
                // Day forward
                dayDate.setUTCDate(dayDate.getUTCDate() + 1);
                // Find the day where the offset changes
                const offset = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$date$2d$fns$2f$tz$2f$tzOffset$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["tzOffset"])(timeZone, dayDate);
                if (offset != lastOffset) {
                    // Rewind a day back to find the time where the offset changes
                    const hourDate = new Date(dayDate);
                    hourDate.setUTCDate(hourDate.getUTCDate() - 1);
                    const endHourTime = +dayDate;
                    lastOffset = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$date$2d$fns$2f$tz$2f$tzOffset$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["tzOffset"])(timeZone, hourDate);
                    while(+hourDate < endHourTime){
                        // Hour forward
                        hourDate.setUTCHours(hourDate.getUTCHours() + 1);
                        // Find the hour where the offset changes
                        const hourOffset = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$date$2d$fns$2f$tz$2f$tzOffset$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["tzOffset"])(timeZone, hourDate);
                        if (hourOffset !== lastOffset) {
                            changes.push({
                                date: new Date(hourDate),
                                change: hourOffset - lastOffset,
                                offset: hourOffset
                            });
                        }
                        lastOffset = hourOffset;
                    }
                }
                lastOffset = offset;
            }
        }
        lastOffset = offset;
    }
    return changes;
}
}),
"[project]/node_modules/lucide-react/dist/esm/icons/calendar-days.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>CalendarDays
]);
/**
 * @license lucide-react v1.32.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/createLucideIcon.mjs [app-client] (ecmascript)");
;
const __iconNode = [
    [
        "path",
        {
            d: "M8 2v3",
            key: "1ioesn"
        }
    ],
    [
        "path",
        {
            d: "M16 2v3",
            key: "otl347"
        }
    ],
    [
        "rect",
        {
            x: "3",
            y: "3",
            width: "18",
            height: "18",
            rx: "2",
            key: "h1oib"
        }
    ],
    [
        "path",
        {
            d: "M3 9h18",
            key: "1pudct"
        }
    ],
    [
        "path",
        {
            d: "M8 13h.01",
            key: "1sbv64"
        }
    ],
    [
        "path",
        {
            d: "M12 13h.01",
            key: "y0uutt"
        }
    ],
    [
        "path",
        {
            d: "M16 13h.01",
            key: "wip0gl"
        }
    ],
    [
        "path",
        {
            d: "M8 17h.01",
            key: "p3bg7i"
        }
    ],
    [
        "path",
        {
            d: "M12 17h.01",
            key: "p32p05"
        }
    ],
    [
        "path",
        {
            d: "M16 17h.01",
            key: "ql8jdd"
        }
    ]
];
const CalendarDays = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])("calendar-days", __iconNode);
;
}),
"[project]/node_modules/lucide-react/dist/esm/icons/calendar-days.mjs [app-client] (ecmascript) <export default as CalendarDays>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CalendarDays",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2d$days$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2d$days$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/calendar-days.mjs [app-client] (ecmascript)");
}),
"[project]/node_modules/lucide-react/dist/esm/icons/calendar-plus.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>CalendarPlus
]);
/**
 * @license lucide-react v1.32.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/createLucideIcon.mjs [app-client] (ecmascript)");
;
const __iconNode = [
    [
        "path",
        {
            d: "M16 18h6",
            key: "987eiv"
        }
    ],
    [
        "path",
        {
            d: "M16 2v3",
            key: "otl347"
        }
    ],
    [
        "path",
        {
            d: "M19 15v6",
            key: "10aioa"
        }
    ],
    [
        "path",
        {
            d: "M21 11.5V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h8.3",
            key: "jgwkxf"
        }
    ],
    [
        "path",
        {
            d: "M3 9h18",
            key: "1pudct"
        }
    ],
    [
        "path",
        {
            d: "M8 2v3",
            key: "1ioesn"
        }
    ]
];
const CalendarPlus = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])("calendar-plus", __iconNode);
;
}),
"[project]/node_modules/lucide-react/dist/esm/icons/calendar-plus.mjs [app-client] (ecmascript) <export default as CalendarPlus>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CalendarPlus",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2d$plus$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2d$plus$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/calendar-plus.mjs [app-client] (ecmascript)");
}),
"[project]/node_modules/lucide-react/dist/esm/icons/calendar-x.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>CalendarX
]);
/**
 * @license lucide-react v1.32.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/createLucideIcon.mjs [app-client] (ecmascript)");
;
const __iconNode = [
    [
        "path",
        {
            d: "M8 2v3",
            key: "1ioesn"
        }
    ],
    [
        "path",
        {
            d: "M16 2v3",
            key: "otl347"
        }
    ],
    [
        "rect",
        {
            x: "3",
            y: "3",
            width: "18",
            height: "18",
            rx: "2",
            key: "h1oib"
        }
    ],
    [
        "path",
        {
            d: "M3 9h18",
            key: "1pudct"
        }
    ],
    [
        "path",
        {
            d: "m14 13-4 4",
            key: "1gib57"
        }
    ],
    [
        "path",
        {
            d: "m10 13 4 4",
            key: "153uiq"
        }
    ]
];
const CalendarX = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])("calendar-x", __iconNode);
;
}),
"[project]/node_modules/lucide-react/dist/esm/icons/calendar-x.mjs [app-client] (ecmascript) <export default as CalendarX>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CalendarX",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2d$x$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2d$x$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/calendar-x.mjs [app-client] (ecmascript)");
}),
"[project]/node_modules/lucide-react/dist/esm/icons/circle-alert.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>CircleAlert
]);
/**
 * @license lucide-react v1.32.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/createLucideIcon.mjs [app-client] (ecmascript)");
;
const __iconNode = [
    [
        "circle",
        {
            cx: "12",
            cy: "12",
            r: "10",
            key: "1mglay"
        }
    ],
    [
        "line",
        {
            x1: "12",
            x2: "12",
            y1: "8",
            y2: "12",
            key: "1pkeuh"
        }
    ],
    [
        "line",
        {
            x1: "12",
            x2: "12.01",
            y1: "16",
            y2: "16",
            key: "4dfq90"
        }
    ]
];
const CircleAlert = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])("circle-alert", __iconNode);
;
}),
"[project]/node_modules/lucide-react/dist/esm/icons/circle-alert.mjs [app-client] (ecmascript) <export default as AlertCircle>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AlertCircle",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-alert.mjs [app-client] (ecmascript)");
}),
"[project]/node_modules/lucide-react/dist/esm/icons/circle-check.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>CircleCheck
]);
/**
 * @license lucide-react v1.32.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/createLucideIcon.mjs [app-client] (ecmascript)");
;
const __iconNode = [
    [
        "circle",
        {
            cx: "12",
            cy: "12",
            r: "10",
            key: "1mglay"
        }
    ],
    [
        "path",
        {
            d: "m9 12 2 2 4-4",
            key: "dzmm74"
        }
    ]
];
const CircleCheck = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])("circle-check", __iconNode);
;
}),
"[project]/node_modules/lucide-react/dist/esm/icons/circle-check.mjs [app-client] (ecmascript) <export default as CheckCircle2>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CheckCircle2",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-check.mjs [app-client] (ecmascript)");
}),
"[project]/node_modules/lucide-react/dist/esm/icons/circle-x.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>CircleX
]);
/**
 * @license lucide-react v1.32.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/createLucideIcon.mjs [app-client] (ecmascript)");
;
const __iconNode = [
    [
        "circle",
        {
            cx: "12",
            cy: "12",
            r: "10",
            key: "1mglay"
        }
    ],
    [
        "path",
        {
            d: "m15 9-6 6",
            key: "1uzhvr"
        }
    ],
    [
        "path",
        {
            d: "m9 9 6 6",
            key: "z0biqf"
        }
    ]
];
const CircleX = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])("circle-x", __iconNode);
;
}),
"[project]/node_modules/lucide-react/dist/esm/icons/circle-x.mjs [app-client] (ecmascript) <export default as XCircle>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "XCircle",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$x$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$x$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-x.mjs [app-client] (ecmascript)");
}),
"[project]/node_modules/lucide-react/dist/esm/icons/loader-circle.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>LoaderCircle
]);
/**
 * @license lucide-react v1.32.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/createLucideIcon.mjs [app-client] (ecmascript)");
;
const __iconNode = [
    [
        "path",
        {
            d: "M21 12a9 9 0 1 1-6.219-8.56",
            key: "13zald"
        }
    ]
];
const LoaderCircle = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])("loader-circle", __iconNode);
;
}),
"[project]/node_modules/lucide-react/dist/esm/icons/loader-circle.mjs [app-client] (ecmascript) <export default as Loader2>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Loader2",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/loader-circle.mjs [app-client] (ecmascript)");
}),
"[project]/node_modules/lucide-react/dist/esm/icons/shield-check.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>ShieldCheck
]);
/**
 * @license lucide-react v1.32.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/createLucideIcon.mjs [app-client] (ecmascript)");
;
const __iconNode = [
    [
        "path",
        {
            d: "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",
            key: "oel41y"
        }
    ],
    [
        "path",
        {
            d: "m9 12 2 2 4-4",
            key: "dzmm74"
        }
    ]
];
const ShieldCheck = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])("shield-check", __iconNode);
;
}),
"[project]/node_modules/lucide-react/dist/esm/icons/shield-check.mjs [app-client] (ecmascript) <export default as ShieldCheck>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ShieldCheck",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2d$check$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2d$check$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/shield-check.mjs [app-client] (ecmascript)");
}),
]);

//# sourceMappingURL=_1_2vy4l._.js.map