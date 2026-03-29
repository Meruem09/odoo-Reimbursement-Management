"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AuthFormWrapper } from "@/app/components/auth";
import { Button } from "@/app/components/ui/button";
import { AlertCircle, Loader2 } from "lucide-react";

function ErrorContent() {
    const searchParams = useSearchParams();
    const msg = searchParams.get("msg") || "An unexpected error occurred";

    return (
        <AuthFormWrapper title="Something went wrong">
            <div className="flex flex-col items-center text-center space-y-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
                    <AlertCircle className="size-7 text-destructive" />
                </div>

                <p className="text-sm text-muted-foreground max-w-xs">{msg}</p>

                <Link
                    href="/signIn"
                    id="error-back-btn"
                    className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90"
                >
                    Back to Sign In
                </Link>
            </div>
        </AuthFormWrapper>
    );
}

export default function ErrorPage() {
    return (
        <Suspense
            fallback={
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="size-6 animate-spin text-muted-foreground" />
                </div>
            }
        >
            <ErrorContent />
        </Suspense>
    );
}
