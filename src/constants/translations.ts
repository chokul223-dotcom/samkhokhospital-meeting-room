import { Language, User, Room } from "../types"

export const translations = {
  th: {
    // Roles
    admin: "ผู้ดูแลระบบ",
    user: "บุคลากรทั่วไป",

    // Status
    pending: "รอการอนุมัติ",
    approved: "อนุมัติแล้ว",
    rejected: "ปฏิเสธ",
    cancelled: "ยกเลิก",
    available: "พร้อมใช้งาน",
    maintenance: "ซ่อมบำรุง",
    inUse: "กำลังใช้งาน",
    free: "ว่าง",

    // Navigation & KCMH layout
    homeNav: "หน้าหลัก",
    bookRoomsNav: "จองห้องประชุม",
    loginNav: "เข้าสู่ระบบ",
    dashboard: "Dashboard",
    calendar: "ปฏิทินการจอง",
    calendarTitle: "ปฏิทินการจอง ห้องประชุม",
    more: "เพิ่มเติม",
    morning: "เช้า",
    afternoon: "บ่าย",
    fullDay: "ทั้งวัน",
    lunchBreak: "พักเที่ยง",
    schedule: "กำหนดการ",
    availableStatus: "ว่าง",
    approvedStatus: "อนุมัติ",
    chairman: "ประธาน",
    time: "เวลา",
    homeBreadcrumb: "หน้าหลัก",
    roomBreadcrumb: "ห้องประชุม / รายการ",
    roomCatalogTitle: "รายการ ห้องประชุม",
    roomDetails: "รายละเอียด",
    roomAmenitiesTitle: "สิ่งอำนวยความสะดวกภายในห้อง",
    showEntries: "แสดง",
    entriesUnit: "รายการ",
    allRoomsLegend: "ทุกห้องประชุม",
    clickToFilter: "คลิกเพื่อกรองเฉพาะห้องนี้",
    close: "ปิดหน้าต่าง",
    timeRange: "เวลา {start} น. ถึง {end} น.",
    myBookings: "การจองของฉัน",
    allBookings: "การจองทั้งหมด",
    rooms: "ห้องประชุม",
    users: "จัดการผู้ใช้",
    settings: "การตั้งค่า",
    logout: "ออกจากระบบ",

    // App & Login
    appName: "โรงพยาบาลสามโคก",
    appDesc: "ระบบจองห้องประชุมออนไลน์",
    hospitalSub: "Samkhok Hospital Meeting Room System",
    phoneLabel: "โทรศัพท์",
    videoTour: "โรงพยาบาลสามโคก แนะนำสถานที่",
    loginTitle: "เข้าสู่ระบบจองห้องประชุม",
    loginSubTitle: "กรุณากรอกชื่อผู้ใช้และรหัสผ่านเพื่อเข้าใช้งาน",
    username: "ชื่อผู้ใช้งาน",
    usernamePlaceholder: "ระบุชื่อผู้ใช้งาน",
    password: "รหัสผ่าน",
    passwordPlaceholder: "ระบุรหัสผ่าน",
    forgotPassword: "ลืมรหัสผ่าน?",
    loginBtn: "เข้าสู่ระบบ",
    loggingIn: "กำลังเข้าสู่ระบบ...",
    contactAdmin: "กรุณาติดต่อผู้ดูแลระบบเพื่อรีเซ็ตรหัสผ่าน",
    invalidLogin: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง",

    // Dashboard & Stats
    welcomeBanner: "ยินดีต้อนรับสู่ระบบจองห้องประชุม",
    welcomeGreeting: "สวัสดี",
    welcomeDesc: "โรงพยาบาลสามโคกพร้อมให้บริการห้องประชุมสำหรับการประชุมและการอบรมวิชาการ",
    welcomeDescWithRooms: "โรงพยาบาลสามโคกพร้อมให้บริการห้องประชุม {count} ห้องสำหรับการประชุมและการอบรมวิชาการ",
    roomsReady: "ห้องพร้อมใช้งาน",
    todayBookings: "การจองวันนี้",
    pendingApprovals: "รอการอนุมัติ",
    totalBookings: "การจองทั้งหมด",
    todaySchedule: "ตารางการประชุมวันนี้",
    noMeetingToday: "ไม่มีรายการประชุมในวันนี้",
    roomStatus: "สถานะห้องประชุมแบบเรียลไทม์",
    capacity: "ความจุ",
    people: "คน",
    pax: "ที่นั่ง",
    timeSlot: "ช่วงเวลา",
    totalAllRooms: "ทั้งหมด {count} ห้อง",
    readyToUse: "อนุมัติพร้อมใช้งาน",
    actionRequired: "ต้องตรวจสอบ",
    awaitingApproval: "รอการตอบรับ",
    allTimeRecords: "ประวัติทั้งหมด",
    viewFullCalendar: "ดูปฏิทินเต็ม",
    liveStatus: "สด",
    staff: "บุคลากร",
    generalStaff: "บุคลากรทั่วไป",
    youBadge: "คุณ",
    totalUsersCount: "ทั้งหมด {count} คน",
    maintenanceNotice: "อยู่ระหว่างปิดซ่อมบำรุง",
    todayItems: "วันนี้ {count} รายการ",
    allRoomsDesc: "รายละเอียดห้องประชุม อุปกรณ์ และสถานะการใช้งาน",
    allUsersDesc: "จัดการข้อมูลบุคลากรและกำหนดสิทธิ์ผู้ใช้งาน",
    manageAllBookingsDesc: "จัดการและตรวจสอบการจองห้องประชุมทั้งหมด",
    myBookingsDesc: "ประวัติและสถานะคำขอจองห้องประชุมของคุณ",
    lightThemeDesc: "ธีมสีสว่างสะอาดตา",
    darkThemeDesc: "ธีมสีมืดถนอมสายตา",
    bookThisRoom: "จองห้องนี้",

    // Calendar
    selectDate: "เลือกวันที่",
    today: "วันนี้",
    noBookingAllDay: "ไม่มีการจอง — ห้องว่างตลอดวัน",
    scheduleTimeline: "ผังการใช้งานห้องประชุม",

    // Bookings
    statusFilter: "สถานะ",
    dateFilter: "วันที่",
    all: "ทั้งหมด",
    clearFilter: "ล้างตัวกรอง",
    noBookingsFound: "ไม่พบรายการจองตามเงื่อนไข",
    items: "รายการ",
    approve: "อนุมัติ",
    reject: "ปฏิเสธ",
    cancel: "ยกเลิกการจอง",
    confirmCancelBooking: "คุณต้องการยกเลิกคำขอจองนี้ใช่หรือไม่?",
    searchBookings: "ค้นหาการจอง (วัตถุประสงค์, ผู้จอง, ห้อง)...",
    bookingDetail: "รายละเอียดการจอง",
    createdBy: "ผู้ทำรายการ",
    createdAtLabel: "ยื่นคำขอเมื่อ",

    // Rooms Admin
    addRoom: "เพิ่มห้องประชุม",
    editRoom: "แก้ไขห้องประชุม",
    roomName: "ชื่อห้องประชุม",
    location: "สถานที่ / ชั้น",
    equipmentList: "อุปกรณ์ภายในห้อง (คั่นด้วยจุลภาค ,)",
    equipmentExample: "เช่น โปรเจคเตอร์, ไมโครโฟน, จอภาพ LED, ลำโพง",
    roomStatusLabel: "สถานะห้อง",
    save: "บันทึกข้อมูล",
    cancelBtn: "ยกเลิก",
    edit: "แก้ไข",
    delete: "ลบ",
    confirmDeleteRoom:
      "คุณต้องการลบห้องประชุมนี้ใช่หรือไม่? ข้อมูลการจองที่เกี่ยวข้องจะถูกลบด้วย",
    availableEquipment: "อุปกรณ์พร้อมใช้งาน",
    totalRooms: "จำนวนห้องทั้งหมด",

    // Users Admin
    userList: "รายชื่อบุคลากรผู้ใช้งาน",
    searchUsers: "ค้นหาผู้ใช้ (ชื่อ, แผนก, username)...",
    addUser: "เพิ่มผู้ใช้งาน",
    editUser: "แก้ไขข้อมูลผู้ใช้",
    fullName: "ชื่อ-นามสกุล",
    department: "แผนก / ฝ่าย",
    role: "ระดับสิทธิ์การใช้งาน",
    confirmDeleteUser: "คุณต้องการลบผู้ใช้งานนี้ใช่หรือไม่?",
    leaveBlankToKeep: "(เว้นว่างไว้หากไม่ต้องการเปลี่ยนรหัสผ่าน)",
    deleteAllBookings: "ล้างประวัติการจองทั้งหมด",
    confirmDeleteAllBookings:
      "คุณต้องการลบประวัติการจองทั้งหมดใช่หรือไม่? การดำเนินการนี้ไม่สามารถย้อนกลับได้",
    toastAllBookingsDeleted: "ล้างประวัติการจองทั้งหมดเรียบร้อยแล้ว",
    rejectReason: "เหตุผลการปฏิเสธ",
    rejectReasonPlaceholder: "ระบุเหตุผลที่ไม่อนุมัติ (ไม่บังคับ)...",
    confirmRejectTitle: "ยืนยันการปฏิเสธคำขอจอง",
    rejectBooking: "ยืนยันปฏิเสธ",
    rejectedReasonLabel: "เหตุผลที่ปฏิเสธ:",

    // Booking Form Modal
    bookRoom: "จองห้องประชุม",
    quickBook: "จองห้องนี้ทันที",
    room: "ห้องประชุม",
    equipmentInRoom: "อุปกรณ์ภายในห้องนี้",
    maxCapacity: "รองรับสูงสุด",
    selectDatePlaceholder: "เลือกวันที่",
    date: "วันที่ต้องการจอง",
    startTime: "เวลาเริ่มต้น",
    endTime: "เวลาสิ้นสุด",
    conflictWarning: "ช่วงเวลาดังกล่าวมีการจองซ้ำซ้อน กรุณาเลือกเวลาหรือห้องอื่น",
    attendees: "จำนวนผู้เข้าร่วม (คน)",
    purpose: "วัตถุประสงค์การใช้งาน",
    purposePlaceholder: "เช่น ประชุมกรรมการบริหาร, ประชุมวิชาการแพทย์...",
    submitBooking: "ยืนยันส่งคำขอจอง",
    submitting: "กำลังบันทึก...",

    // Errors / Validation
    errPurpose: "กรุณาระบุวัตถุประสงค์การประชุม",
    errTime: "เวลาสิ้นสุดต้องมากกว่าเวลาเริ่มต้น",
    errConflict: "ช่วงเวลาดังกล่าวมีการจองอยู่แล้ว",
    errCapacity: "จำนวนผู้เข้าร่วมเกินความจุที่ห้องรองรับ",
    errRoomName: "กรุณาระบุชื่อห้องประชุม",
    errLocation: "กรุณาระบุสถานที่/ชั้น",
    errCapacityZero: "ความจุต้องมากกว่า 0",
    errFullName: "กรุณาระบุชื่อ-นามสกุล",
    errUsername: "กรุณาระบุชื่อผู้ใช้งาน",
    errPasswordCreate: "กรุณากำหนดรหัสผ่านสำหรับผู้ใช้ใหม่",

    // Toasts
    toastBookingSuccess: "ส่งคำขอจองห้องประชุมเรียบร้อยแล้ว",
    toastApproveSuccess: "อนุมัติการจองเรียบร้อยแล้ว",
    toastRejectSuccess: "ปฏิเสธคำขอจองเรียบร้อยแล้ว",
    toastCancelSuccess: "ยกเลิกการจองเรียบร้อยแล้ว",
    toastRoomAdded: "เพิ่มห้องประชุมใหม่สำเร็จ",
    toastRoomEdited: "แก้ไขข้อมูลห้องประชุมสำเร็จ",
    toastRoomDeleted: "ลบห้องประชุมสำเร็จ",
    toastUserAdded: "เพิ่มผู้ใช้งานใหม่สำเร็จ",
    toastUserEdited: "แก้ไขข้อมูลผู้ใช้งานสำเร็จ",
    toastUserDeleted: "ลบผู้ใช้งานสำเร็จ",

    // Settings
    settingsTitle: "การตั้งค่าระบบ",
    systemPreferences: "การตั้งค่าหน้าจอและภาษา",
    language: "ภาษาของระบบ (Language)",
    theme: "ธีมการแสดงผล (Theme)",
    lightTheme: "โหมดสว่าง (Light Mode)",
    darkTheme: "โหมดมืด (Dark Mode)",
    systemTheme: "ตามการตั้งค่าระบบ (System)",
    hospitalInfo: "ข้อมูลระบบโรงพยาบาล",
    systemVersion: "เวอร์ชันระบบ",
    developerInfo: "ระบบบริหารจัดการห้องประชุม โรงพยาบาลสามโคก จังหวัดปทุมธานี",
  },
  en: {
    // Roles
    admin: "Administrator",
    user: "Staff Member",

    // Status
    pending: "Pending",
    approved: "Approved",
    rejected: "Rejected",
    cancelled: "Cancelled",
    available: "Available",
    maintenance: "Maintenance",
    inUse: "In Use",
    free: "Available",

    // Navigation & KCMH layout
    homeNav: "Home",
    bookRoomsNav: "Book Meeting Room",
    loginNav: "Sign In",
    dashboard: "Dashboard",
    calendar: "Calendar",
    calendarTitle: "Meeting Room Booking Calendar",
    more: "more",
    morning: "Morning",
    afternoon: "Afternoon",
    fullDay: "Full Day",
    lunchBreak: "Lunch Break",
    schedule: "Schedule",
    availableStatus: "Available",
    approvedStatus: "Approved",
    chairman: "Chairman",
    time: "Time",
    homeBreadcrumb: "Home",
    roomBreadcrumb: "Meeting Rooms / Catalog",
    roomCatalogTitle: "Meeting Rooms Directory",
    roomDetails: "Details",
    roomAmenitiesTitle: "Room Amenities & Equipment",
    showEntries: "Show",
    entriesUnit: "items",
    allRoomsLegend: "All Meeting Rooms",
    clickToFilter: "Click to filter this room",
    close: "Close",
    timeRange: "{start} to {end}",
    myBookings: "My Bookings",
    allBookings: "All Bookings",
    rooms: "Meeting Rooms",
    users: "User Management",
    settings: "Settings",
    logout: "Sign Out",

    // App & Login
    appName: "Samkhok Hospital",
    appDesc: "Meeting Room Booking System",
    hospitalSub: "Samkhok Hospital Meeting Room System",
    phoneLabel: "Tel",
    videoTour: "Samkhok Hospital Location Tour",
    loginTitle: "Sign in to Room Booking",
    loginSubTitle: "Enter your username and password to continue",
    username: "Username",
    usernamePlaceholder: "Enter your username",
    password: "Password",
    passwordPlaceholder: "Enter your password",
    forgotPassword: "Forgot Password?",
    loginBtn: "Sign In",
    loggingIn: "Signing in...",
    contactAdmin:
      "Please contact the system administrator to reset your password.",
    invalidLogin: "Invalid username or password",

    // Dashboard & Stats
    welcomeBanner: "Welcome to Meeting Room Booking",
    welcomeGreeting: "Hello",
    welcomeDesc: "Samkhok Hospital is ready to serve meeting rooms for conferences and academic training",
    welcomeDescWithRooms: "Samkhok Hospital has {count} meeting rooms ready for conferences and academic training",
    roomsReady: "Available Rooms",
    todayBookings: "Today's Meetings",
    pendingApprovals: "Pending Approvals",
    totalBookings: "Total Bookings",
    todaySchedule: "Today's Schedule",
    noMeetingToday: "No meetings scheduled for today",
    roomStatus: "Real-time Room Status",
    capacity: "Capacity",
    people: "pax",
    pax: "seats",
    timeSlot: "Time Slot",
    totalAllRooms: "{count} total rooms",
    readyToUse: "Approved & ready for use",
    actionRequired: "Needs Review",
    awaitingApproval: "Awaiting Response",
    allTimeRecords: "All History",
    viewFullCalendar: "View Full Calendar",
    liveStatus: "LIVE",
    staff: "Staff Member",
    generalStaff: "General Staff",
    youBadge: "You",
    totalUsersCount: "{count} people in total",
    maintenanceNotice: "Under scheduled maintenance",
    todayItems: "Today: {count} bookings",
    allRoomsDesc: "Meeting room details, equipment, and live availability",
    allUsersDesc: "Manage staff accounts and permission levels",
    manageAllBookingsDesc: "Manage and verify all hospital meeting room bookings",
    myBookingsDesc: "Your meeting room booking history and request statuses",
    lightThemeDesc: "Clean & bright light interface",
    darkThemeDesc: "Eye-friendly sleek dark interface",
    bookThisRoom: "Book This Room",

    // Calendar
    selectDate: "Select Date",
    today: "Today",
    noBookingAllDay: "No bookings — Free all day",
    scheduleTimeline: "Room Schedule Timeline",

    // Bookings
    statusFilter: "Status",
    dateFilter: "Date",
    all: "All",
    clearFilter: "Clear Filters",
    noBookingsFound: "No bookings found matching filters",
    items: "items",
    approve: "Approve",
    reject: "Reject",
    cancel: "Cancel Booking",
    confirmCancelBooking:
      "Are you sure you want to cancel this booking request?",
    searchBookings: "Search bookings (purpose, requester, room)...",
    bookingDetail: "Booking Details",
    createdBy: "Requested by",
    createdAtLabel: "Submitted at",

    // Rooms Admin
    addRoom: "Add Meeting Room",
    editRoom: "Edit Meeting Room",
    roomName: "Room Name",
    location: "Location / Floor",
    equipmentList: "Equipment (comma separated)",
    equipmentExample: "e.g. Projector, Microphone, LED Display, Sound System",
    roomStatusLabel: "Room Status",
    save: "Save Changes",
    cancelBtn: "Cancel",
    edit: "Edit",
    delete: "Delete",
    confirmDeleteRoom:
      "Are you sure you want to delete this room? Associated bookings will also be removed.",
    availableEquipment: "Equipment Available",
    totalRooms: "Total Rooms",

    // Users Admin
    userList: "Hospital Staff Directory",
    searchUsers: "Search users (name, department, username)...",
    addUser: "Add New User",
    editUser: "Edit User Info",
    fullName: "Full Name",
    department: "Department / Unit",
    role: "Access Role",
    confirmDeleteUser: "Are you sure you want to delete this user?",
    leaveBlankToKeep: "(Leave blank to retain current password)",
    deleteAllBookings: "Clear All Booking History",
    confirmDeleteAllBookings:
      "Are you sure you want to delete ALL booking history? This action cannot be undone.",
    toastAllBookingsDeleted: "All booking history has been cleared.",
    rejectReason: "Rejection Reason",
    rejectReasonPlaceholder: "Enter reason for rejection (optional)...",
    confirmRejectTitle: "Confirm Request Rejection",
    rejectBooking: "Confirm Reject",
    rejectedReasonLabel: "Rejection Reason:",

    // Booking Form Modal
    bookRoom: "Book Meeting Room",
    quickBook: "Book This Room",
    room: "Meeting Room",
    equipmentInRoom: "Room Amenities & Equipment",
    maxCapacity: "Max capacity",
    selectDatePlaceholder: "Select date",
    date: "Booking Date",
    startTime: "Start Time",
    endTime: "End Time",
    conflictWarning:
      "Schedule conflict detected for this time slot. Please adjust time or room.",
    attendees: "Attendees Count",
    purpose: "Meeting Purpose",
    purposePlaceholder:
      "e.g. Board Committee Meeting, Medical Academic Seminar...",
    submitBooking: "Submit Booking Request",
    submitting: "Submitting...",

    // Errors / Validation
    errPurpose: "Please enter the meeting purpose.",
    errTime: "End time must be after start time.",
    errConflict: "This time slot is already booked.",
    errCapacity: "Number of attendees exceeds maximum room capacity.",
    errRoomName: "Please specify the room name.",
    errLocation: "Please specify location/floor.",
    errCapacityZero: "Capacity must be greater than 0.",
    errFullName: "Please enter full name.",
    errUsername: "Please enter username.",
    errPasswordCreate: "Please provide a password for the new user.",

    // Toasts
    toastBookingSuccess: "Meeting room request submitted successfully.",
    toastApproveSuccess: "Booking request approved.",
    toastRejectSuccess: "Booking request rejected.",
    toastCancelSuccess: "Booking request cancelled.",
    toastRoomAdded: "Room added successfully.",
    toastRoomEdited: "Room updated successfully.",
    toastRoomDeleted: "Room deleted successfully.",
    toastUserAdded: "User created successfully.",
    toastUserEdited: "User updated successfully.",
    toastUserDeleted: "User deleted successfully.",

    // Settings
    settingsTitle: "System Settings",
    systemPreferences: "Display & Language Preferences",
    language: "System Language",
    theme: "Display Theme",
    lightTheme: "Light Mode",
    darkTheme: "Dark Mode",
    systemTheme: "Follow System",
    hospitalInfo: "Hospital System Information",
    systemVersion: "System Version",
    developerInfo:
      "Samkhok Hospital Meeting Room Management System, Pathum Thani",
  },
}

