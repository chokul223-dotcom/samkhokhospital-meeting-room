export type Language = 'th' | 'en';

export const translations = {
  th: {
    // Roles
    admin: 'ผู้ดูแลระบบ',
    user: 'บุคลากรทั่วไป',
    
    // Status
    pending: 'รอการอนุมัติ',
    approved: 'อนุมัติแล้ว',
    rejected: 'ปฏิเสธ',
    cancelled: 'ยกเลิก',
    available: 'พร้อมใช้งาน',
    maintenance: 'ซ่อมบำรุง',
    inUse: 'กำลังใช้งาน',
    free: 'ว่าง',
    
    // Navigation
    dashboard: 'ภาพรวม',
    calendar: 'ปฏิทิน',
    myBookings: 'การจองของฉัน',
    allBookings: 'การจองทั้งหมด',
    rooms: 'ห้องประชุม',
    users: 'ผู้ใช้งาน',
    settings: 'การตั้งค่า',
    logout: 'ออกจากระบบ',
    
    // Titles & Text
    appName: 'โรงพยาบาลสามโคก',
    appDesc: 'ระบบจองห้องประชุม',
    loginTitle: 'จองห้องประชุม',
    username: 'ผู้ใช้',
    password: 'รหัสผ่าน',
    forgotPassword: 'ลืมรหัสผ่าน ?',
    loginBtn: 'เข้าสู่ระบบ',
    contactAdmin: 'กรุณาติดต่อผู้ดูแลระบบเพื่อรีเซ็ตรหัสผ่าน',
    invalidLogin: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง',
    
    // Dashboard Stats
    roomsReady: 'ห้องพร้อมใช้งาน',
    todayBookings: 'การจองวันนี้',
    pendingApprovals: 'รอการอนุมัติ',
    totalBookings: 'การจองทั้งหมด',
    todaySchedule: 'ตารางวันนี้',
    noMeetingToday: 'ไม่มีการประชุมในวันนี้',
    roomStatus: 'สถานะห้องประชุม',
    capacity: 'ความจุ',
    people: 'คน',
    
    // Calendar
    selectDate: 'เลือกวันที่:',
    noBookingAllDay: 'ไม่มีการจอง — ว่างตลอดวัน',
    
    // Booking List
    statusFilter: 'สถานะ',
    dateFilter: 'วันที่',
    all: 'ทั้งหมด',
    clearFilter: 'ล้างตัวกรอง',
    noBookingsFound: 'ไม่พบรายการจอง',
    items: 'รายการ',
    approve: 'อนุมัติ',
    reject: 'ปฏิเสธ',
    cancel: 'ยกเลิก',
    
    // Rooms Admin
    addRoom: '+ เพิ่มห้องประชุม',
    editRoom: 'แก้ไขห้องประชุม',
    roomName: 'ชื่อห้องประชุม',
    location: 'สถานที่/ชั้น',
    equipmentList: 'อุปกรณ์ (คั่นด้วยเครื่องหมายจุลภาค ,)',
    equipmentExample: 'เช่น โปรเจคเตอร์, ไมโครโฟน',
    roomStatusLabel: 'สถานะ',
    save: 'บันทึกข้อมูล',
    cancelBtn: 'ยกเลิก',
    edit: 'แก้ไข',
    delete: 'ลบ',
    confirmDeleteRoom: 'คุณต้องการลบห้องประชุมนี้ใช่หรือไม่?',
    
    // Users Admin
    userList: 'รายชื่อผู้ใช้งานระบบ',
    changePassword: 'เปลี่ยนรหัสผ่าน',
    setNewPassword: 'ตั้งรหัสผ่านใหม่สำหรับ',
    
    // Booking Form
    bookRoom: '+ จองห้องประชุม',
    room: 'ห้องประชุม',
    equipmentInRoom: 'อุปกรณ์ในห้อง:',
    date: 'วันที่',
    startTime: 'เวลาเริ่มต้น',
    endTime: 'เวลาสิ้นสุด',
    conflictWarning: '⚠️ มีการจองทับซ้อนในช่วงเวลาดังกล่าว',
    attendees: 'จำนวนผู้เข้าร่วม',
    purpose: 'วัตถุประสงค์',
    purposePlaceholder: 'ระบุวัตถุประสงค์การประชุม...',
    submitBooking: 'ส่งคำขอจอง',
    
    // Errors / Validation
    errPurpose: 'กรุณาระบุวัตถุประสงค์การประชุม',
    errTime: 'เวลาสิ้นสุดต้องมากกว่าเวลาเริ่มต้น',
    errConflict: 'ช่วงเวลาดังกล่าวมีการจองอยู่แล้ว',
    errCapacity: 'จำนวนผู้เข้าร่วมเกินความจุห้อง',
    errRoomName: 'กรุณาระบุชื่อห้อง',
    errLocation: 'กรุณาระบุสถานที่/ที่ตั้ง',
    errCapacityZero: 'ความจุต้องมากกว่า 0',
    
    // Toasts
    toastBookingSuccess: 'ส่งคำขอจองห้องประชุมเรียบร้อยแล้ว',
    toastApproveSuccess: 'อนุมัติการจองเรียบร้อยแล้ว',
    toastRejectSuccess: 'ปฏิเสธการจองเรียบร้อยแล้ว',
    toastCancelSuccess: 'ยกเลิกการจองเรียบร้อยแล้ว',
    toastRoomAdded: 'เพิ่มห้องประชุมเรียบร้อยแล้ว',
    toastRoomEdited: 'แก้ไขข้อมูลห้องประชุมเรียบร้อยแล้ว',
    toastRoomDeleted: 'ลบห้องประชุมเรียบร้อยแล้ว',
    toastPasswordChanged: 'เปลี่ยนรหัสผ่านเรียบร้อยแล้ว',
    
    // Settings
    settingsTitle: 'การตั้งค่าระบบ',
    language: 'ภาษา (Language)',
    theme: 'ธีมสี (Theme)',
    lightTheme: 'สว่าง (Light)',
    darkTheme: 'มืด (Dark)',
    systemTheme: 'ตามระบบ (System)',
  },
  en: {
    // Roles
    admin: 'Administrator',
    user: 'General Staff',
    
    // Status
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    cancelled: 'Cancelled',
    available: 'Available',
    maintenance: 'Maintenance',
    inUse: 'In Use',
    free: 'Free',
    
    // Navigation
    dashboard: 'Dashboard',
    calendar: 'Calendar',
    myBookings: 'My Bookings',
    allBookings: 'All Bookings',
    rooms: 'Rooms',
    users: 'Users',
    settings: 'Settings',
    logout: 'Logout',
    
    // Titles & Text
    appName: 'Samkhok Hospital',
    appDesc: 'Meeting Room Booking',
    loginTitle: 'Book Meeting Room',
    username: 'Username',
    password: 'Password',
    forgotPassword: 'Forgot Password?',
    loginBtn: 'Login',
    contactAdmin: 'Please contact the administrator to reset your password.',
    invalidLogin: 'Invalid username or password',
    
    // Dashboard Stats
    roomsReady: 'Available Rooms',
    todayBookings: 'Today\'s Bookings',
    pendingApprovals: 'Pending Approvals',
    totalBookings: 'Total Bookings',
    todaySchedule: 'Today\'s Schedule',
    noMeetingToday: 'No meetings today',
    roomStatus: 'Room Status',
    capacity: 'Capacity',
    people: 'pax',
    
    // Calendar
    selectDate: 'Select Date:',
    noBookingAllDay: 'No bookings — Free all day',
    
    // Booking List
    statusFilter: 'Status',
    dateFilter: 'Date',
    all: 'All',
    clearFilter: 'Clear Filters',
    noBookingsFound: 'No bookings found',
    items: 'items',
    approve: 'Approve',
    reject: 'Reject',
    cancel: 'Cancel',
    
    // Rooms Admin
    addRoom: '+ Add Room',
    editRoom: 'Edit Room',
    roomName: 'Room Name',
    location: 'Location/Floor',
    equipmentList: 'Equipment (comma separated)',
    equipmentExample: 'e.g. Projector, Microphone',
    roomStatusLabel: 'Status',
    save: 'Save',
    cancelBtn: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
    confirmDeleteRoom: 'Are you sure you want to delete this room?',
    
    // Users Admin
    userList: 'System Users',
    changePassword: 'Change Password',
    setNewPassword: 'Set new password for',
    
    // Booking Form
    bookRoom: '+ Book Room',
    room: 'Room',
    equipmentInRoom: 'Room Equipment:',
    date: 'Date',
    startTime: 'Start Time',
    endTime: 'End Time',
    conflictWarning: '⚠️ There is a scheduling conflict during this time.',
    attendees: 'Number of Attendees',
    purpose: 'Purpose',
    purposePlaceholder: 'State the purpose of the meeting...',
    submitBooking: 'Submit Request',
    
    // Errors / Validation
    errPurpose: 'Please enter the meeting purpose.',
    errTime: 'End time must be after start time.',
    errConflict: 'This time slot is already booked.',
    errCapacity: 'Number of attendees exceeds room capacity',
    errRoomName: 'Please enter a room name.',
    errLocation: 'Please enter the location/floor.',
    errCapacityZero: 'Capacity must be greater than 0.',
    
    // Toasts
    toastBookingSuccess: 'Booking request submitted successfully.',
    toastApproveSuccess: 'Booking approved successfully.',
    toastRejectSuccess: 'Booking rejected successfully.',
    toastCancelSuccess: 'Booking cancelled successfully.',
    toastRoomAdded: 'Room added successfully.',
    toastRoomEdited: 'Room updated successfully.',
    toastRoomDeleted: 'Room deleted successfully.',
    toastPasswordChanged: 'Password changed successfully.',
    
    // Settings
    settingsTitle: 'System Settings',
    language: 'Language',
    theme: 'Theme',
    lightTheme: 'Light',
    darkTheme: 'Dark',
    systemTheme: 'System',
  }
}

export function useTranslation(lang: Language) {
  return translations[lang];
}
