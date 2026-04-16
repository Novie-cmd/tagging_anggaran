/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { OPD, Program, Activity, SubActivity, Tag, BudgetTag } from './types';

export const INITIAL_OPDS: OPD[] = [
  { id: '1', code: '1.01', name: 'Dinas Pendidikan dan Kebudayaan' },
  { id: '2', code: '1.02', name: 'Dinas Kesehatan' },
  { id: '3', code: '1.03', name: 'Dinas Pekerjaan Umum dan Penataan Ruang' },
  { id: '4', code: '1.04', name: 'Dinas Sosial' },
  { id: '5', code: '1.05', name: 'Badan Perencanaan Pembangunan Daerah' },
];

export const INITIAL_PROGRAMS: Program[] = [
  { id: 'p1', code: '1.01.01', name: 'Program Penunjang Urusan Pemerintahan', opdId: '1' },
  { id: 'p2', code: '1.02.02', name: 'Program Pemenuhan Upaya Kesehatan Masyarakat', opdId: '2' },
];

export const INITIAL_ACTIVITIES: Activity[] = [
  { id: 'a1', code: '1.01.01.2.01', name: 'Perencanaan, Penganggaran, dan Evaluasi', programId: 'p1' },
  { id: 'a2', code: '1.02.02.2.02', name: 'Penyediaan Layanan Kesehatan untuk UKM', programId: 'p2' },
];

export const INITIAL_SUB_ACTIVITIES: SubActivity[] = [
  { id: 's1', code: '1.01.01.2.01.01', name: 'Penyusunan Dokumen Perencanaan', activityId: 'a1', budget: 500000000 },
  { id: 's2', code: '1.02.02.2.02.05', name: 'Pengadaan Obat dan Perbekalan Kesehatan', activityId: 'a2', budget: 1250000000 },
  { id: 's3', code: '1.02.02.2.02.06', name: 'Pemberian Makanan Tambahan Balita Stunting', activityId: 'a2', budget: 750000000 },
];

export const INITIAL_TAGS: Tag[] = [
  { id: 't1', name: 'Prioritas Nasional', type: 'Prioritas Nasional', color: '#3b82f6' },
  { id: 't2', name: 'Kemiskinan Extreme', type: 'Daerah', color: '#ef4444' },
  { id: 't3', name: 'Investasi', type: 'Daerah', color: '#10b981' },
  { id: 't4', name: 'Digitalisasi', type: 'Daerah', color: '#8b5cf6' },
  { id: 't5', name: 'Stunting', type: 'Daerah', color: '#f59e0b' },
];

export const INITIAL_BUDGET_TAGS: BudgetTag[] = [
  { subActivityId: 's3', tagId: 't5' },
  { subActivityId: 's3', tagId: 't1' },
];
