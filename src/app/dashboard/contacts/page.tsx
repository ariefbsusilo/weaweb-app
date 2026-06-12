import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button, buttonVariants } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { addContact, deleteContact } from "./actions"
import ImportContact from "./ImportContact"
import { Users } from "lucide-react"

export default async function ContactsPage(props: { searchParams: Promise<{ editId?: string }> }) {
  const searchParams = await props.searchParams;
  const session = await auth()
  const tenantId = (session as any)?.tenantId

  const recentContacts = await prisma.contact.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
    take: 5
  })

  let editContact = null;
  if (searchParams.editId) {
    editContact = await prisma.contact.findUnique({
      where: { id: searchParams.editId, tenantId }
    });
  }

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
      <div className="flex justify-between items-center bg-card p-6 rounded-[0.35rem] border border-border shadow-sm">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <Users className="w-8 h-8 text-primary" />
            Contacts
          </h2>
          <p className="text-muted-foreground mt-1 font-medium">Manage your imported contacts and segments.</p>
        </div>
        <ImportContact />
      </div>
      
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-card border border-border rounded-[0.35rem] overflow-hidden shadow-sm h-fit">
          <div className="p-4 border-b border-border bg-muted/20">
            <h3 className="font-extrabold text-foreground tracking-tight">Recently Added Contacts</h3>
            <p className="text-xs text-muted-foreground font-medium mt-1">Showing the last 5 contacts to maintain performance.</p>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="border-border">
                <TableHead className="font-bold text-foreground px-6 py-3">Name</TableHead>
                <TableHead className="font-bold text-foreground px-6 py-3">Phone</TableHead>
                <TableHead className="font-bold text-foreground px-6 py-3">Tags</TableHead>
                <TableHead className="font-bold text-foreground px-6 py-3 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentContacts.length === 0 ? (
                <TableRow className="border-border">
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8 font-medium">
                    No contacts found.
                  </TableCell>
                </TableRow>
              ) : recentContacts.map((contact) => (
                <TableRow key={contact.id} className="border-border hover:bg-muted/50 transition-colors">
                  <TableCell className="font-bold text-foreground px-6 py-3">{contact.name || "-"}</TableCell>
                  <TableCell className="font-mono text-muted-foreground px-6 py-3">{contact.phoneNumber}</TableCell>
                  <TableCell className="px-6 py-3">
                    {contact.tags ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-[0.25rem] text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary">
                        {contact.tags}
                      </span>
                    ) : "-"}
                  </TableCell>
                  <TableCell className="px-6 py-3 text-right flex items-center justify-end gap-2">
                    <a href={`/dashboard/contacts?editId=${contact.id}`} className={buttonVariants({ variant: "outline", size: "sm", className: "h-7 text-xs font-bold rounded-[0.25rem]" })}>
                      Edit
                    </a>
                    <form action={deleteContact}>
                      <input type="hidden" name="id" value={contact.id} />
                      <Button type="submit" variant="destructive" size="sm" className="h-7 text-xs font-bold rounded-[0.25rem]">
                        Delete
                      </Button>
                    </form>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="bg-card border border-border rounded-[0.35rem] p-6 h-fit shadow-sm">
          <h3 className="text-lg font-extrabold tracking-tight text-foreground mb-4">{editContact ? "Edit Contact" : "Add Contact"}</h3>
          <form action={addContact} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground font-bold">Name</Label>
              <Input id="name" name="name" defaultValue={editContact?.name || ""} placeholder="John Doe" className="border-border bg-background text-foreground rounded-[0.25rem] shadow-sm" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phoneNumber" className="text-foreground font-bold">Phone Number</Label>
              <Input id="phoneNumber" name="phoneNumber" defaultValue={editContact?.phoneNumber || ""} placeholder="+628123456789" required className="border-border bg-background text-foreground rounded-[0.25rem] shadow-sm" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags" className="text-foreground font-bold">Tags <span className="text-muted-foreground font-normal">(comma separated)</span></Label>
              <Input id="tags" name="tags" defaultValue={editContact?.tags || ""} placeholder="VIP, Customer" className="border-border bg-background text-foreground rounded-[0.25rem] shadow-sm" />
            </div>
            <div className="pt-2 flex gap-2">
              <Button type="submit" className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 font-bold rounded-[0.35rem] shadow-sm">Save Contact</Button>
              {editContact && (
                <a href="/dashboard/contacts" className={buttonVariants({ variant: "outline", className: "rounded-[0.35rem] font-bold" })}>
                  Cancel
                </a>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}


