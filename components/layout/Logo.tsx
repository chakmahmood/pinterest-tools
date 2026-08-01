import Link from "next/link";

export default function Logo() {
  return (
    <Link href="/dashboard" className="flex items-center gap-2">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-600 text-white font-bold">
        P
      </div>

      <div>
        <p className="font-bold leading-none">PinFlow</p>
        <p className="text-xs text-muted-foreground">Pinterest Manager</p>
      </div>
    </Link>
  );
}