export type TranslationKey = keyof typeof translations.th

export function getTranslation(lang: Language) {
  return translations[lang] || translations.th
}

/**
 * Translates standard user names across Thai and English
 */
export function formatUserName(user: Partial<User> | null | undefined, lang: Language): string {
  if (!user) return ""
  const name = user.name || ""
  if (lang === "th") return name

  if (user.role === "admin" || user.username === "Admin" || name.includes("ผู้ดูแลระบบ")) {
    return "Administrator"
  }
  if (user.username === "Test" || name.includes("สมศรี")) {
    return "Nurse Somsri Jaidee"
  }
  if (user.username === "Pharma" || name.includes("วินัย")) {
    return "Pharmacist Winai Chamnankan"
  }
  if (user.username === "Doctor" || name.includes("กิตติพงษ์")) {
    return "Dr. Kittipong Suksawat"
  }
  if (name.includes("หัวหน้าแพทย์")) {
    return "Chief Medical Officer"
  }
  if (name === "ทั่วไป" || name === "บุคลากร") {
    return "Staff Member"
  }
  return name
}

/**
 * Translates standard departments across Thai and English
 */
export function formatDepartment(dept: string | null | undefined, role: string | undefined, lang: Language): string {
  if (role === "admin") {
    return lang === "th" ? "ผู้ดูแลระบบ" : "Administrator"
  }
  if (!dept || dept === "-") {
    return lang === "th" ? "บุคลากรทั่วไป" : "General Staff"
  }
  if (lang === "th") return dept

  if (dept === "IT" || dept.includes("คอมพิวเตอร์") || dept.includes("สารสนเทศ")) {
    return "IT & Computer Center"
  }
  if (dept.includes("การพยาบาล")) {
    return "Nursing Department"
  }
  if (dept.includes("เภสัชกรรม")) {
    return "Pharmacy Department"
  }
  if (dept.includes("ศัลยศาสตร์")) {
    return "Surgery Department"
  }
  if (dept.includes("อายุรกรรม")) {
    return "Internal Medicine Department"
  }
  if (dept === "ทั่วไป") {
    return "General Staff"
  }
  return dept
}

