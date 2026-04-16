/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface OPD {
  id: string;
  code: string;
  name: string;
}

export interface Program {
  id: string;
  code: string;
  name: string;
  opdId: string;
}

export interface Activity {
  id: string;
  code: string;
  name: string;
  programId: string;
}

export interface SubActivity {
  id: string;
  code: string;
  name: string;
  activityId: string;
  budget: number;
}

export interface Tag {
  id: string;
  name: string;
  type: 'Prioritas Nasional' | 'Tematik';
  color: string;
}

export interface BudgetTag {
  subActivityId: string;
  tagId: string;
}
