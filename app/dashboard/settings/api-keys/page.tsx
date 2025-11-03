export default function APIKeysPage() {
  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="px-4 lg:px-6">
          <h1 className="text-3xl font-bold tracking-tight">API Keys</h1>
          <p className="text-muted-foreground mt-2">
            Manage your API keys for accessing external services.
          </p>
        </div>

        <div className="px-4 lg:px-6">
          <div className="rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Your API Keys</h2>
            <p className="text-muted-foreground mb-4">
              No API keys have been generated yet. Create your first API key to get started.
            </p>
            <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors">
              Generate API Key
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}