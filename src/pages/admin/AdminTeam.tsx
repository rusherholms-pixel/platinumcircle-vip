import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { UserPlus, Shield, Trash2, Search } from "lucide-react";

interface AdminUser {
  user_id: string;
  role: string;
  profile?: { full_name: string; email: string; avatar_url: string | null };
}

export default function AdminTeam() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [searchEmail, setSearchEmail] = useState("");
  const [searchResult, setSearchResult] = useState<{ id: string; full_name: string; email: string } | null>(null);
  const [searching, setSearching] = useState(false);
  const [adding, setAdding] = useState(false);

  const fetchAdmins = async () => {
    setLoading(true);
    const { data: roles } = await supabase
      .from("user_roles")
      .select("user_id, role")
      .eq("role", "admin");

    if (roles && roles.length > 0) {
      const userIds = roles.map((r) => r.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, email, avatar_url")
        .in("id", userIds);

      const merged = roles.map((r) => ({
        ...r,
        profile: profiles?.find((p) => p.id === r.user_id) || undefined,
      }));
      setAdmins(merged);
    } else {
      setAdmins([]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchAdmins(); }, []);

  const handleSearch = async () => {
    if (!searchEmail.trim()) return;
    setSearching(true);
    setSearchResult(null);

    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .ilike("email", searchEmail.trim())
      .maybeSingle();

    if (data) {
      const alreadyAdmin = admins.some((a) => a.user_id === data.id);
      if (alreadyAdmin) {
        toast({ title: "Already an admin", description: `${data.email} already has admin access.`, variant: "destructive" });
      } else {
        setSearchResult(data);
      }
    } else {
      toast({ title: "User not found", description: "No account found with that email. They must have an existing account first.", variant: "destructive" });
    }
    setSearching(false);
  };

  const handleAdd = async () => {
    if (!searchResult) return;
    setAdding(true);

    const { error } = await supabase
      .from("user_roles")
      .insert({ user_id: searchResult.id, role: "admin" as any });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Admin added", description: `${searchResult.full_name} now has admin access.` });
      setAddOpen(false);
      setSearchEmail("");
      setSearchResult(null);
      fetchAdmins();
    }
    setAdding(false);
  };

  const handleRemove = async (userId: string) => {
    if (userId === user?.id) {
      toast({ title: "Cannot remove yourself", description: "You cannot revoke your own admin access.", variant: "destructive" });
      return;
    }

    const { error } = await supabase
      .from("user_roles")
      .delete()
      .eq("user_id", userId)
      .eq("role", "admin");

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Admin removed", description: "Admin access has been revoked." });
      fetchAdmins();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display text-foreground">Team Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage who has access to the admin dashboard</p>
        </div>

        <Dialog open={addOpen} onOpenChange={(o) => { setAddOpen(o); if (!o) { setSearchEmail(""); setSearchResult(null); } }}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-gold text-primary-foreground text-xs tracking-widest uppercase">
              <UserPlus size={14} className="mr-2" /> Add Admin
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="font-display">Add Admin Access</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-widest text-muted-foreground">Search by email</Label>
                <div className="flex gap-2">
                  <Input
                    value={searchEmail}
                    onChange={(e) => setSearchEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="bg-background border-border"
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  />
                  <Button variant="outline" size="icon" onClick={handleSearch} disabled={searching}>
                    <Search size={16} />
                  </Button>
                </div>
              </div>

              {searchResult && (
                <Card className="bg-background border-border">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">{searchResult.full_name}</p>
                      <p className="text-xs text-muted-foreground">{searchResult.email}</p>
                    </div>
                    <Button size="sm" onClick={handleAdd} disabled={adding} className="bg-gradient-gold text-primary-foreground text-xs">
                      {adding ? "Adding..." : "Grant Access"}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="ghost" className="text-muted-foreground">Cancel</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-sm font-display flex items-center gap-2">
            <Shield size={16} className="text-primary" /> Admin Team ({admins.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : admins.length === 0 ? (
            <p className="text-sm text-muted-foreground">No admins found.</p>
          ) : (
            <div className="divide-y divide-border">
              {admins.map((admin) => (
                <div key={admin.user_id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-xs font-semibold text-primary">
                        {admin.profile?.full_name?.[0] || "?"}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{admin.profile?.full_name || "Unknown"}</p>
                      <p className="text-xs text-muted-foreground">{admin.profile?.email || "—"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {admin.user_id === user?.id ? (
                      <Badge variant="outline" className="text-[9px] tracking-widest uppercase border-primary/30 text-primary">You</Badge>
                    ) : (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                            <Trash2 size={14} />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-card border-border">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove admin access?</AlertDialogTitle>
                            <AlertDialogDescription>
                              {admin.profile?.full_name} will lose access to the admin dashboard. They will retain their member account.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleRemove(admin.user_id)} className="bg-destructive text-destructive-foreground">
                              Remove Access
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
