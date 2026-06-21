'use client';

import React, { useState } from 'react';

const sizeData = {
  tops: {
    label: 'TOPS / HOODIES / JACKETS',
    headers: ['SIZE', 'CHEST (CM)', 'SHOULDER (CM)', 'LENGTH (CM)', 'SLEEVE (CM)'],
    rows: [
      ['XS', '84–88', '40–42', '66–68', '60–62'],
      ['S',  '90–94', '43–45', '68–70', '62–64'],
      ['M',  '96–100','46–48', '70–72', '64–66'],
      ['L',  '102–106','49–51','72–74', '66–68'],
      ['XL', '108–112','52–54','74–76', '68–70'],
      ['XXL','114–118','55–57','76–78', '70–72'],
    ],
  },
  bottoms: {
    label: 'BOTTOMS / PANTS / SHORTS',
    headers: ['SIZE', 'WAIST (CM)', 'HIP (CM)', 'INSEAM (CM)', 'RISE (CM)'],
    rows: [
      ['28 / XS', '68–72',  '88–92',  '76', '26'],
      ['30 / S',  '74–78',  '94–98',  '78', '27'],
      ['32 / M',  '80–84',  '100–104','80', '28'],
      ['34 / L',  '86–90',  '106–110','82', '29'],
      ['36 / XL', '92–96',  '112–116','84', '30'],
      ['38 / XXL','98–102', '118–122','86', '31'],
    ],
  },
  footwear: {
    label: 'FOOTWEAR',
    headers: ['EU', 'UK', 'US', 'CM'],
    rows: [
      ['38', '5', '6',   '24.0'],
      ['39', '6', '7',   '24.7'],
      ['40', '7', '8',   '25.4'],
      ['41', '8', '9',   '26.0'],
      ['42', '9', '10',  '26.7'],
      ['43', '9.5','10.5','27.3'],
      ['44', '10','11',  '28.0'],
      ['45', '11','12',  '28.7'],
    ],
  },
};

export default function SizeGuidePage() {
  const [active, setActive] = useState<'tops' | 'bottoms' | 'footwear'>('tops');

  const current = sizeData[active];

  return (
    <div className="bg-black text-white min-h-screen">
      {/* Hero */}
      <section className="border-b border-white/5 py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <span className="font-mono text-[9px] tracking-[0.3em] text-neutral-500 uppercase block mb-4">ZELIX / SIZING</span>
          <h1 className="font-black text-[40px] md:text-[60px] uppercase tracking-wide leading-none mb-6">
            SIZE<br />GUIDE
          </h1>
          <p className="font-mono text-[12px] text-neutral-400 max-w-lg leading-relaxed tracking-wide">
            ALL MEASUREMENTS ARE IN CENTIMETRES UNLESS NOTED. WE RECOMMEND MEASURING YOURSELF AND COMPARING TO OUR SIZE CHART BEFORE ORDERING.
          </p>
        </div>
      </section>

      {/* How to Measure */}
      <section className="py-12 px-6 border-b border-white/5">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'CHEST', desc: 'MEASURE AROUND THE FULLEST PART OF YOUR CHEST, KEEPING THE TAPE HORIZONTAL.' },
            { label: 'WAIST', desc: 'MEASURE AROUND YOUR NATURAL WAISTLINE, KEEPING THE TAPE COMFORTABLY LOOSE.' },
            { label: 'HIPS', desc: 'STAND WITH FEET TOGETHER AND MEASURE AROUND THE FULLEST PART OF YOUR HIPS.' },
          ].map((tip, i) => (
            <div key={i} className="border border-white/5 rounded-sm p-6">
              <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center font-mono text-[10px] font-bold mb-4">{i + 1}</div>
              <span className="font-mono text-[9px] text-white tracking-widest uppercase font-bold block mb-2">{tip.label}</span>
              <p className="font-mono text-[10px] text-neutral-500 leading-relaxed tracking-wide">{tip.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Size Tables */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          {/* Tab Switcher */}
          <div className="flex gap-1 mb-10 border border-white/5 rounded-sm p-1 w-fit">
            {(Object.keys(sizeData) as Array<keyof typeof sizeData>).map((key) => (
              <button
                key={key}
                onClick={() => setActive(key)}
                className={`font-mono text-[9px] font-bold tracking-widest uppercase px-5 py-2.5 rounded-sm transition-all ${
                  active === key ? 'bg-white text-black' : 'text-neutral-500 hover:text-white'
                }`}
              >
                {key.toUpperCase()}
              </button>
            ))}
          </div>

          <h2 className="font-black text-[16px] uppercase tracking-wide mb-6">{current.label}</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-white/5">
                  {current.headers.map((h) => (
                    <th key={h} className="pb-3 pr-6 text-left font-mono text-[9px] text-neutral-500 tracking-widest uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {current.rows.map((row, i) => (
                  <tr key={i} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                    {row.map((cell, j) => (
                      <td key={j} className={`py-4 pr-6 font-mono text-[12px] ${j === 0 ? 'font-bold text-white' : 'text-neutral-400'}`}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-10 p-6 border border-white/5 rounded-sm bg-neutral-950">
            <p className="font-mono text-[10px] text-neutral-500 leading-relaxed tracking-wide">
              <span className="text-white font-bold">NOTE:</span> ZELIX garments are designed with an oversized, structured fit. If you prefer a more fitted look, we recommend sizing down. All measurements are approximate and may vary by ±2CM due to manufacturing tolerances.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
