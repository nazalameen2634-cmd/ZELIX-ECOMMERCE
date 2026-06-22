import { createClient } from '@supabase/supabase-js';

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const sanitizedUrl = rawUrl.trim().replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || '';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.warn(
    'Supabase environment variables (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY) are missing. Fallback to local storage or mocked DB states will be active.'
  );
}

const rawSupabase = createClient(sanitizedUrl, supabaseAnonKey);

const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || '';
const rawSupabaseAdmin = createClient(sanitizedUrl, supabaseServiceKey || supabaseAnonKey);

const isRealSupabase = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
  !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-project-id') &&
  !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder-project')
);

// High-fidelity Mock Datasets
const MOCK_CATEGORIES = [
  { id: 'cat-1', name: 'OUTERWEAR', slug: 'outerwear', description: null, image_url: null, parent_id: null, sort_order: 1, created_at: '' },
  { id: 'cat-2', name: 'FOOTWEAR', slug: 'footwear', description: null, image_url: null, parent_id: null, sort_order: 2, created_at: '' },
  { id: 'cat-3', name: 'APPAREL', slug: 'apparel', description: null, image_url: null, parent_id: null, sort_order: 3, created_at: '' },
  { id: 'cat-4', name: 'ACCESSORIES', slug: 'accessories', description: null, image_url: null, parent_id: null, sort_order: 4, created_at: '' },
];

const MOCK_PRODUCTS = [
  {
    id: 'p-1',
    title: 'MATRIX PARKA COAT',
    slug: 'matrix-parka-coat',
    price: 26000,
    sale_price: 21999,
    sale_start: null,
    sale_end: null,
    description: 'Immersive full-length technical coat. Waterproof membrane, magnetic collar lock, and adjustable harness system.',
    category_id: 'cat-1',
    sku: 'ZLX-OUT-MPK',
    stock_quantity: 12,
    track_inventory: true,
    allow_backorders: false,
    status: 'draft',
    meta_title: '',
    meta_description: '',
    tags: ['OUTERWEAR', 'PREMIUM'],
    created_at: '2026-06-18T12:00:00Z',
    updated_at: '2026-06-18T12:00:00Z',
    og_image_url: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'p-2',
    title: 'SILENT RUNNER BOOTS',
    slug: 'silent-runner-boots',
    price: 38000,
    sale_price: null,
    sale_start: null,
    sale_end: null,
    description: 'Chunky hybrid combat boot featuring vibram sole, quick-lace locking mechanism, and premium Italian distressed leather.',
    category_id: 'cat-2',
    sku: 'ZLX-FOT-SRB',
    stock_quantity: 5,
    track_inventory: true,
    allow_backorders: false,
    status: 'draft',
    meta_title: '',
    meta_description: '',
    tags: ['FOOTWEAR', 'LIMITED'],
    created_at: '2026-06-18T12:00:00Z',
    updated_at: '2026-06-18T12:00:00Z',
    og_image_url: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'p-3',
    title: 'ECLIPSE OVERSIZED HOODIE',
    slug: 'eclipse-oversized-hoodie',
    price: 12000,
    sale_price: null,
    sale_start: null,
    sale_end: null,
    description: 'Heavyweight 500GSM organic cotton hoodie. Drop shoulder silhouette, invisible side pockets, and raw-edge seam details.',
    category_id: 'cat-3',
    sku: 'ZLX-APP-EOH',
    stock_quantity: 24,
    track_inventory: true,
    allow_backorders: false,
    status: 'draft',
    meta_title: '',
    meta_description: '',
    tags: ['APPAREL', 'ESSENTIALS'],
    created_at: '2026-06-18T12:00:00Z',
    updated_at: '2026-06-18T12:00:00Z',
    og_image_url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'p-4',
    title: 'KINETIC UTILITY TROUSERS',
    slug: 'kinetic-utility-trousers',
    price: 18000,
    sale_price: 14999,
    sale_start: null,
    sale_end: null,
    description: 'Ergonomic shape trousers with modular cargo compartments, articulated knees, and custom nylon web belt.',
    category_id: 'cat-3',
    sku: 'ZLX-APP-KUT',
    stock_quantity: 8,
    track_inventory: true,
    allow_backorders: false,
    status: 'draft',
    meta_title: '',
    meta_description: '',
    tags: ['APPAREL', 'UTILITY'],
    created_at: '2026-06-18T12:00:00Z',
    updated_at: '2026-06-18T12:00:00Z',
    og_image_url: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'p-5',
    title: 'SOLSTICE GLASSES',
    slug: 'solstice-glasses',
    price: 9000,
    sale_price: null,
    sale_start: null,
    sale_end: null,
    description: 'Acetate frame sunglasses. 100% UV protection, steel custom hardware, and signature dark tint.',
    category_id: 'cat-4',
    sku: 'ZLX-ACC-SLG',
    stock_quantity: 15,
    track_inventory: true,
    allow_backorders: false,
    status: 'draft',
    meta_title: '',
    meta_description: '',
    tags: ['ACCESSORIES', 'GLASSES'],
    created_at: '2026-06-18T12:00:00Z',
    updated_at: '2026-06-18T12:00:00Z',
    og_image_url: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=600&auto=format&fit=crop',
  }
];