/**
 * Translates standard room names across Thai and English
 */
export function formatRoomName(room: Partial<Room> | null | undefined, lang: Language): string {
  if (!room) return ""
  const name = room.name || ""
  if (lang === "th") return name

  if (name.includes("ห้องประชุมใหญ่")) {
    return "Main Conference Hall (Grand Hall)"
  }
  if (name.includes("วิชาการแพทย์") || name.includes("ห้องประชุมเล็ก 1")) {
    return "Medical Seminar Room 1"
  }
  if (name.includes("กลุ่มงานการพยาบาล") || name.includes("ห้องประชุมเล็ก 2")) {
    return "Nursing Conference Room"
  }
  if (name.includes("อบรมสัมมนาบุคลากร") || name.includes("Auditorium")) {
    return "Staff Auditorium & Seminar Hall"
  }
  return name
}

/**
 * Translates standard room location across Thai and English
 */
export function formatRoomLocation(loc: string | null | undefined, lang: Language): string {
  if (!loc) return ""
  if (lang === "th") return loc

  return loc
    .replace(/อาคาร\s*([A-Za-z0-9]+)/g, "Building $1")
    .replace(/ชั้น\s*([0-9]+)/g, "Floor $1")
}

/**
 * Translates standard equipment names across Thai and English
 */
