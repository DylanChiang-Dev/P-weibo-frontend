import React from "react"
import { Card, CardContent, CardFooter, CardHeader } from "./ui/Card"
import { Skeleton } from "./ui/Skeleton"

export const PostSkeleton: React.FC = () => {
    return (
        <Card className="mb-4">
            <CardHeader className="flex flex-row items-center gap-3 py-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex flex-col gap-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                </div>
            </CardHeader>
            <CardContent className="py-2 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-48 w-full mt-3" />
            </CardContent>
            <CardFooter className="flex items-center justify-between py-2">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-8 w-16" />
                </div>
            </CardFooter>
        </Card>
    )
}