const MOCK_ORDERS = [
  {
    id: 'ORD-10087',
    order_number: 'ORD-10087',
    email: 'client@zelix.design',
    created_at: '2026-06-18T16:00:00Z',
    shipping_address: {
      full_name: 'ALEXANDER MERCER',
      phone: '+91 98765 43210',
      address_line1: '404 TACTICAL RESIDENCE',
      address_line2: 'LEVEL 4, DISTRICT 9',
      city: 'BANGALORE',
      state: 'KARNATAKA',
      zip: '560001',
      country: 'INDIA'
    },
    billing_address: {
      full_name: 'ALEXANDER MERCER',
      phone: '+91 98765 43210',
      address_line1: '404 TACTICAL RESIDENCE',
      address_line2: 'LEVEL 4, DISTRICT 9',
      city: 'BANGALORE',
      state: 'KARNATAKA',
      zip: '560001',
      country: 'INDIA'
    },
    shipping_method: 'EXPRESS COURIER',
    shipping_cost: 150,
    subtotal: 7800,
    discount_amount: 500,
    tax_amount: 1404,
    total: 8854,
    coupon_code: 'ZELIX500',
    payment_status: 'paid',
    fulfillment_status: 'processing',
    tracking_number: 'BLUEDART12345',
    tracking_carrier: 'BLUE DART',
    order_items: [
      {
        id: 'item-1',
        title: 'ECLIPSE OVERSIZED HOODIE',
        variant_info: { size: 'XL', color: 'MATTE BLACK' },
        quantity: 1,
        unit_price: 5200,
        line_total: 5200
      },
      {
        id: 'item-2',
        title: 'SOLSTICE TECHNICAL GLASSES',
        variant_info: { size: 'OS', color: 'DARK TINTED' },
        quantity: 2,
        unit_price: 1300,
        line_total: 2600
      }
    ],
    order_timeline: [
      {
        id: 't-1',
        order_id: 'ORD-10087',
        status: 'placed',
        note: 'Order placed by client.',
        created_at: '2026-06-18T16:00:00Z'
      },
      {
        id: 't-2',
        order_id: 'ORD-10087',
        status: 'paid',
        note: 'Payment authorized via Razorpay.',
        created_at: '2026-06-18T16:10:00Z'
      }
    ]
  },
  {
    id: 'ORD-10086',
    order_number: 'ORD-10086',
    email: 'karan.s@gmail.com',
    created_at: '2026-06-17T12:00:00Z',
    shipping_address: {
      full_name: 'KARAN SHARMA',
      phone: '+91 99999 88888',
      address_line1: '12 RAJPUT ROAD',
      address_line2: 'DEFENCE COLONY',
      city: 'NEW DELHI',
      state: 'DELHI',
      zip: '110024',
      country: 'INDIA'
    },
    billing_address: {
      full_name: 'KARAN SHARMA',
      phone: '+91 99999 88888',
      address_line1: '12 RAJPUT ROAD',
      address_line2: 'DEFENCE COLONY',
      city: 'NEW DELHI',
      state: 'DELHI',
      zip: '110024',
      country: 'INDIA'
    },
    shipping_method: 'STANDARD SHIPPING',
    shipping_cost: 0,
    subtotal: 26000,
    discount_amount: 0,
    tax_amount: 4680,
    total: 30680,
    coupon_code: '',
    payment_status: 'paid',
    fulfillment_status: 'shipped',
    tracking_number: 'DELHIVERY987654',
    tracking_carrier: 'DELHIVERY',
    order_items: [
      {
        id: 'item-3',
        title: 'MATRIX PARKA COAT',
        variant_info: { size: 'M', color: 'STEALTH BLACK' },
        quantity: 1,
        unit_price: 26000,
        line_total: 26000
      }
    ],
    order_timeline: [
      {
        id: 't-3',
        order_id: 'ORD-10086',
        status: 'placed',
        note: 'Order placed by client.',
        created_at: '2026-06-17T12:00:00Z'
      },
      {
        id: 't-4',
        order_id: 'ORD-10086',
        status: 'paid',
        note: 'Payment authorized.',
        created_at: '2026-06-17T12:10:00Z'
      },
      {
        id: 't-5',
        order_id: 'ORD-10086',
        status: 'shipped',
        note: 'Package handed over to DHL/Delhivery.',
        created_at: '2026-06-17T18:00:00Z'
      }
    ]
  }
];

