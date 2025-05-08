'use client'

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Search } from "lucide-react";
import { UserRef } from "@/types/User";

export function TeamMemberSelector({
  users = [],
  selectedUsers = [],
  onChange,
}: {
  users?: UserRef[];
  selectedUsers?: UserRef[];
  onChange: (updated: UserRef[]) => void;
}) {
  const [userSearchQuery, setUserSearchQuery] = useState("");

  const toggleUser = (user: UserRef) => {
    const exists = selectedUsers.find((u) => u._id === user._id);
    if (exists) {
      onChange(selectedUsers.filter((u) => u._id !== user._id));
    } else {
      onChange([...selectedUsers, user]);
    }
  };

  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(userSearchQuery.toLowerCase())
  );  

  return (
    <div>
      <div className="relative">
        <div className="relative mb-4">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search team members..."
            className="pl-8"
            value={userSearchQuery}
            onChange={(e) => setUserSearchQuery(e.target.value)}
          />
        </div>
        <ScrollArea className="h-[300px] rounded-md border">
          <div className="p-4 space-y-2">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <div key={String(user._id)} className="flex items-center justify-between p-3 rounded-md border">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.username}</p>
                      <p className="text-sm text-muted-foreground">{user.role}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant={selectedUsers.some((u) => u._id === user._id) ? "secondary" : "outline"}
                    onClick={() => toggleUser(user)}
                    disabled={selectedUsers.some((u) => u._id === user._id)}
                  >
                    {selectedUsers.some((u) => u._id === user._id) ? "Added" : "Add"}
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                No team members found matching "{userSearchQuery}"
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      <div className="mt-4">
        <div className="flex justify-between items-center mb-2">
          <Label>Added Team Members</Label>
          <Badge variant="outline">{selectedUsers.length} members</Badge>
        </div>

        {selectedUsers.length > 0 ? (
          <div className="border rounded-md p-2 space-y-2">
            {selectedUsers.map((userId) => {
              const user = users.find((u) => u._id === userId._id)
              if (!user) return null

              return (
                <div
                  key={String(user._id)}
                  className="flex items-center justify-between p-2 bg-muted/30 rounded-md"
                >
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {user.username.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{user.username}</p>
                      <p className="text-xs text-muted-foreground">{user.role}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                    onClick={() => toggleUser(user)}
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Remove</span>
                  </Button>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="border rounded-md p-4 text-center text-muted-foreground">
            No team members added yet
          </div>
        )}
      </div>
    </div>
  );
}