// src/lib/mcp/engine.ts

import Clients from '@/models/Client';
import { IClient } from '@/types/Client';
import { decryptClient } from '@/lib/clientEncryption';

export interface SimplifiedClient {
  _id: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  preferences: string[];
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
    match?: string;
    currentMonth?: boolean;
  }[];
  maxCriteriaUsed?: number;
  minGroupSize?: number;
}

const DEFAULT_MIN_GROUP_SIZE = 3;
const DEFAULT_MAX_CRITERIA = 5;
const MIN_ALLOWED_GROUP_SIZE = 3;
const MAX_ALLOWED_CRITERIA = 5;

function extractGroupValue(client: SimplifiedClient, criterion: keyof SimplifiedClient): string {
  if (criterion === 'birthDate') {
    const date = new Date(client.birthDate);
    if (isNaN(date.getTime())) return 'Unknown';
    return `Month-${date.getMonth() + 1}`;
  }
  const value = client[criterion];
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value[0] || 'Unknown';
  return 'Unknown';
}

export async function generateCampaignStrategy(custom?: CustomSegmentRequest): Promise<CampaignStrategyResult> {
  const rawClients = await Clients.find({}, {
    _id: 1,
    firstName: 1,
    lastName: 1,
    birthDate: 1,
    preferences: 1,
    tags: 1,
    subscriptions: 1,
    preferredContactMethod: 1,
    telegram: 1
  }).lean();

  const decryptedClients = rawClients.map(decryptClient);

  const clients: SimplifiedClient[] = decryptedClients.map((c: any) => ({
    _id: c._id.toString(),
    firstName: c.firstName,
    lastName: c.lastName,
    birthDate: c.birthDate,
    preferences: c.preferences,
    tags: c.tags,
    subscriptions: c.subscriptions,
    preferredContactMethod: c.preferredContactMethod,
    telegramConfirmed: c.telegram?.isConfirmed || false
  }));

  const total = clients.length;
  const segments: Record<string, SegmentGroup[]> = {};
  const clientCovered = new Set<string>();

  const availableCriteria: (keyof SimplifiedClient)[] = [
    'firstName',
    'birthDate',
    'preferences',
    'tags',
    'subscriptions',
    'preferredContactMethod',
    'telegramConfirmed'
  ];

  if (custom?.filters && custom.filters.length > 0) {
    for (const client of clients) {
      for (const filter of custom.filters) {
        const { field, match, currentMonth } = filter;
        let value = extractGroupValue(client, field);

        if (value === 'Unknown') continue;

        if (currentMonth && field === 'birthDate') {
          const now = new Date();
          const birth = new Date(client.birthDate);
          if (now.getMonth() !== birth.getMonth()) continue;
        } else if (match && value !== match) {
          continue;
        }

        const key = `${field}:${value}`;
        if (!segments[field]) segments[field] = [];

        let existing = segments[field].find(g => g.value === value);
        if (!existing) {
          existing = {
            criterion: field,
            value,
            clientIds: [],
            reason: `Clientes con ${field} = ${value}`
          };
          segments[field].push(existing);
        }

        existing.clientIds.push(client._id);
        clientCovered.add(client._id);
      }
    }
    if (clientCovered.size === 0) {
      return {
        coverage: 0,
        totalClients: total,
        selectedClients: [],
        segmentGroups: [],
        message: 'No es posible realizar la segmentación mediante la solicitud brindada.'
      };
    }
  } else {
    const groupByCriterion: Record<string, { totalCovered: number, groups: SegmentGroup[] }> = {};
    for (const crit of availableCriteria) {
      const groups: Record<string, SegmentGroup> = {};
      let covered = new Set<string>();
      for (const client of clients) {
        const value = extractGroupValue(client, crit);
        if (value === 'Unknown') continue;

        const key = `${crit}:${value}`;
        if (!groups[key]) {
          groups[key] = {
            criterion: crit,
            value,
            clientIds: [],
            reason: `Grupo de clientes con ${crit} = ${value}`
          };
        }
        groups[key].clientIds.push(client._id);
        covered.add(client._id);
      }
      groupByCriterion[crit] = {
        totalCovered: covered.size,
        groups: Object.values(groups).filter(g => g.clientIds.length >= (custom?.minGroupSize || DEFAULT_MIN_GROUP_SIZE))
      };
    }

    const maxCrit = Math.min(custom?.maxCriteriaUsed || DEFAULT_MAX_CRITERIA, MAX_ALLOWED_CRITERIA);
    const sorted = Object.entries(groupByCriterion)
        .sort((a, b) => b[1].totalCovered - a[1].totalCovered)
        .slice(0, maxCrit);

    for (const [crit, { groups }] of sorted) {
      if (!segments[crit]) segments[crit] = [];
      segments[crit].push(...groups);
      groups.forEach(g => g.clientIds.forEach(id => clientCovered.add(id)));
    }
  }

  const finalGroups = Object.values(segments).flat();

  return {
    coverage: clientCovered.size / total,
    totalClients: total,
    selectedClients: Array.from(clientCovered),
    segmentGroups: finalGroups
  };
}