// Helper functions for localized Storage
function getTableData(table: string) {
  if (typeof window !== 'undefined') {
    const data = localStorage.getItem(`zelix_db_${table}`);
    if (data) {
      return JSON.parse(data);
    }
    let defaultData: any[] = [];
    if (table === 'products') defaultData = MOCK_PRODUCTS;
    else if (table === 'categories') defaultData = MOCK_CATEGORIES;
    else if (table === 'orders') defaultData = MOCK_ORDERS;
    else if (table === 'order_timeline') {
      defaultData = [];
      MOCK_ORDERS.forEach(o => {
        if (o.order_timeline) {
          defaultData.push(...o.order_timeline);
        }
      });
    }
    else if (table === 'order_items') {
      defaultData = [];
      MOCK_ORDERS.forEach(o => {
        if (o.order_items) {
          defaultData.push(...o.order_items.map(item => ({ ...item, order_id: o.id })));
        }
      });
    }
    localStorage.setItem(`zelix_db_${table}`, JSON.stringify(defaultData));
    return defaultData;
  }
  
  if (table === 'products') return MOCK_PRODUCTS;
  if (table === 'categories') return MOCK_CATEGORIES;
  if (table === 'orders') return MOCK_ORDERS;
  if (table === 'order_timeline') {
    const timelines: any[] = [];
    MOCK_ORDERS.forEach(o => {
      if (o.order_timeline) {
        timelines.push(...o.order_timeline);
      }
    });
    return timelines;
  }
  if (table === 'order_items') {
    const items: any[] = [];
    MOCK_ORDERS.forEach(o => {
      if (o.order_items) {
        items.push(...o.order_items.map(item => ({ ...item, order_id: o.id })));
      }
    });
    return items;
  }
  return [];
}

function setTableData(table: string, data: any) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(`zelix_db_${table}`, JSON.stringify(data));
  }
}

// Mock Query Builder Implementation to match Supabase's JS API
class MockBuilder {
  table: string;
  filters: ((item: any) => boolean)[];
  orderField: string | null;
  orderAscending: boolean;
  limitVal: number | null;
  isSingle: boolean;
  rangeStart: number | null;
  rangeEnd: number | null;
  action: 'select' | 'insert' | 'update' | 'delete';
  payload: any;

  constructor(table: string) {
    this.table = table;
    this.filters = [];
    this.orderField = null;
    this.orderAscending = false;
    this.limitVal = null;
    this.isSingle = false;
    this.rangeStart = null;
    this.rangeEnd = null;
    this.action = 'select';
  }

  select(fields?: string) {
    this.action = 'select';
    return this;
  }

  insert(payload: any) {
    this.action = 'insert';
    this.payload = payload;
    return this;
  }

  update(payload: any) {
    this.action = 'update';
    this.payload = payload;
    return this;
  }

  delete() {
    this.action = 'delete';
    return this;
  }

  eq(column: string, value: any) {
    this.filters.push((item) => item[column] === value);
    return this;
  }

  neq(column: string, value: any) {
    this.filters.push((item) => item[column] !== value);
    return this;
  }

  gte(column: string, value: any) {
    this.filters.push((item) => item[column] >= value);
    return this;
  }

  lte(column: string, value: any) {
    this.filters.push((item) => item[column] <= value);
    return this;
  }

  or(filterStr: string) {
    const parts = filterStr.split(',');
    this.filters.push((item) => {
      return parts.some(part => {
        const match = part.trim().match(/^(\w+)\.(\w+)\.(.+)$/);
        if (match) {
          const [_, col, op, val] = match;
          if (op === 'ilike') {
            const searchVal = val.replace(/%/g, '').toLowerCase();
            return String(item[col] || '').toLowerCase().includes(searchVal);
          }
        }
        return false;
      });
    });
    return this;
  }

  order(column: string, { ascending = true } = {}) {
    this.orderField = column;
    this.orderAscending = ascending;
    return this;
  }

  limit(count: number) {
    this.limitVal = count;
    return this;
  }

  range(from: number, to: number) {
    this.rangeStart = from;
    this.rangeEnd = to;
    return this;
  }

  single() {
    this.isSingle = true;
    return this;
  }

  async then(resolve: any, reject: any) {
    try {
      const result = await this.execute();
      resolve(result);
    } catch (e) {
      if (reject) reject(e);
    }
  }

