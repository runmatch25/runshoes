// REMOVE "use client"
import { ReactNode } from "react";
import { Loader2 } from "lucide-react";

interface LoadingWrapperProps<TData> {
  data: TData | null | undefined;
  children: (data: TData) => ReactNode;
}

export default function LoadingWrapper<TData>({ data, children }: LoadingWrapperProps<TData>) {
  if (data === null || data === undefined) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children(data)}</>;
}
