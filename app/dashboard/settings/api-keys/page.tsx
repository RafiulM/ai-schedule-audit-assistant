"use client"

import * as React from "react"
import {
  IconKey,
  IconPlus,
  IconCopy,
  IconTrash,
  IconEye,
  IconEyeOff,
} from "@tabler/icons-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

interface ApiKey {
  id: string
  name: string
  key: string
  createdAt: string
  lastUsed: string
  status: "active" | "inactive"
}

const mockApiKeys: ApiKey[] = [
  {
    id: "1",
    name: "Production API Key",
    key: "sk-proj-abcd1234efgh5678ijkl9012mnop3456",
    createdAt: "2024-01-15",
    lastUsed: "2024-02-20",
    status: "active",
  },
  {
    id: "2",
    name: "Development API Key",
    key: "sk-proj-7890qrst1234uvwx5678yzab9012cdef",
    createdAt: "2024-02-01",
    lastUsed: "2024-02-19",
    status: "active",
  },
]

export default function ApiKeysPage() {
  const [apiKeys, setApiKeys] = React.useState<ApiKey[]>(mockApiKeys)
  const [showCreateDialog, setShowCreateDialog] = React.useState(false)
  const [newKeyName, setNewKeyName] = React.useState("")
  const [visibleKeys, setVisibleKeys] = React.useState<Set<string>>(new Set())

  const handleCreateApiKey = () => {
    if (!newKeyName.trim()) return

    const newKey: ApiKey = {
      id: Date.now().toString(),
      name: newKeyName,
      key: `sk-proj-${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
      createdAt: new Date().toISOString().split('T')[0],
      lastUsed: "Never",
      status: "active",
    }

    setApiKeys([...apiKeys, newKey])
    setNewKeyName("")
    setShowCreateDialog(false)
    toast.success("API key created successfully")
  }

  const handleDeleteKey = (id: string) => {
    setApiKeys(apiKeys.filter(key => key.id !== id))
    toast.success("API key deleted successfully")
  }

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key)
    toast.success("API key copied to clipboard")
  }

  const toggleKeyVisibility = (id: string) => {
    const newVisibleKeys = new Set(visibleKeys)
    if (newVisibleKeys.has(id)) {
      newVisibleKeys.delete(id)
    } else {
      newVisibleKeys.add(id)
    }
    setVisibleKeys(newVisibleKeys)
  }

  const maskKey = (key: string) => {
    return key.substring(0, 12) + "..." + key.substring(key.length - 4)
  }

  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="px-4 lg:px-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">API Keys</h1>
              <p className="text-muted-foreground">
                Manage your API keys for accessing external services
              </p>
            </div>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button>
                  <IconPlus className="mr-2 h-4 w-4" />
                  Create API Key
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New API Key</DialogTitle>
                  <DialogDescription>
                    Give your API key a descriptive name to help you identify its purpose.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">API Key Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Production API Key"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateApiKey}>Create Key</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="px-4 lg:px-6">
          <Card>
            <CardHeader>
              <CardTitle>API Keys</CardTitle>
              <CardDescription>
                These keys allow your applications to access external APIs. Keep them secure and never share them publicly.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>API Key</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Last Used</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apiKeys.map((apiKey) => (
                    <TableRow key={apiKey.id}>
                      <TableCell className="font-medium">{apiKey.name}</TableCell>
                      <TableCell className="font-mono text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">
                            {visibleKeys.has(apiKey.id) ? apiKey.key : maskKey(apiKey.key)}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => toggleKeyVisibility(apiKey.id)}
                          >
                            {visibleKeys.has(apiKey.id) ? (
                              <IconEyeOff className="h-3 w-3" />
                            ) : (
                              <IconEye className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={apiKey.status === "active" ? "default" : "secondary"}>
                          {apiKey.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{apiKey.createdAt}</TableCell>
                      <TableCell>{apiKey.lastUsed}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => handleCopyKey(apiKey.key)}
                          >
                            <IconCopy className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                            onClick={() => handleDeleteKey(apiKey.id)}
                          >
                            <IconTrash className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter>
              <p className="text-sm text-muted-foreground">
                <IconKey className="inline h-4 w-4 mr-1" />
                API keys are sensitive credentials. Store them securely and rotate them regularly.
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}