  async execute() {
    let data = getTableData(this.table);

    if (this.action === 'select') {
      for (const filter of this.filters) {
        data = data.filter(filter);
      }

      if (this.orderField) {
        const col = this.orderField;
        const asc = this.orderAscending;
        data = [...data].sort((a, b) => {
          const valA = a[col];
          const valB = b[col];
          if (valA < valB) return asc ? -1 : 1;
          if (valA > valB) return asc ? 1 : -1;
          return 0;
        });
      }

      data = data.map((item: any) => {
        const copy = { ...item };
        
        if (this.table === 'products' && copy.category_id) {
          const cats = getTableData('categories');
          copy.categories = cats.find((c: any) => c.id === copy.category_id) || null;
        }

        if (this.table === 'orders') {
          const items = getTableData('order_items');
          copy.order_items = items.filter((i: any) => i.order_id === copy.id);

          const timeline = getTableData('order_timeline');
          copy.order_timeline = timeline.filter((t: any) => t.order_id === copy.id)
            .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        }

        return copy;
      });

      if (this.rangeStart !== null && this.rangeEnd !== null) {
        data = data.slice(this.rangeStart, this.rangeEnd + 1);
      } else if (this.limitVal !== null) {
        data = data.slice(0, this.limitVal);
      }

      if (this.isSingle) {
        return { data: data[0] || null, error: data[0] ? null : { message: 'Not found' } };
      }

      return { data, error: null };
    }

    if (this.action === 'insert') {
      const rowsToInsert = Array.isArray(this.payload) ? this.payload : [this.payload];
      const insertedRows = rowsToInsert.map(row => {
        const newRow = {
          id: row.id || `mock-${Math.random().toString(36).substring(2, 9)}`,
          order_number: row.order_number || (this.table === 'orders' ? `ORD-${Math.floor(10000 + Math.random() * 90000)}` : undefined),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          ...row
        };
        return newRow;
      });

      const updatedData = [...insertedRows, ...data];
      setTableData(this.table, updatedData);

      if (this.table === 'orders') {
        insertedRows.forEach(order => {
          const timelines = getTableData('order_timeline');
          timelines.push({
            id: `t-mock-${Math.random().toString(36).substring(2, 9)}`,
            order_id: order.id,
            status: order.fulfillment_status || 'placed',
            note: 'Order placed by client.',
            created_at: new Date().toISOString()
          });
          setTableData('order_timeline', timelines);
        });
      }

      if (this.isSingle || !Array.isArray(this.payload)) {
        return { data: insertedRows[0], error: null };
      }
      return { data: insertedRows, error: null };
    }

    if (this.action === 'update') {
      const updatedData = data.map((item: any) => {
        const matches = this.filters.every(filter => filter(item));
        if (matches) {
          return {
            ...item,
            ...this.payload,
            updated_at: new Date().toISOString()
          };
        }
        return item;
      });

      setTableData(this.table, updatedData);
      const returnedData = updatedData.filter((item: any) => this.filters.every(filter => filter(item)));
      
      if (this.isSingle) {
        return { data: returnedData[0] || null, error: null };
      }
      return { data: returnedData, error: null };
    }

    if (this.action === 'delete') {
      const remainingData = data.filter((item: any) => !this.filters.every(filter => filter(item)));
      setTableData(this.table, remainingData);
      return { data: null, error: null };
    }

    return { data: null, error: null };
  }
}

// Proxied supabase client returning High-Fidelity Mock DB operations when offline
export const supabase = new Proxy(rawSupabase, {
  get(target, prop, receiver) {
    if (!isRealSupabase) {
      if (prop === 'from') {
        return (table: string) => {
          return new MockBuilder(table) as any;
        };
      }
      if (prop === 'storage') {
        return {
          from: (bucket: string) => {
            return {
              upload: async (path: string, file: any) => {
                return { data: { path }, error: null };
              },
              getPublicUrl: (path: string) => {
                return { data: { publicUrl: path } };
              },
              remove: async (paths: string[]) => {
                return { data: null, error: null };
              }
            } as any;
          }
        };
      }
    }
    return Reflect.get(target, prop, receiver);
  }
});

export const supabaseAdmin = new Proxy(rawSupabaseAdmin, {
  get(target, prop, receiver) {
    if (!isRealSupabase) {
      if (prop === 'from') {
        return (table: string) => {
          return new MockBuilder(table) as any;
        };
      }
      if (prop === 'storage') {
        return {
          from: (bucket: string) => {
            return {
              upload: async (path: string, file: any) => {
                return { data: { path }, error: null };
              },
              getPublicUrl: (path: string) => {
                return { data: { publicUrl: path } };
              },
              remove: async (paths: string[]) => {
                return { data: null, error: null };
              }
            } as any;
          }
        };
      }
    }
    return Reflect.get(target, prop, receiver);
  }
});

