# PCSHSCR Club Registration – Setup Guide

## 1. สร้าง Firebase Project

1. ไปที่ https://console.firebase.google.com
2. สร้าง Project ใหม่
3. เปิดใช้ **Cloud Firestore** (เลือก Production Mode)
4. ไปที่ **Project Settings → General** → คัดลอก Firebase Config

## 2. กรอก Firebase Config

เปิดไฟล์ `js/firebase-config.js` แล้วแทนที่ค่าต่อไปนี้:

```js
const firebaseConfig = {
  apiKey:            "YOUR_API_KEY",         // ← ใส่ค่าจริง
  authDomain:        "YOUR_PROJECT_ID...",    // ← ใส่ค่าจริง
  projectId:         "YOUR_PROJECT_ID",       // ← ใส่ค่าจริง
  storageBucket:     "...",
  messagingSenderId: "...",
  appId:             "..."
};
```

## 3. Firestore Security Rules

ใน Firebase Console → Firestore → Rules ให้วาง:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

> ⚠️ สำหรับ Production จริงควรล็อก rules ให้แน่นกว่านี้

## 4. ตั้งค่าเริ่มต้นใน Firestore

สร้าง document ใน collection `settings` ที่มี ID ว่า `global`:
```json
{
  "adminPassword": "1234",
  "teacherPin": "1234"
}
```

## 5. Deploy บน GitHub Pages

1. Push โค้ดทั้งหมดขึ้น GitHub Repository
2. ไปที่ Settings → Pages → Source: `main` branch `/root`
3. เว็บไซต์จะ deploy ที่ `https://username.github.io/repo-name/`

## 6. ขั้นตอนการใช้งาน (Admin)

1. เข้าสู่ระบบที่ `admin-login.html` ด้วยรหัส `1234`
2. อัปโหลดรายชื่อนักเรียน (Excel) ใน tab "ข้อมูลนักเรียน"
3. สร้างรอบการลงทะเบียนใน tab "รอบการลงทะเบียน"
4. กำหนดวัน-เวลาเปิด/ปิดระบบ
5. เปิดให้ครูกรอกแบบฟอร์มชุมนุม

## โครงสร้างไฟล์

```
├── index.html              → หน้าหลัก (Landing Page)
├── student-login.html      → หน้าเข้าสู่ระบบนักเรียน
├── student-dashboard.html  → แดชบอร์ดนักเรียน (รอบการลงทะเบียน)
├── club-selection.html     → หน้าเลือกชุมนุม
├── teacher-login.html      → หน้าเข้าสู่ระบบครู
├── teacher-dashboard.html  → แดชบอร์ดครู
├── teacher-form.html       → กรอกแบบฟอร์มขอเปิดชุมนุม
├── teacher-manage.html     → จัดการข้อมูลชุมนุม
├── admin-login.html        → หน้าเข้าสู่ระบบแอดมิน
├── admin-dashboard.html    → แดชบอร์ดแอดมิน (ทุกฟังก์ชัน)
├── css/style.css           → Global Pastel Theme
├── js/firebase-config.js   → Firebase Configuration
├── js/utils.js             → Shared Utilities
└── firestore.rules         → Firestore Security Rules
```
