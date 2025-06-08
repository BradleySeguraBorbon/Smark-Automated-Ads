import Clients from '@/models/Client';
import { IClient } from '@/types/Client';
import { decryptClient } from '@/lib/clientEncryption';
import connectDB from '@/config/db';

/* --------------------------------------------------
 *  Types
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
    match?: string | string[];
    currentMonth?: boolean;
    min?: string;
    max?: string;
  }[];
  maxCriteriaUsed?: number;
  minGroupSize?: number;
}

/* --------------------------------------------------
 *  Constants
 * --------------------------------------------------*/
const DEFAULT_MIN_GROUP_SIZE = 3;
const DEFAULT_MAX_CRITERIA = 5;

/* --------------------------------------------------
 *  Helpers
 * --------------------------------------------------*/
function getFieldValues(client: SimplifiedClient, field: keyof SimplifiedClient): string[] {
  if (field === 'birthDate') {
    const d = new Date(client.birthDate);
    return isNaN(d.getTime()) ? ['Unknown'] : [`Month-${d.getMonth() + 1}`];
  }
  const raw: any = client[field];
  if (raw === undefined || raw === null) return ['Unknown'];
  if (Array.isArray(raw)) return raw.length ? raw : ['Unknown'];
  if (typeof raw === 'boolean') return [raw.toString()];
  return [raw as string];
}

function extractGroupValue(c: SimplifiedClient, f: keyof SimplifiedClient) {
  return getFieldValues(c, f)[0];
}

function intersect(a: string[], b: string[]) {
  return a.some(v => b.includes(v));
}

/* --------------------------------------------------
 *  Main entry
 * --------------------------------------------------*/
export async function generateCampaignStrategy(custom?: CustomSegmentRequest): Promise<CampaignStrategyResult> {
  await connectDB();

  const raw = await Clients.find({}).lean();
  const clients: SimplifiedClient[] = ((raw as unknown) as IClient[]).map((r: any) => decryptClient({ ...r, _id: r._id.toString() })).map((c: any) => ({
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
  const segments: Record<string, SegmentGroup[]> = {};
  const covered = new Set<string>();

  /* ---------- Custom filters path ---------- */
  if (custom?.filters?.length) {
    clients.forEach((client) => {
      let ok = true;

      for (const f of custom.filters!) {
        const values = getFieldValues(client, f.field);

        // birthDate special rules
        if (f.field === 'birthDate') {
          const birth = new Date(client.birthDate);
          if (isNaN(birth.getTime())) { ok = false; break; }
          if (f.currentMonth && birth.getMonth() !== new Date().getMonth()) { ok = false; break; }
          if (f.min && birth < new Date(f.min)) { ok = false; break; }
          if (f.max && birth > new Date(f.max)) { ok = false; break; }
        }

        if (f.match) {
          const allowed = Array.isArray(f.match) ? f.match : [f.match];
          const wantsMissing = allowed.includes('__MISSING__');
          const clientMissing = values.every(v => v === 'Unknown' || v === '');
          const matches = wantsMissing ? clientMissing : intersect(values, allowed);
          if (!matches) { ok = false; break; }
        }
      }

      if (!ok) return;

      // add client to segments for **each** value of each filter
      custom.filters!.forEach(({ field }) => {
        getFieldValues(client, field).forEach((v) => {
          const list = segments[field] ?? (segments[field] = []);
          let group = list.find(g => g.value === v);
          if (!group) list.push(group = { criterion: field, value: v, clientIds: [], reason: `Clients with ${field} = ${v}` });
          group.clientIds.push(client._id);
        });
      });
      covered.add(client._id);
    });

    if (!covered.size) {
      return { coverage: 0, totalClients: total, selectedClients: [], segmentGroups: [], message: 'No clients matched the provided filters.' };
    }
  } else {
    /* ---------- Automatic grouping path ---------- */
    const criteria: (keyof SimplifiedClient)[] = ['birthDate', 'preferences', 'gender', 'country', 'languages', 'tags', 'subscriptions', 'preferredContactMethod', 'telegramConfirmed'];
    criteria.slice(0, custom?.maxCriteriaUsed ?? DEFAULT_MAX_CRITERIA).forEach((crit) => {
      const groups: Record<string, SegmentGroup> = {};

      clients.forEach((client) => {
        getFieldValues(client, crit).forEach((v) => {
          if (v === 'Unknown') return;
          const key = `${crit}:${v}`;
          groups[key] = groups[key] ?? { criterion: crit, value: v, clientIds: [], reason: `Clients with ${crit} = ${v}` };
          groups[key].clientIds.push(client._id);
        });
      });

      Object.values(groups)
        .filter(g => g.clientIds.length >= (custom?.minGroupSize ?? DEFAULT_MIN_GROUP_SIZE))
        .forEach((g) => {
          (segments[crit] = segments[crit] ?? []).push(g);
          g.clientIds.forEach(id => covered.add(id));
        });
    });
  }

  const segmentGroups = Object.values(segments).flat();
  const coveragePct = ((covered.size / total) * 100).toFixed(1);

  return {
    coverage: covered.size / total,
    totalClients: total,
    selectedClients: Array.from(covered),
    segmentGroups,
    message: `Created ${segmentGroups.length} segments covering ${coveragePct}% of your clients.`
  };
}
