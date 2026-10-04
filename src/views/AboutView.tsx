import React from "react"
import { Building2, History, Target, HeartHandshake, Flag } from "lucide-react"
import { useApp } from "../context/AppContext"

export const AboutView: React.FC = () => {
  const { language } = useApp()

  return (
    <div className="max-w-4xl mx-auto pb-10 animate-in fade-in duration-300">
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xl overflow-hidden">
        <div className="relative overflow-hidden bg-gradient-to-br from-[#1b0738] via-[#3b1170] to-[#6d28d9] p-8 text-white shadow-xl shadow-purple-900/20">
          <div className="pointer-events-none absolute -top-16 -right-10 h-56 w-56 rounded-full bg-fuchsia-400/25 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 left-10 h-48 w-48 rounded-full bg-indigo-400/25 blur-3xl" />
          <div className="relative z-10 flex items-center gap-5">
            <div className="flex h-16 w-16 flex-none items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25 backdrop-blur shadow-inner">
              <Building2 className="h-8 w-8 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-purple-200/90 mb-1">
                {language === "th" ? "เกี่ยวกับโรงพยาบาล" : "About Hospital"}
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold leading-tight">
                {language === "th" ? "โรงพยาบาลสามโคก" : "Samkhok Hospital"}
              </h1>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-10 space-y-10 text-slate-700 dark:text-slate-300 leading-relaxed text-sm sm:text-base">
          {/* History */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-purple-700 dark:text-purple-400 font-bold text-lg border-b border-purple-100 dark:border-purple-900/50 pb-2">
              <History className="h-6 w-6" />
              <h2>{language === "th" ? "ประวัติโรงพยาบาล" : "Hospital History"}</h2>
            </div>
            <div className="space-y-4 pt-2">
              <p>
                โรงพยาบาลสามโคก เริ่มต้นเมื่อปีงบประมาณ พ.ศ. 2531 ได้ยกฐานะจากสถานีอนามัยอำเภอสามโคก ตำบลบางเตย อำเภอสามโคก เป็นโรงพยาบาลสามโคก สาขาโรงพยาบาลปทุมธานี
              </p>
              <p>
                ปี พ.ศ. 2537 ได้รับเงินงบประมาณจากกระทรวงสาธารณสุข เพื่อก่อสร้างอาคารถาวรตามแบบแปลน เลขที่ 661 บนเนื้อที่ 32 ไร่ 40 ตารางวา ซึ่งได้รับบริจาคจาก นายเบี้ยว พยัคฆาจ ปัจจุบันได้ชื่อว่า <span className="font-bold">"โรงพยาบาลสามโคก"</span> และได้รับการยกฐานะเป็นโรงพยาบาลขนาด 10 เตียง เมื่อ วันที่ 1 มิถุนายน 2539 
              </p>
              <p>ปีงบประมาณ 2537 ได้รับอนุมัติจากกระทรวงสาธารณสุข เพื่อทำการก่อสร้างอาคารต่างๆ ดังนี้:</p>
              <ul className="list-disc pl-6 space-y-2 text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 ml-2">
                <li>อาคารผู้ป่วยนอก ผู้ป่วยในขนาด 30 เตียง (จำนวน 1 หลัง)</li>
                <li>โรงซักฟอกและโรงเก็บรถ (จำนวน 1 หลัง)</li>
                <li>อาคารบ้านพักข้าราชการระดับ 3-4 (จำนวน 1 หลัง)</li>
                <li>อาคารบ้านพักข้าราชการระดับ 5-6 (จำนวน 1 หลัง)</li>
                <li>อาคารบ้านพักข้าราชการระดับ 1-2 (จำนวน 1 หลัง)</li>
              </ul>
              <p>
                เมื่อวันที่ 1 มิถุนายน 2539 ภายหลังก่อสร้างแล้วเสร็จจึงได้ย้ายที่ทำการมาเปิดให้บริการแก่ประชาชนที่ อาคารผู้ป่วยนอกและผู้ป่วยในโดยให้บริการเต็มรูปแบบของโรงพยาบาลชุมชนขนาด 10 เตียงเป็นต้นมา ทำให้การบริการต่างๆ มีความสะดวกรวดเร็วขึ้น
              </p>
              <p>
                ต่อมาเมื่อปีงบประมาณ 2550 ได้รับงบประมาณงบลงทุนจากกระทรวงสาธารณสุขจำนวนเงิน 7,249,500 บาท เพื่อสร้างตึกผู้ป่วยในขนาด 30 เตียงตามแบบเลขที่ 2371/2530 กองแบบแผนสำนักงานกระทรวงสาธารณสุขก่อสร้างเสร็จ พ.ศ 2551
              </p>
            </div>
          </section>

          {/* Vision & Core Values Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
            <section className="bg-purple-50 dark:bg-purple-950/20 p-6 rounded-3xl border border-purple-100 dark:border-purple-900/50 space-y-4">
              <div className="flex items-center gap-2 text-purple-700 dark:text-purple-400 font-bold text-lg">
                <Target className="h-6 w-6" />
                <h2>{language === "th" ? "วิสัยทัศน์" : "Vision"}</h2>
              </div>
              <p className="font-semibold text-purple-900 dark:text-purple-100 text-base">
                เครือข่ายบริการสุขภาพในการสร้างสุขภาพแบบองค์รวม<br/>
                มุ่งสู่ความเป็นเลิศด้านการแพทย์ฉุกเฉินและการส่งต่อ
              </p>
            </section>
            
            <section className="bg-purple-50 dark:bg-purple-950/20 p-6 rounded-3xl border border-purple-100 dark:border-purple-900/50 space-y-4">
              <div className="flex items-center gap-2 text-purple-700 dark:text-purple-400 font-bold text-lg">
                <HeartHandshake className="h-6 w-6" />
                <h2>{language === "th" ? "ค่านิยม" : "Core Values"}</h2>
              </div>
              <p className="font-semibold text-purple-900 dark:text-purple-100 text-base">
                เครือข่ายมุ่งมั่น บริการเป็นมิตร พร้อมช่วยชีวิต ใกล้ชิดประชาชน
              </p>
            </section>
          </div>

          {/* Mission */}
          <section className="space-y-4 pt-4">
            <div className="flex items-center gap-2 text-purple-700 dark:text-purple-400 font-bold text-lg border-b border-purple-100 dark:border-purple-900/50 pb-2">
              <Flag className="h-6 w-6" />
              <h2>{language === "th" ? "พันธกิจ" : "Mission"}</h2>
            </div>
            <ul className="space-y-4 pt-2">
              {[
                "พัฒนาคุณภาพการสร้างสุขภาพ ที่สอดคล้องกับวิถีชีวิตแห่งความเป็นเมืองพื้นที่อุตสาหกรรม และเกษตรกรรม",
                "พัฒนาคุณภาพการดูแลและสุขภาพองค์รวมที่เชื่อมโยงสู่ชุมชน ครัวเรือน และบุคคลตามความหลากหลายวัฒนธรรม",
                "พัฒนาคุณภาพการบริหารจัดการเครือข่ายบริการสุขภาพ และแบบบูรณาการ",
                "พัฒนาความเป็นเลิศด้านบริการการแพทย์ฉุกเฉินและการส่งต่อ"
              ].map((item, idx) => (
                <li key={idx} className="flex gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 sm:p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm transition-transform hover:-translate-y-1">
                  <div className="flex-none flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-400 font-bold mt-0.5">
                    {idx + 1}
                  </div>
                  <span className="font-medium text-base">{item}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  )
}
export default AboutView
