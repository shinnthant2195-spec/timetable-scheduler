// src/components/ConstraintExplanation.jsx
import React from 'react';
import './ConstraintExplanation.css';

import logoImage from "../assets/nspu logo.png";

export default function ConstraintExplanation() {
    return (
        <div className="explanation-container">
            
            {/* Hero Section */}
            <div className="hero-layout">
                {/* Change the class names on this div below: */}
                <div className="hero-left">
                    <h1>Intelliclass</h1>
                    <h2>TimeTable Scheduler</h2>
                    <h3>--Master Your Time!--</h3>
                </div>
                
                <div className="explanation-hero right-box">
                    <p>
                        Timefold AI ကို အသုံးပြု၍ 
                        ဆရာ၊ ကျောင်းသား နှင့် အခန်းများ၏ လိုအပ်ချက်များကို အကောင်းဆုံး တွက်ချက်ကာ 
                        အမှားအယွင်းကင်းသော အချိန်ဇယားများကို အလိုအလျောက် ရေးဆွဲပေးပါသည်။
                    </p>
                </div>
            </div>

            {/* Hard Constraints Section */}
            <div className="constraint-section">
                <div className="section-title hard-title">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                    တင်းကျပ်သော စည်းမျဉ်းများ (Hard Constraints)
                </div>
                <p style={{ color: '#6B7280', marginBottom: '20px', fontSize: '14px' }}>
                    AI မှ အချိန်ဇယားဆွဲရာတွင် လုံးဝ (လုံးဝ) ဖောက်ဖျက်၍မရသော အခြေခံစည်းမျဉ်းများ ဖြစ်ပါသည်။
                </p>
                
                <div className="constraint-grid">
                    <div className="constraint-card hard-card">
                        <div className="icon-wrapper">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                        </div>
                        <div className="constraint-content">
                            <h3>Room Capacity (အခန်းဆံ့နိုင်မှု)</h3>
                            <p>အတန်းတစ်တန်းရှိ ကျောင်းသားစုစုပေါင်းအရေအတွက်သည် စာသင်ခန်း၏ အများဆုံးလက်ခံနိုင်သော ဆံ့နိုင်စွမ်း (Capacity) ထက် မကျော်လွန်စေရပါ။ (Elective ဘာသာရပ်များ မပါဝင်ပါ)</p>
                        </div>
                    </div>

                    <div className="constraint-card hard-card">
                        <div className="icon-wrapper">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"></polygon><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                        </div>
                        <div className="constraint-content">
                            <h3>Teacher Conflict (ဆရာများ၏ အချိန်ထပ်ခြင်း)</h3>
                            <p>ဆရာ/ဆရာမ တစ်ဦးတည်းကို အချိန်တစ်ချိန်တည်းတွင် အတန်းနှစ်ခု ပြိုင်တူ သင်ကြားရန် လုံးဝ ခွဲဝေချထားခြင်း မပြုလုပ်ပါ။</p>
                        </div>
                    </div>

                    <div className="constraint-card hard-card">
                        <div className="icon-wrapper">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
                        </div>
                        <div className="constraint-content">
                            <h3>Session Conflict (အတန်းချိန်ထပ်ခြင်း)</h3>
                            <p>အတန်းတစ်တန်းတည်း (Session) ကို အချိန်တစ်ချိန်တည်းတွင် မတူညီသော ဘာသာရပ်နှစ်ခု ပြိုင်တူ မသင်စေရန် ကာကွယ်ပေးထားပါသည်။ (Elective ဘာသာရပ်များ ပြိုင်တူသင်ခြင်းမှလွဲ၍)</p>
                        </div>
                    </div>

                    <div className="constraint-card hard-card">
                        <div className="icon-wrapper">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>
                        </div>
                        <div className="constraint-content">
                            <h3>Room Conflict (အခန်းထပ်ခြင်း)</h3>
                            <p>စာသင်ခန်း တစ်ခန်းတည်းတွင် အချိန်တစ်ချိန်တည်း၌ အတန်း (Sessions) နှစ်ခု ပြိုင်တူ ဝင်ရောက်သင်ကြားခြင်း မရှိစေရန် စစ်ဆေးပေးပါသည်။</p>
                        </div>
                    </div>

                    <div className="constraint-card hard-card">
                        <div className="icon-wrapper">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                        </div>
                        <div className="constraint-content">
                            <h3>Lab Room Required (လက်တွေ့ခန်း လိုအပ်ချက်)</h3>
                            <p>လက်တွေ့ (Practical/Lab) ဘာသာရပ်များအားလုံးကို ရိုးရိုးစာသင်ခန်းများတွင် မထားဘဲ သက်ဆိုင်ရာ Lab အခန်းများတွင်သာ မပျက်မကွက် နေရာချထားပေးပါသည်။</p>
                        </div>
                    </div>

                    <div className="constraint-card hard-card">
                        <div className="icon-wrapper">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                        </div>
                        <div className="constraint-content">
                            <h3>Teacher Unavailable (ဆရာမအားလပ်ချိန်)</h3>
                            <p>ဆရာ/ဆရာမများ ခွင့်ယူထားသောရက်များ (သို့) မအားလပ်ကြောင်း သတ်မှတ်ထားသော အချိန်များတွင် အတန်းများကို လုံးဝ ချထားပေးမည် မဟုတ်ပါ။</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Soft Constraints Section */}
            <div className="constraint-section">
                <div className="section-title soft-title">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                    ညှိနှိုင်းနိုင်သော စည်းမျဉ်းများ (Soft Constraints)
                </div>
                <p style={{ color: '#6B7280', marginBottom: '20px', fontSize: '14px' }}>
                    AI မှ အချိန်ဇယားကို အချောမွေ့ဆုံးနှင့် သက်တောင့်သက်သာ အဖြစ်ဆုံးဖြစ်အောင် အတတ်နိုင်ဆုံး ညှိနှိုင်းလုပ်ဆောင်ပေးမည့် အချက်များ ဖြစ်ပါသည်။
                </p>

                <div className="constraint-grid">
                    <div className="constraint-card soft-card">
                        <div className="icon-wrapper">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
                        </div>
                        <div className="constraint-content">
                            <h3>Consecutive Subject Blocks</h3>
                            <p>ဘာသာရပ်တစ်ခုတည်းကို ဆက်တိုက် (၂) ချိန် သင်ကြားခြင်းမျိုးကို ပိုမိုဦးစားပေး စီစဉ်ပေးပါသည်။ (Reward System)</p>
                        </div>
                    </div>

                    <div className="constraint-card soft-card">
                        <div className="icon-wrapper">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>
                        </div>
                        <div className="constraint-content">
                            <h3>Teacher Consecutive Fatigue</h3>
                            <p>ဆရာ/ဆရာမများ အနေဖြင့် တစ်နေ့တာတွင် အတန်းချိန် (၃) ချိန်ထက်ပို၍ ဆက်တိုက် (နားချိန်မရှိဘဲ) သင်ကြားရခြင်းမျိုး မဖြစ်စေရန် ထိန်းချုပ်ပေးပါသည်။</p>
                        </div>
                    </div>

                    <div className="constraint-card soft-card">
                        <div className="icon-wrapper">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>
                        </div>
                        <div className="constraint-content">
                            <h3>Student Class Compression</h3>
                            <p>ကျောင်းသားများ ကျောင်းတွင် အလဟသ အချိန်ကုန်စောင့်ဆိုင်းရခြင်း မရှိစေရန် အတန်းချိန်များကြားရှိ အလွတ်ချိန် (Empty Gaps) များကို အနည်းဆုံးဖြစ်အောင် စုစည်းစီစဉ်ပေးပါသည်။</p>
                        </div>
                    </div>

                    <div className="constraint-card soft-card">
                        <div className="icon-wrapper">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
                        </div>
                        <div className="constraint-content">
                            <h3>Part-time Teacher Compression</h3>
                            <p>အချိန်ပိုင်း (Part-time) ဆရာ/ဆရာမများအတွက် အတန်းများကို ကြားချိန်မရှိဘဲ ဆက်တိုက်ဖြစ်အောင် စီစဉ်ပေးခြင်းဖြင့် သူတို့၏ အချိန်ကို အကျိုးရှိစွာ အသုံးချနိုင်စေပါသည်။</p>
                        </div>
                    </div>

                    <div className="constraint-card soft-card">
                        <div className="icon-wrapper">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
                        </div>
                        <div className="constraint-content">
                            <h3>Subject Fatigue Control</h3>
                            <p>ကျောင်းသားများ စာသင်ယူရာတွင် ပင်ပန်းမှုမရှိစေရန် ခက်ခဲသော ဘာသာရပ်တစ်ခုတည်းကို တစ်နေ့လျှင် (၂) ချိန်ထက် ပို၍ မသင်စေရန် အလိုအလျောက် ထိန်းချုပ်ပေးပါသည်။</p>
                        </div>
                    </div>

                    <div className="constraint-card soft-card">
                        <div className="icon-wrapper">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                        </div>
                        <div className="constraint-content">
                            <h3>Concurrent Elective Blocks</h3>
                            <p>ရွေးချယ်ခွင့်ရှိသော (Elective) ဘာသာရပ်ကွဲများကို အချိန်ဇယား၏ တူညီသော အချိန်ကာလ (Time Block) တစ်ခုတည်းတွင် အတူတကွ ကျရောက်စေရန် (Gravity) စနစ်ဖြင့် ဆွဲငင်စုစည်းပေးပါသည်။</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}