export function formatEquipment(eq: string | null | undefined, lang: Language): string {
  if (!eq) return ""
  if (lang === "th") return eq

  if (eq.includes("โปรเจคเตอร์ 4K")) return "4K Projector"
  if (eq.includes("โปรเจคเตอร์ HD")) return "HD Projector"
  if (eq.includes("โปรเจคเตอร์ x2")) return "Dual Projectors"
  if (eq.includes("โปรเจคเตอร์")) return "Projector"
  if (eq.includes("ไมโครโฟนไร้สาย 4 ตัว")) return "4x Wireless Microphones"
  if (eq.includes("ไมโครโฟน 6 ตัว")) return "6x Microphones"
  if (eq.includes("ไมโครโฟนตั้งโต๊ะ")) return "Desktop Microphones"
  if (eq.includes("ไมโครโฟน")) return "Microphone"
  if (eq.includes("จอภาพ LED ขนาดใหญ่")) return "Large LED Display"
  if (eq.includes("จอภาพ LED") || eq.includes("จอภาพ")) return "LED Display"
  if (eq.includes("ระบบเสียงรอบทิศทาง")) return "Surround Sound System"
  if (eq.includes("ระบบเสียงห้องประชุม") || eq.includes("ระบบเสียง")) return "Audio Sound System"
  if (eq.includes("ระบบบันทึกเสียง")) return "Audio Recording System"
  if (eq.includes("กระดานไวท์บอร์ดอัจฉริยะ")) return "Smart Whiteboard"
  if (eq.includes("กระดานไวท์บอร์ด")) return "Whiteboard"
  if (eq.includes("ระบบวิดีโอคอนเฟอเรนซ์")) return "Video Conference System"
  if (eq.includes("ระบบ Zoom Meeting")) return "Zoom Meeting System"
  if (eq.includes("สมาร์ททีวี 75 นิ้ว")) return "75-inch Smart TV"
  if (eq.includes("เวทีบรรยาย")) return "Lecture Stage & Podium"

  return eq
}
