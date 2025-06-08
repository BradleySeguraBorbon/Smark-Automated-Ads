import Clients from '@/models/Client';
import { IClient } from '@/types/Client';
import { decryptClient } from '@/lib/clientEncryption';
import connectDB from '@/config/db';

/* --------------------------------------------------
 *  Constants – tweak here only
 * --------------------------------------------------*/
export const MIN_GROUP_SIZE = 3;   // at least 3 clients per audience
export const MAX_SEGMENT_GROUPS = 5;   // never return more than 5 audiences
export const MAX_CRITERIA_TRIED = 8;   // how many different fields to inspect

/* --------------------------------------------------
 *  Types – unchanged
 * --------------------------------------------------*/
export interface SimplifiedClient {
  _id: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  preferences: string[];
  gender: string;
  country: string;
  languages: string[];
  tags: string[];
  subscriptions: string[];
  preferredContactMethod: string;
  telegramConfirmed: boolean;
}
export interface SegmentGroup {
  criterion: string;
  value: string;
  clientIds: string[];
  reason: string;
}

export interface CampaignStrategyResult {
  coverage: number;
  totalClients: number;
  selectedClients: string[];
  segmentGroups: SegmentGroup[];
  message?: string;
}

export interface CustomSegmentRequest {
  filters?: {
    field: keyof SimplifiedClient;
    match?: string[];
    currentMonth?: boolean;
    min?: string;
    max?: string;
  }[];
  maxCriteriaUsed?: number;
  minGroupSize?: number;
}

/* --------------------------------------------------
 *  Helpers
 * --------------------------------------------------*/
const toArray = (v?: string | string[]) =>
  Array.isArray(v) ? v : v ? [v] : [];

const intersect = (a: string[], b: string[]) =>
  a.some(v => b.includes(v));

const getFieldValues = (c: SimplifiedClient, f: keyof SimplifiedClient) => {
  if (f === 'birthDate') {
    const d = new Date(c.birthDate);
    return isNaN(d.getTime()) ? ['Unknown'] : [`Month-${d.getMonth() + 1}`];
  }
  const raw: any = c[f];
  if (raw === undefined || raw === null) return ['Unknown'];
  if (Array.isArray(raw)) return raw.length ? raw : ['Unknown'];
  if (typeof raw === 'boolean') return [raw.toString()];
  return [raw as string];
};

/* --------------------------------------------------
 *  Greedy selector – maximises unique coverage
 * --------------------------------------------------*/
function selectTopGroups(
  all: SegmentGroup[]
): { chosen: SegmentGroup[]; coveredIds: Set<string> } {
  const chosen: SegmentGroup[] = [];
  const covered = new Set<string>();

  while (chosen.length < MAX_SEGMENT_GROUPS && all.length) {
    // pick the group that adds the most *new* clients
    all.sort(
      (a, b) =>
        b.clientIds.filter(id => !covered.has(id)).length -
        a.clientIds.filter(id => !covered.has(id)).length
    );
    const best = all.shift()!;
    const newClients = best.clientIds.filter(id => !covered.has(id));
    if (newClients.length < MIN_GROUP_SIZE) break; // not useful
    chosen.push(best);
    newClients.forEach(id => covered.add(id));
  }
  return { chosen, coveredIds: covered };
}

/* --------------------------------------------------
 *  Main entry
 * --------------------------------------------------*/
export async function generateCampaignStrategy(
  custom?: CustomSegmentRequest
): Promise<CampaignStrategyResult> {
  await connectDB();

  const raw = await Clients.find({}).lean();
  const clients: SimplifiedClient[] = (raw as unknown as IClient[])
    .map(r => decryptClient({ ...r, _id: r._id.toString() }))
    .map((c: any) => ({
      _id: c._id,
      firstName: c.firstName ?? '',
      lastName: c.lastName ?? '',
      birthDate: c.birthDate ?? '',
      preferences: c.preferences ?? [],
      gender: c.gender ?? 'Unknown',
      country: c.country ?? 'Unknown',
      languages: c.languages ?? [],
      tags: c.tags ?? [],
      subscriptions: c.subscriptions ?? [],
      preferredContactMethod: c.preferredContactMethod ?? 'Unknown',
      telegramConfirmed: c.telegram?.isConfirmed ?? false,
    }));

  const total = clients.length;
  const buckets: Record<string, SegmentGroup[]> = {};

  /* ---------- 1. CUSTOM FILTERS ---------- */
  if (custom?.filters?.length) {
    clients.forEach(client => {
      const matchesAtLeastOne = custom.filters!.some(f => {
        const values = getFieldValues(client, f.field);

        // special birthDate rules
        if (f.field === 'birthDate') {
          const birth = new Date(client.birthDate);
          if (isNaN(birth.getTime())) return false;
          if (f.currentMonth && birth.getMonth() !== new Date().getMonth()) return false;
          if (f.min && birth < new Date(f.min)) return false;
          if (f.max && birth > new Date(f.max)) return false;
        }

        if (f.match) {
          const allowed = toArray(f.match);
          const wantsMissing = allowed.includes('__MISSING__');
          const isMissing = values.every(v => v === 'Unknown' || v === '');
          return wantsMissing ? isMissing : intersect(values, allowed);
        }

        return true;
      });

      if (!matchesAtLeastOne) return;

      // add client to segments *only* for allowed value(s)
      custom.filters!.forEach(({ field, match }) => {
        const allowed = toArray(match);
        getFieldValues(client, field).forEach(v => {
          if (allowed.length && !allowed.includes(v)) return;

          const key = `${field}:${v}`;
          const list = buckets[key] ?? (buckets[key] = []);
          let group = list[0];
          if (!group) list.push((group = { criterion: field, value: v, clientIds: [], reason: `Clients with ${field} = ${v}` }));
          group.clientIds.push(client._id);
        });
      });
    });
  }

  /* ---------- 2. AUTOMATIC GROUPING ---------- */
  else {
    const criteria: (keyof SimplifiedClient)[] = [
      'birthDate',
      'preferences',
      'gender',
      'country',
      'languages',
      'tags',
      'subscriptions',
      'preferredContactMethod',
      'telegramConfirmed',
    ];

    criteria.slice(0, MAX_CRITERIA_TRIED).forEach(crit => {
      const groups: Record<string, SegmentGroup> = {};

      clients.forEach(client => {
        getFieldValues(client, crit).forEach(v => {
          if (v === 'Unknown') return;
          const key = `${crit}:${v}`;
          groups[key] = groups[key] ?? { criterion: crit, value: v, clientIds: [], reason: `Clients with ${crit} = ${v}` };
          groups[key].clientIds.push(client._id);
        });
      });

      Object.values(groups)
        .filter(g => g.clientIds.length >= MIN_GROUP_SIZE)
        .forEach(g => (buckets[`${crit}:${g.value}`] = [g]));
    });
  }

  /* ---------- 3. FINAL SELECTION ---------- */
  const allGroups = Object.values(buckets).flat();
  const { chosen, coveredIds } = selectTopGroups(allGroups);

  const coverage = coveredIds.size / total;
  const pct = (coverage * 100).toFixed(1);

  return {
    coverage,
    totalClients: total,
    selectedClients: Array.from(coveredIds),
    segmentGroups: chosen,
    message: `Created ${chosen.length} segments covering ${pct}% of your clients.`,
  };
}
