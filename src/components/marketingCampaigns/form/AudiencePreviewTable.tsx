'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import { ClientRef } from "@/types/Client";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/store";
import LoadingSpinner from "@/components/LoadingSpinner";

export function AudiencePreviewTable({
  clients: fallbackClients,
  isAiGenerated,
  campaignId
}: {
  clients?: ClientRef[];
  isAiGenerated?: boolean;
  campaignId?: string;
}) {
  const [clients, setClients] = useState<ClientRef[]>(fallbackClients || []);
  const [loading, setLoading] = useState(false);
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    if (isAiGenerated && campaignId) {
      setLoading(true);
      fetch(`/api/campaignAudiences/${campaignId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      })
          .then(res => res.json())
          .then(data => {
            if (data?.audience) {
              setClients(data.audience);
            }
          })
          .catch(err => console.error('Error loading ai audience:', err))
          .finally(() => setLoading(false));
    }
  }, [isAiGenerated, campaignId]);

  if (loading) return <LoadingSpinner />;

  return (
      <Card>
        <CardContent className="pt-2">
          <div className="space-y-6">
            <div>
              <Label>Estimated Reach</Label>
              <div className="p-4 border rounded-md mt-2 bg-muted/50">
                <p className="text-sm">Based on your current selection:</p>
                <p className="font-medium mt-1">{clients.length} clients will receive Ads from this campaign</p>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <Label>Client Preview</Label>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Users className="h-3 w-3 mr-1" />
                  {Math.min(10, clients.length)} of {clients.length} clients
                </Badge>
              </div>
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clients.slice(0, 10).map((client) => (
                        <TableRow key={String(client._id)}>
                          <TableCell>
                            {client.firstName} {client.lastName}
                          </TableCell>
                          <TableCell>{client.email}</TableCell>
                        </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
  );
}
