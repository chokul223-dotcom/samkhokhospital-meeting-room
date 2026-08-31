import React from "react"
import { FileText, X } from "lucide-react"

interface PrivacyPolicyModalProps {
  onClose: () => void
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ onClose }) => (
  <div
    className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200"
    onClick={onClose}
  >
    <div
      className="relative w-full max-w-2xl max-h-[85vh] rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex-none">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-green-700 dark:text-green-400" />
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            นโยบายความเป็นส่วนตัว Privacy Policy
          </h2>
        </div>
        <button
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Content */}
      <div className="overflow-y-auto flex-1 px-6 py-5 text-sm text-slate-700 dark:text-slate-300 leading-relaxed space-y-5">
        <p>
          Booking Room Online ให้ความสำคัญกับการคุ้มครองข้อมูลส่วนบุคคลของคุณ
          โดยนโยบายความเป็นส่วนตัวนี้ได้อธิบายแนวปฏิบัติในการเก็บรวบรวม ใช้
          หรือเปิดเผยข้อมูลส่วนบุคคล ตามกฎหมายคุ้มครองข้อมูลส่วนบุคคล
        </p>

        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
            ข้อมูลที่ทางเว็บไซต์จัดเก็บ
          </h3>
          <p className="mb-2">
            Booking Room Online จัดเก็บข้อมูลส่วนบุคคลเฉพาะที่จำเป็นในการดำเนินการในเว็บไซต์เท่านั้น
            โดยมีการจัดเก็บผ่านทาง
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>การสมัครสมาชิก</li>
            <li>Facebook Login</li>
            <li>Google Login</li>
            <li>Line Login</li>
          </ul>
        </div>

        <div>
          <p className="font-semibold text-slate-800 dark:text-slate-200 mb-1">ข้อมูลที่จัดเก็บได้แก่</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>ข้อมูลส่วนบุคคล เช่น ชื่อ นามสกุล เป็นต้น</li>
            <li>ข้อมูลการติดต่อ เช่น ที่อยู่ หมายเลขโทรศัพท์ อีเมล เป็นต้น</li>
            <li>ข้อมูลผู้ใช้งาน บริการ/วิธีการใช้งาน เช่น IP address, Cookie เป็นต้น</li>
          </ul>
        </div>

        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
            จุดประสงค์ในการเก็บข้อมูลส่วนบุคคล
          </h3>
          <p className="mb-2">
            ทางเว็บไซต์มีโอกาสนำข้อมูลส่วนบุคคลที่คุณกรอกมาใช้งาน เราจัดเก็บข้อมูลส่วนบุคคลเพื่อให้บริการต่างๆ
            ของเว็บไซต์อย่างเหมาะสม โดยมีจุดประสงค์หลักๆ ดังนี้
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>สร้างสะดวกในการให้ผู้ใช้งาน</li>
            <li>ปฏิบัติตามกฎหมายและกฎระเบียบและกระบวนการทางกฎหมาย</li>
          </ul>
        </div>

        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
            คุกกี้ (Cookies)
          </h3>
          <p>
            เราใช้คุกกี้ (Cookies) หรือไฟล์ข้อความที่คล้ายกันทำหน้าที่เช่นเดียวกัน
            เพื่อให้เว็บไซต์ทำงานได้อย่างมีประสิทธิภาพ และติดตามการใช้งานของคุณบนเว็บไซต์ของเรา
            หากคุณต้องการที่จะปิดคุกกี้บนคอมพิวเตอร์ของคุณ คุณสามารถตั้งค่าเบราว์เซอร์
            เพื่อปฏิเสธการรับคุกกี้หรือลบคุกกี้จากส่วนที่บันทึกในคอมพิวเตอร์ของคุณได้
            ทั้งนี้บางส่วนของเว็บไซต์อาจมีเนื้อหาบางประเภทที่ไม่สามารถใช้งานได้
          </p>
        </div>

        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
            การขอลบข้อมูลผู้ใช้
          </h3>
          <p className="mb-2">
            คุณสามารถดูข้อมูลหรือเข้าถึงข้อมูลทั้งหมดที่บันทึกอยู่บนเว็บไซต์นี้ หรือเพื่อค้นหาเปลี่ยนแปลง
            เราจะดำเนินการในกระบวนการดังกล่าว
          </p>
          <p>
            นโยบายความเป็นส่วนตัว อาจมีการเปลี่ยนแปลงและอาจมีการปรับปรุงใหม่ หากจำเป็น
            สามารถตรวจสอบได้ที่หน้าเดิมของเว็บไซต์ที่มีการเปลี่ยนแปลงเมื่อใดก็ได้ทางเว็บไซต์นี้เท่านั้น
          </p>
        </div>

        <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            นโยบายนี้มีผลใช้ตั้งแต่ 30 พค. 2565
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex-none">
        <button
          onClick={onClose}
          className="w-full rounded-xl bg-green-700 hover:bg-green-800 text-white py-2.5 text-sm font-bold transition-colors cursor-pointer shadow-md shadow-green-700/20"
        >
          รับทราบและปิด
        </button>
      </div>
    </div>
  </div>
)
