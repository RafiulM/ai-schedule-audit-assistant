"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { IconKey, IconCopy, IconPlus, IconTrash } from "@tabler/icons-react"

export default function APIKeysPage() {
  // Mock data for API keys
  const apiKeys = [
    {
      id: "1",
      name: "Production API Key",
      key: "fake_prod_key_demo_abcdefghijklmnopqrstuvwxyz123456",
      createdAt: "2024-01-15",
      lastUsed: "2024-11-01",
      status: "active"
    },
    {
      id: "2",
      name: "Development API Key",
      key: "fake_dev_key_demo_zyxwvutsrqponmlkjihgfedcba654321",
      createdAt: "2024-01-10",
      lastUsed: "2024-10-28",
      status: "active"
    }
  ]

  const copyToClipboard = (key: string) => {
    navigator.clipboard.writeText(key)
  }

  const deleteKey = (id: string) => {
    // TODO: Implement delete functionality
    console.log("Delete key:", id)
  }

  const createNewKey = () => {
    // TODO: Implement create new key functionality
    console.log("Create new key")
  }

  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="px-4 lg:px-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">API Keys</h1>
              <p className="text-muted-foreground">
                Manage your API keys for accessing the application programmatically.
              </p>
            </div>
            <Button onClick={createNewKey} className="gap-2">
              <IconPlus className="h-4 w-4" />
              Create New Key
            </Button>
          </div>
        </div>

        <div className="px-4 lg:px-6">
          <div className="grid gap-6">
            {apiKeys.map((apiKey) => (
              <Card key={apiKey.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <IconKey className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <CardTitle className="text-lg">{apiKey.name}</CardTitle>
                        <CardDescription>
                          Created on {apiKey.createdAt} • Last used {apiKey.lastUsed}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant="secondary" className="gap-1">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      {apiKey.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="font-mono text-sm bg-muted px-3 py-2 rounded-md flex-1 mr-4">
                      {apiKey.key}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(apiKey.key)}
                        className="gap-2"
                      >
                        <IconCopy className="h-4 w-4" />
                        Copy
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteKey(apiKey.id)}
                        className="gap-2 text-destructive hover:text-destructive"
                      >
                        <IconTrash className="h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {apiKeys.length === 0 && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <IconKey className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No API keys yet</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Create your first API key to start accessing the application programmatically.
                  </p>
                  <Button onClick={createNewKey} className="gap-2">
                    <IconPlus className="h-4 w-4" />
                    Create Your First Key
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <div className="px-4 lg:px-6">
          <Card>
            <CardHeader>
              <CardTitle>API Key Security</CardTitle>
              <CardDescription>
                Important information about keeping your API keys secure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <h4 className="font-medium text-green-700 dark:text-green-400">Do's</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Store API keys in environment variables</li>
                    <li>• Use separate keys for different environments</li>
                    <li>• Rotate keys regularly</li>
                    <li>• Monitor key usage</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-red-700 dark:text-red-400">Don'ts</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Never share API keys publicly</li>
                    <li>• Don't commit keys to version control</li>
                    <li>• Avoid hardcoding keys in source code</li>
                    <li>• Don't use in client-side JavaScript</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}