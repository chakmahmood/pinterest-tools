export default function AppHeader() {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-6">
      <div>
        <h1 className="font-semibold text-lg">PinFlow</h1>
      </div>

      <div className="text-sm text-muted-foreground">Personal Edition</div>
    </header>
  );
}
